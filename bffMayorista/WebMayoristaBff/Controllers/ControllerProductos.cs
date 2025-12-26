using System.Net.Http.Headers;     // AuthenticationHeaderValue
using System.Net.Http.Json;        // PostAsJsonAsync
using System.Text.Json;            // JsonSerializer, JsonElement
using Bff.Services;                // SessionStore, SessionInfo
using Microsoft.AspNetCore.Mvc;    // ControllerBase, ApiController, IActionResult, etc.

namespace Bff.Controllers;

[ApiController]
[Route("productos")] // base: /productos
public class ProductosController : ControllerBase
{
    // =============================================
    // Dependencias del BFF
    // =============================================
    private readonly IHttpClientFactory _httpClientFactory; // crea HttpClient "ApiReal"
    private readonly SessionStore _store;                   // sid -> SessionInfo (AccessToken, IdUsuario, etc.)
    private readonly IConfiguration _config;                // para leer Bff:CookieName, etc.

    public ProductosController(IHttpClientFactory httpClientFactory, SessionStore store, IConfiguration config)
    {
        _httpClientFactory = httpClientFactory;
        _store = store;
        _config = config;
    }

    // =============================================
    // DTOs MINIMOS para llamar a la API REAL
    // =============================================
    // Tu API real espera un body "ObtenerProductosWebParam" con:
    // - IdUsuario
    // - TextoBuscador
    // - SoloDisponible
    // - SoloOfertas
    // - FiltrosProductos { PageNumber, PageSize, ... }
    //
    // Acá armamos solo lo que necesitamos para que compile y funcione.
    // Si tu API real exige MÁS campos dentro de FiltrosProductos, los agregás acá.
    public class FiltrosProductosDto
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 0; // 0 = “traer todo” (la API real lo cambia a nMaxFilas)
    }

    public class ObtenerProductosWebParamDto
    {
        public string IdUsuario { get; set; } = "";
        public string TextoBuscador { get; set; } = ""; // filtro texto (vacío = sin filtro)
        public bool SoloDisponible { get; set; } = false;
        public bool SoloOfertas { get; set; } = false;
        public FiltrosProductosDto FiltrosProductos { get; set; } = new();
    }

    // =============================================
    // Helper: leer cookie -> buscar sesión
    // =============================================
    private bool TryGetSession(out SessionInfo session, out IActionResult? error)
    {
        // nombre de cookie configurable
        var cookieName = _config["Bff:CookieName"] ?? "bff.sid";

        // 1) leer cookie
        if (!Request.Cookies.TryGetValue(cookieName, out var sid) || string.IsNullOrWhiteSpace(sid))
        {
            session = default!;
            error = Unauthorized(new { message = "No autenticado (cookie faltante)." });
            return false;
        }

        // 2) validar sesión en store
        if (!_store.TryGet(sid, out session))
        {
            error = Unauthorized(new { message = "No autenticado (sesión inválida o vencida)." });
            return false;
        }

        error = null;
        return true;
    }

    // =============================================
    // Helper: crear HttpClient a la API real + Bearer token
    // =============================================
    private HttpClient BuildApiClient(SessionInfo session)
    {
        // "ApiReal" lo registraste en Program.cs con BaseAddress = Bff:ApiBaseUrl
        var api = _httpClientFactory.CreateClient("ApiReal");

        // la API real tiene [Authorize(JwtBearer)] -> necesita Authorization: Bearer <token>
        api.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", session.AccessToken);

        return api;
    }

    // =============================================
    // Helper: si la API real devuelve error como texto, intentamos devolver JSON si se puede
    // =============================================
    private static object TryJson(string content)
    {
        try { return JsonSerializer.Deserialize<JsonElement>(content); }
        catch { return content; }
    }

    // ==========================================================
    // ✅ GET /productos
    // TRAE TODOS LOS PRODUCTOS (sin filtros)
    // Internamente llama: POST API REAL /Productos/ObtenerProductos
    // con PageSize = 0 (la API real lo transforma a nMaxFilas)
    // ==========================================================
    [HttpGet]
    public async Task<IActionResult> ObtenerTodos(CancellationToken ct)
    {
        // 1) validar cookie + sesión
        if (!TryGetSession(out var session, out var err)) return err!;

        // 2) la API real valida usuario por IdUsuario, así que lo necesitamos sí o sí
        if (string.IsNullOrWhiteSpace(session.IdUsuario))
            return Unauthorized(new { message = "Sesión sin IdUsuario. Revisá que el login lo esté guardando." });

        // 3) armar HttpClient con Bearer token
        var api = BuildApiClient(session);

        // 4) armar body mínimo para traer TODO
        // - TextoBuscador vacío
        // - SoloDisponible false
        // - SoloOfertas false
        // - PageSize = 0  => la API real lo cambia a nMaxFilas y PageNumber = 1
        var body = new ObtenerProductosWebParamDto
        {
            IdUsuario = session.IdUsuario!,
            TextoBuscador = "",
            SoloDisponible = false,
            SoloOfertas = false,
            FiltrosProductos = new FiltrosProductosDto
            {
                PageNumber = 1,
                PageSize = 0
            }
        };

        // 5) llamar a la API real
        var resp = await api.PostAsJsonAsync("Productos/ObtenerProductos", body, ct);

        // 6) leer respuesta como texto para devolver “tal cual”
        var raw = await resp.Content.ReadAsStringAsync(ct);

        // 7) si la API real falló, devolvemos el mismo status + el body
        if (!resp.IsSuccessStatusCode)
            return StatusCode((int)resp.StatusCode, TryJson(raw));

        // 8) OK: devolvemos exactamente el JSON que arma la API real:
        // {
        //   Paginacion: {...},
        //   Productos: [...],
        //   filtrosAdic: {...}
        // }
        return Content(raw, "application/json");
    }

    // ==========================================================
    // (Opcional) GET /productos/pagina
    // Si querés paginar desde el front (sin “filtros” de rubro/categorías),
    // podés usar este endpoint.
    // ==========================================================
    [HttpGet("pagina")]
    public async Task<IActionResult> ObtenerPaginado(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken ct = default)
    {
        if (!TryGetSession(out var session, out var err)) return err!;
        if (string.IsNullOrWhiteSpace(session.IdUsuario))
            return Unauthorized(new { message = "Sesión sin IdUsuario. Revisá login." });

        var api = BuildApiClient(session);

        var body = new ObtenerProductosWebParamDto
        {
            IdUsuario = session.IdUsuario!,
            TextoBuscador = "",
            SoloDisponible = false,
            SoloOfertas = false,
            FiltrosProductos = new FiltrosProductosDto
            {
                PageNumber = pageNumber < 1 ? 1 : pageNumber,
                PageSize = pageSize < 0 ? 50 : pageSize
            }
        };

        var resp = await api.PostAsJsonAsync("Productos/ObtenerProductos", body, ct);
        var raw = await resp.Content.ReadAsStringAsync(ct);

        if (!resp.IsSuccessStatusCode)
            return StatusCode((int)resp.StatusCode, TryJson(raw));

        return Content(raw, "application/json");
    }
}
