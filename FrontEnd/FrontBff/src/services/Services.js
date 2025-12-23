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
// (esto lo vas adaptando de a poco)
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

export const getPedidosPorDni = async (dni) => {
  const res = await API.get("/api/sistema/pedidos", {
    params: { dni: Number(dni) },
  });
  return res.data;
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
