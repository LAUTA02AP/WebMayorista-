using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Bff.Services;
using Microsoft.AspNetCore.Mvc;

namespace Bff.Controllers;

[ApiController]
[Route("user")]
public class UserController : ControllerBase
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly SessionStore _store;
    private readonly IConfiguration _config;

    public UserController(IHttpClientFactory httpClientFactory, SessionStore store, IConfiguration config)
    {
        _httpClientFactory = httpClientFactory;
        _store = store;
        _config = config;
    }

    public record ObtenerClienteRequest(string IdUsuario);
    public record ObtenerClienteResponse(string NombreUsuario, decimal Saldo);

    [HttpGet]
    public async Task<IActionResult> GetCurrentUser(CancellationToken ct)
    {
        var cookieName = _config["Bff:CookieName"] ?? "bff.sid";

        if (!Request.Cookies.TryGetValue(cookieName, out var sid) || string.IsNullOrWhiteSpace(sid))
            return Unauthorized(new { message = "No autenticado (cookie faltante)." });

        if (!_store.TryGet(sid, out var session))
            return Unauthorized(new { message = "No autenticado (sesión inválida o vencida)." });

        // base payload
        var basePayload = new
        {
            rolUsuario = session.RolUsuario,
            idUsuario = session.IdUsuario,
            expiresAt = session.ExpiresAt,
            cliente = (object?)null
        };

        // ✅ ROL 1 -> trae saldo
        if (string.Equals(session.RolUsuario, "1", StringComparison.OrdinalIgnoreCase))
        {
            var api = _httpClientFactory.CreateClient("ApiReal");
            api.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", session.AccessToken);

            var body = new ObtenerClienteRequest(session.IdUsuario ?? "");
            var resp = await api.PostAsJsonAsync("Usuarios/ObtenerCliente", body, ct);

            if (resp.IsSuccessStatusCode)
            {
                var cliente = await resp.Content.ReadFromJsonAsync<ObtenerClienteResponse>(cancellationToken: ct);

                return Ok(new
                {
                    rolUsuario = session.RolUsuario,
                    idUsuario = session.IdUsuario,
                    expiresAt = session.ExpiresAt,
                    cliente = new
                    {
                        nombreUsuario = cliente?.NombreUsuario,
                        saldo = cliente?.Saldo
                    }
                });
            }

            if (resp.StatusCode == HttpStatusCode.NotFound)
                return Ok(basePayload);

            var raw = await resp.Content.ReadAsStringAsync(ct);
            return StatusCode((int)resp.StatusCode, raw);
        }

        return Ok(basePayload);
    }
}


