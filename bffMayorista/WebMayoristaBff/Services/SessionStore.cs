using System.Collections.Concurrent;

namespace Bff.Services;

public class SessionInfo
{
    public string AccessToken { get; init; } = "";
    public DateTimeOffset ExpiresAt { get; init; }

    // Datos “extra” que quieras exponer al front en /auth/me
    public string? RolUsuario { get; init; }
    public string? IdUsuario { get; init; }

    // Guardamos el JSON completo que devuelve tu API (por si lo querés)
    public string? RawLoginResponseJson { get; init; }
}

public class SessionStore
{
    private readonly ConcurrentDictionary<string, SessionInfo> _sessions = new();

    public bool TryGet(string sid, out SessionInfo session)
    {
        if (_sessions.TryGetValue(sid, out session!))
        {
            if (session.ExpiresAt > DateTimeOffset.UtcNow)
                return true;

            _sessions.TryRemove(sid, out _);
        }
        return false;
    }

    public void Set(string sid, SessionInfo session) => _sessions[sid] = session;

    public void Remove(string sid) => _sessions.TryRemove(sid, out _);
}
