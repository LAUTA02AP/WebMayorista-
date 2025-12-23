using Bff.Services;

var builder = WebApplication.CreateBuilder(args);

// =============================================
// Controllers
// =============================================
builder.Services.AddControllers();

// =============================================
// Swagger (DEV)
// =============================================
// # ACA AGREGA SWAGGER
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// =============================================
// SessionStore — sesiones del BFF en memoria
// =============================================
builder.Services.AddSingleton<SessionStore>();

// =============================================
// HttpClient → API REAL
// =============================================
builder.Services.AddHttpClient("ApiReal", client =>
{
    // # ACA VA LA RUTA DEL BACK (TU API REAL)
    var apiBase = builder.Configuration["Bff:ApiBaseUrl"];
    client.BaseAddress = new Uri(apiBase!);
});

// =============================================
// CORS + COOKIES (OBLIGATORIO PARA COOKIE HttpOnly)
// =============================================
builder.Services.AddCors(options =>
{
    options.AddPolicy("frontend", policy =>
    {
        // # ACA CONFIGURAS CORS (ORIGEN DEL FRONT)
        var front = builder.Configuration["Bff:FrontendOrigin"] ?? "http://localhost:5173";

        policy
            .WithOrigins(front)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// =============================================
// YARP Reverse Proxy
// =============================================
builder.Services
    .AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

var app = builder.Build();

// =============================================
// Swagger UI (solo DEV)  -> /swagger
// =============================================
if (app.Environment.IsDevelopment())
{
    // # ACA HABILITA SWAGGER
    app.UseSwagger();
    app.UseSwaggerUI();
}

// =============================================
// HTTPS redirection (prod)
// =============================================
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

// =============================================
// Routing + CORS (orden importante)
// =============================================
app.UseRouting();

// # ACA CORS ANTES DE MAPEAR ENDPOINTS
app.UseCors("frontend");

// =============================================
// Controllers (/auth/*)
// =============================================
app.MapControllers().RequireCors("frontend");

// =============================================
// PROXY /api/* -> API + AGREGA Authorization DESDE SESSION COOKIE
// =============================================
app.MapReverseProxy(proxyPipeline =>
{
    proxyPipeline.Use(async (context, next) =>
    {
        // # ACA: dejar pasar preflight OPTIONS
        if (HttpMethods.IsOptions(context.Request.Method))
        {
            context.Response.StatusCode = StatusCodes.Status204NoContent;
            return;
        }

        var store = context.RequestServices.GetRequiredService<SessionStore>();
        var cfg = context.RequestServices.GetRequiredService<IConfiguration>();

        var cookieName = cfg["Bff:CookieName"] ?? "bff.sid";

        if (!context.Request.Cookies.TryGetValue(cookieName, out var sid) || string.IsNullOrWhiteSpace(sid))
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            await context.Response.WriteAsync("No autenticado (cookie faltante).");
            return;
        }

        if (!store.TryGet(sid, out var session))
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            await context.Response.WriteAsync("No autenticado (sesión vencida o inválida).");
            return;
        }

        // # ACA: seguridad: no dejes que el front “inyecte” su Authorization
        context.Request.Headers.Remove("Authorization");

        // # ACA: se inyecta token hacia la API real
        context.Request.Headers["Authorization"] = $"Bearer {session.AccessToken}";

        await next();
    });
})
.RequireCors("frontend");

app.Run();


