// Bff/Controllers/ProductosController.cs
using System.Net.Http.Headers;   // AuthenticationHeaderValue
using System.Net.Http.Json;      // PostAsJsonAsync
using System.Text.Json;          // JsonSerializer, JsonElement
using Bff.Services;              // SessionStore, SessionInfo
using Microsoft.AspNetCore.Mvc;  // ControllerBase, ApiController, IActionResult

namespace Bff.Controllers;

[ApiController]
[Route("productos")] // ✅ base: /productos  (esto es lo que consume React)
public class ProductosController : ControllerBase
{
    // ==========================================================
    // Dependencias
    // ==========================================================
    private readonly IHttpClientFactory _httpClientFactory; // crea HttpClient "ApiReal"
    private readonly SessionStore _store;                   // sid -> SessionInfo (AccessToken, IdUsuario, etc.)
    private readonly IConfiguration _config;                // config (Bff:CookieName)

    public ProductosController(IHttpClientFactory httpClientFactory, SessionStore store, IConfiguration config)
    {
        _httpClientFactory = httpClientFactory;
        _store = store;
        _config = config;
    }

    // ==========================================================
    // Helper: devuelve JSON si se puede, sino texto
    // ==========================================================
    private static object TryJson(string content)
    {
        try { return JsonSerializer.Deserialize<JsonElement>(content); }
        catch { return content; }
    }

    // ==========================================================
    // Helper: leer cookie + buscar sesión en store
    // ==========================================================
    private bool TryGetSession(out SessionInfo session, out IActionResult? error)
    {
        var cookieName = _config["Bff:CookieName"] ?? "bff.sid";

        // 1) cookie
        if (!Request.Cookies.TryGetValue(cookieName, out var sid) || string.IsNullOrWhiteSpace(sid))
        {
            session = default!;
            error = Unauthorized(new { message = "No autenticado (cookie faltante)." });
            return false;
        }

        // 2) store
        if (!_store.TryGet(sid, out session))
        {
            error = Unauthorized(new { message = "No autenticado (sesión inválida o vencida)." });
            return false;
        }

        // 3) IdUsuario es obligatorio porque tu API real lo valida con ValidateUserAsync
        if (string.IsNullOrWhiteSpace(session.IdUsuario))
        {
            error = Unauthorized(new { message = "Sesión sin IdUsuario. Revisá que el login lo esté guardando." });
            return false;
        }

        error = null;
        return true;
    }

    // ==========================================================
    // Helper: crear HttpClient hacia API real + Bearer token
    // ==========================================================
    private HttpClient BuildApiClient(SessionInfo session)
    {
        var api = _httpClientFactory.CreateClient("ApiReal");
        api.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", session.AccessToken);

        return api;
    }

    // ==========================================================
    // GET /productos/obtener
    // Mantiene compatibilidad con tu axios actual:
    //
    // API.get("/productos/obtener", { params: { texto, disponible, ofertas, pageNumber, pageSize } })
    //
    // Internamente llama:
    // POST API REAL  Productos/ObtenerProductos
    // con body compatible con ObtenerProductosWebParam:
    // {
    //   IdUsuario, TextoBuscador, SoloDisponible, SoloOfertas,
    //   FiltrosProductos: { PageNumber, PageSize }
    // }
    // ==========================================================
    [HttpGet("obtener")]
    public async Task<IActionResult> Obtener(
        [FromQuery] string texto = "",
        [FromQuery] bool disponible = false,
        [FromQuery] bool ofertas = false,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken ct = default)
    {
        // 1) validar sesión del BFF
        if (!TryGetSession(out var session, out var err)) return err!;

        // 2) HttpClient hacia API real con Bearer token
        var api = BuildApiClient(session);

        // 3) armar body tal como espera tu API real (sin clases/DTOs)
        // OJO: tu API real si PageSize==0 trae TODO (lo reemplaza por nMaxFilas)
        var body = new
        {
            IdUsuario = session.IdUsuario,
            TextoBuscador = texto ?? "",
            SoloDisponible = disponible,
            SoloOfertas = ofertas,
            FiltrosProductos = new
            {
                PageNumber = pageNumber < 1 ? 1 : pageNumber,
                PageSize = pageSize < 0 ? 50 : pageSize
            }
        };

        // 4) llamar a la API real
        var resp = await api.PostAsJsonAsync("Productos/ObtenerProductos", body, ct);

        // 5) passthrough de la respuesta
        var raw = await resp.Content.ReadAsStringAsync(ct);

        if (!resp.IsSuccessStatusCode)
            return StatusCode((int)resp.StatusCode, TryJson(raw));

        // Devuelve el JSON real:
        // { Paginacion: {...}, Productos: [...], filtrosAdic: {...} }
        return Content(raw, "application/json");
    }

    // ==========================================================
    // GET /productos/listas-filtros
    // Tu axios actual llama: API.get("/productos/listas-filtros")
    //
    // Internamente llama:
    // GET API REAL Productos/ObtenerListasFiltros
    // ==========================================================
    [HttpGet("listas-filtros")]
    public async Task<IActionResult> ListasFiltros(CancellationToken ct)
    {
        if (!TryGetSession(out var session, out var err)) return err!;
        var api = BuildApiClient(session);

        var resp = await api.GetAsync("Productos/ObtenerListasFiltros", ct);
        var raw = await resp.Content.ReadAsStringAsync(ct);

        if (!resp.IsSuccessStatusCode)
            return StatusCode((int)resp.StatusCode, TryJson(raw));

        return Content(raw, "application/json");
    }

    // ==========================================================
    // ✅ GET /productos/banner
    // Tu axios actual llama: API.get("/productos/banner")
    //
    // Internamente llama:
    // GET API REAL Productos/ObtenerBannerInfo
    // ==========================================================
    [HttpGet("banner")]
    public async Task<IActionResult> Banner(CancellationToken ct)
    {
        if (!TryGetSession(out var session, out var err)) return err!;
        var api = BuildApiClient(session);

        var resp = await api.GetAsync("Productos/ObtenerBannerInfo", ct);
        var raw = await resp.Content.ReadAsStringAsync(ct);

        if (!resp.IsSuccessStatusCode)
            return StatusCode((int)resp.StatusCode, TryJson(raw));

        return Content(raw, "application/json");
    }
}
