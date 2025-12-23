using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Bff.Services;
using Microsoft.AspNetCore.Mvc;

namespace Bff.Controllers;

[ApiController]
[Route("auth")]
public class AuthController : ControllerBase
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly SessionStore _store;
    private readonly IConfiguration _config;
    private readonly IWebHostEnvironment _env;

    public AuthController(IHttpClientFactory httpClientFactory, SessionStore store, IConfiguration config, IWebHostEnvironment env)
    {
        _httpClientFactory = httpClientFactory;
        _store = store;
        _config = config;
        _env = env;
    }

    public class LoginRequest
    {
        public string UserName { get; set; } = "";
        public string Password { get; set; } = "";
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        var api = _httpClientFactory.CreateClient("ApiReal");

        // # ACA: endpoint real de login en tu API
        var resp = await api.PostAsJsonAsync("Usuarios/Login", req);

        var raw = await resp.Content.ReadAsStringAsync();

        if (!resp.IsSuccessStatusCode)
            return StatusCode((int)resp.StatusCode, TryJson(raw));

        JsonElement root;
        try
        {
            root = JsonSerializer.Deserialize<JsonElement>(raw);
        }
        catch
        {
            return StatusCode((int)HttpStatusCode.BadGateway, "La API devolvió algo que no es JSON.");
        }

        // # ACA: soporta Token/token/accessToken por si cambia el nombre
        string? token = null;
        if (TryGetAny(root, out var tokenEl, "Token", "token", "accessToken", "AccessToken"))
            token = tokenEl.ValueKind == JsonValueKind.String ? tokenEl.GetString() : tokenEl.ToString();

        if (string.IsNullOrWhiteSpace(token))
            return StatusCode((int)HttpStatusCode.BadGateway, "La API no devolvió token en el login.");

        var rol = TryGetAny(root, out var rolEl, "RolUsuario", "rolUsuario", "role", "Role")
            ? (rolEl.ValueKind == JsonValueKind.String ? rolEl.GetString() : rolEl.ToString())
            : null;

        var idUsuario = TryGetAny(root, out var idEl, "IdUsuario", "idUsuario", "userId", "UserId")
            ? (idEl.ValueKind == JsonValueKind.String ? idEl.GetString() : idEl.ToString())
            : null;

        var sid = Guid.NewGuid().ToString("N");

        var minutes = _config.GetValue<int?>("Bff:SessionMinutes") ?? 60;
        var expires = DateTimeOffset.UtcNow.AddMinutes(minutes);

        _store.Set(sid, new SessionInfo
        {
            AccessToken = token!,
            ExpiresAt = expires,
            RolUsuario = rol,
            IdUsuario = idUsuario,
            RawLoginResponseJson = raw
        });

        var cookieName = _config["Bff:CookieName"] ?? "bff.sid";

        // # ACA: lógica de cookie según “site”
        var options = BuildCookieOptions(expires);

        // Si el front está en otro “site” y estás en HTTP, el browser NO va a aceptar SameSite=None
        if (options.SameSite == SameSiteMode.None && !Request.IsHttps)
        {
            return Problem(
                "Estás intentando cookie cross-site en HTTP. " +
                "Solución: usar HTTPS en BFF+front, o usar proxy del dev-server del front para que quede same-site."
            );
        }

        Response.Cookies.Append(cookieName, sid, options);

        return Ok(new
        {
            RolUsuario = rol,
            IdUsuario = idUsuario,
            ExpiresAt = expires
        });
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        var cookieName = _config["Bff:CookieName"] ?? "bff.sid";

        if (Request.Cookies.TryGetValue(cookieName, out var sid) && !string.IsNullOrWhiteSpace(sid))
            _store.Remove(sid);

        // # ACA: borrar con opciones coherentes
        Response.Cookies.Delete(cookieName, new CookieOptions
        {
            Path = "/",
            HttpOnly = true,
            Secure = Request.IsHttps,
            SameSite = BuildCookieOptions(DateTimeOffset.UtcNow).SameSite
        });

        return Ok(new { ok = true });
    }

    [HttpGet("me")]
    public IActionResult Me()
    {
        var cookieName = _config["Bff:CookieName"] ?? "bff.sid";

        if (!Request.Cookies.TryGetValue(cookieName, out var sid) || string.IsNullOrWhiteSpace(sid))
            return Unauthorized();

        if (!_store.TryGet(sid, out var session))
            return Unauthorized();

        return Ok(new
        {
            session.RolUsuario,
            session.IdUsuario,
            session.ExpiresAt
        });
    }

    private CookieOptions BuildCookieOptions(DateTimeOffset expires)
    {
        var front = _config["Bff:FrontendOrigin"] ?? "http://localhost:5173";

        bool crossSite = false;
        try
        {
            var frontUri = new Uri(front);

            // # ACA: “schemeful same-site” (si cambia http/https también cuenta)
            crossSite =
                !string.Equals(frontUri.Host, Request.Host.Host, StringComparison.OrdinalIgnoreCase) ||
                !string.Equals(frontUri.Scheme, Request.Scheme, StringComparison.OrdinalIgnoreCase);
        }
        catch { }

        return new CookieOptions
        {
            HttpOnly = true,
            Path = "/",
            Expires = expires,

            // # ACA: si es cross-site => None (requiere HTTPS)
            SameSite = crossSite ? SameSiteMode.None : SameSiteMode.Lax,

            // # ACA: Secure true cuando estás en HTTPS (en prod siempre HTTPS)
            Secure = Request.IsHttps
        };
    }

    private static bool TryGetAny(JsonElement root, out JsonElement value, params string[] names)
    {
        foreach (var n in names)
        {
            if (root.TryGetProperty(n, out value))
                return true;
        }
        value = default;
        return false;
    }

    private static object TryJson(string content)
    {
        try { return JsonSerializer.Deserialize<JsonElement>(content); }
        catch { return content; }
    }
}

