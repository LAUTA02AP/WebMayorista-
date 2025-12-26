// src/services/mocks/pedidosDb.js

const keyPedidos = (dni) => `mockdb_pedidos_${dni}`;

const ESTADOS = ["Pendiente", "Preparación", "Enviado", "Entregado"];

function seedFromDni(dni) {
  const clean = String(dni ?? "").replace(/\D/g, "");
  return clean ? parseInt(clean.slice(-6), 10) : 123456;
}

function generarPedidos(dni, min = 10) {
  const seed = seedFromDni(dni);
  const hoy = new Date();

  const pedidos = Array.from({ length: Math.max(min, 10) }, (_, i) => {
    const Id = seed * 100 + (i + 1);
    const Fecha = new Date(hoy);
    Fecha.setDate(hoy.getDate() - (i * 2 + (seed % 7))); // escalonados

    const Total = Number((1500 + ((seed + i * 377) % 9000) + i * 33.33).toFixed(2));

    return {
      Id,
      Dni: String(dni),
      Fecha: Fecha.toISOString(),
      Total,
      Estado: ESTADOS[i % ESTADOS.length],
      Items: [
        { sku: `SKU-${Id}-A`, nombre: "Producto A", qty: 1, precio: 999.9 },
        { sku: `SKU-${Id}-B`, nombre: "Producto B", qty: 2, precio: 499.5 },
      ],
    };
  });

  // más nuevos primero
  return pedidos.sort((a, b) => new Date(b.Fecha) - new Date(a.Fecha));
}

export function ensurePedidos(dni, min = 10) {
  const key = keyPedidos(dni);
  const raw = localStorage.getItem(key);

  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length >= min) return parsed;

      const base = Array.isArray(parsed) ? parsed : [];
      const faltan = Math.max(min, 10) - base.length;

      const extra = generarPedidos(dni, faltan).map((p, idx) => ({
        ...p,
        Id: (base?.[0]?.Id ?? seedFromDni(dni) * 100) + 1000 + idx,
      }));

      const merged = [...base, ...extra].sort(
        (a, b) => new Date(b.Fecha) - new Date(a.Fecha)
      );

      localStorage.setItem(key, JSON.stringify(merged));
      return merged;
    } catch {
      // si está corrupto, lo regenero abajo
    }
  }

  const created = generarPedidos(dni, min);
  localStorage.setItem(key, JSON.stringify(created));
  return created;
}

export function getPedidosPorDniMock(dni) {
  return ensurePedidos(dni, 10);
}

export function updatePedidoMock(dni, idPedido, patch) {
  const pedidos = ensurePedidos(dni, 10);

  const updatedList = pedidos.map((p) => {
    if (String(p.Id) !== String(idPedido)) return p;
    return {
      ...p,
      ...(patch?.Fecha ? { Fecha: patch.Fecha } : null),
      ...(patch?.Total !== undefined ? { Total: patch.Total } : null),
      ...(patch?.Estado ? { Estado: patch.Estado } : null),
    };
  });

  localStorage.setItem(keyPedidos(dni), JSON.stringify(updatedList));
  return updatedList.find((p) => String(p.Id) === String(idPedido)) ?? null;
}

// opcional para testing
export function resetPedidosMock(dni) {
  localStorage.removeItem(keyPedidos(dni));
}
