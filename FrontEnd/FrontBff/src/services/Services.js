// src/api/Services.js
import axios from "axios";

// ✅ URL DEL BFF (la que ves en swagger, sin /swagger)
const BFF_URL = "https://localhost:44324";

const API = axios.create({
  baseURL: BFF_URL,
  withCredentials: true, // ✅ cookies HttpOnly
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 15000,
});

// Debug útil (opcional)
API.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response) {
      console.error(
        "[BFF]",
        err.response.status,
        err.response.config?.url,
        err.response.data
      );
    } else {
      console.error("[BFF NO RESPONSE]", err.message);
      console.error(
        "Tip: abrí https://localhost:44324/swagger y aceptá el certificado HTTPS si aparece warning."
      );
    }
    return Promise.reject(err);
  }
);

// =====================================================================
// ✅ TU CÓDIGO REAL (NO SIMULADO) - BFF / API
// =====================================================================

// =====================================================================
// AUTH (LOGIN / USER / LOGOUT) - compatible con tu BFF
// =====================================================================

export const loginUser = async (username, password) => {
  // ✅ tu BFF espera { userName, password }
  const res = await API.post("/auth/login", { userName: username, password });
  return res.data;
};

// ✅ este endpoint lo sirve el BFF (UserController): GET /user
export const getUserInfo = async () => {
  const res = await API.get("/user");
  return res.data;
};

export const logoutUser = async () => {
  const res = await API.post("/auth/logout");
  return res.data;
};

// =====================================================================
// SISTEMA -> vía YARP (/api/*)
// =====================================================================

export const getClientesVendedor = async () => {
  const res = await API.get("/api/sistema/clientes-vendedor");
  return res.data;
};

export const getSaldoCliente = async (dni) => {
  const res = await API.get("/api/sistema/saldo-cliente", {
    params: { dni: Number(dni) },
  });
  return res.data;
};

/**
 * ✅ GET pedidos por DNI
 * - Intenta traer del BFF.
 * - Si en DEV falla (o devuelve vacío), hace fallback a pedidos simulados (localStorage)
 * - En PROD, respeta lo que venga del BFF (aunque sea vacío) y no simula.
 */
export const getPedidosPorDni = async (dni) => {
  const dniNum = Number(dni);

  // Si querés forzar mock manualmente:
  const FORCE_MOCK = import.meta?.env?.VITE_FORCE_PEDIDOS_MOCK === "true";
  if (FORCE_MOCK) return getPedidosMock(dniNum);

  try {
    const res = await API.get("/api/sistema/pedidos", {
      params: { dni: dniNum },
    });

    const data = res.data;

    // ✅ si ya hay pedidos reales
    if (Array.isArray(data) && data.length > 0) return data;

    // ⚠️ si viene vacío y estás en DEV -> mock para probar DataTable
    if (import.meta?.env?.DEV) return getPedidosMock(dniNum);

    // PROD: devolvé lo que sea (array o [])
    return Array.isArray(data) ? data : [];
  } catch (err) {
    // DEV: si falla endpoint / certificado / red -> mock
    if (import.meta?.env?.DEV) return getPedidosMock(dniNum);
    throw err;
  }
};

export const getClientePorDni = async (dni) => {
  const res = await API.get("/api/sistema/cliente", {
    params: { dni: Number(dni) },
  });
  return res.data;
};

export const getDetallePedido = async (idPedido) => {
  const res = await API.get("/api/sistema/detalle-pedido", {
    params: { idPedido: Number(idPedido) },
  });
  return res.data;
};

export const getProductos = async () => {
  const res = await API.get("/api/sistema/productos");
  return res.data;
};

export const updatePedido = async (idPedido, payload) => {
  const res = await API.put(`/api/sistema/pedidos/${Number(idPedido)}`, payload);
  return res.data;
};

export default API;

// =====================================================================
// ############ PEDIDOS SIMULADOS (SOLO PARA DEV / FALLBACK) ############
// =====================================================================
// - Persisten en localStorage por DNI.
// - Genera mínimo 10 pedidos.
// - Campos compatibles con tu DataTable: { Id, Fecha, Total }
// - Cuando el BFF tenga pedidos reales, getPedidosPorDni usa esos y no esto.

// =====================================================================
// ############ PEDIDOS SIMULADOS (GLOBAL, SIN DNI) ############
// =====================================================================

const PEDIDOS_GLOBAL_KEY = "mock_pedidos_global";

function generarPedidosGlobal(min = 10) {
  const hoy = new Date();

  const pedidos = Array.from({ length: Math.max(10, min) }, (_, i) => {
    const Id = 1000 + (i + 1);

    const Fecha = new Date(hoy);
    Fecha.setDate(hoy.getDate() - i * 2);

    const Total = Number((1500 + i * 237.45).toFixed(2));

    return { Id, Fecha: Fecha.toISOString(), Total };
  });

  // más nuevos primero
  return pedidos.sort((a, b) => new Date(b.Fecha) - new Date(a.Fecha));
}

function ensurePedidosGlobal(min = 10) {
  const raw = localStorage.getItem(PEDIDOS_GLOBAL_KEY);

  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length >= min) return parsed;
    } catch {
      // si está corrupto, regenero abajo
    }
  }

  const created = generarPedidosGlobal(min);
  localStorage.setItem(PEDIDOS_GLOBAL_KEY, JSON.stringify(created));
  return created;
}

// ✅ ESTE ES EL ÚNICO EXPORT QUE VAS A USAR EN LA PAGE
export const getPedidosSimulados = async () => {
  return ensurePedidosGlobal(10);
};