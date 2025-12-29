// este bloque es la comunicacion con el bff pero como no pude obtener los productos los simuno 
// // src/services/productosService.js
// import API from "../services/Services"; 
// // 👆 ajustá el path si tu Services.js está en otro lugar
// // Ejemplo: si este archivo está en src/services y tu axios está en src/api/Services.js, esto está OK.

// export const getProductos = async ({
//   texto = "",
//   disponible = false,
//   ofertas = false,
//   pageNumber = 1,
//   pageSize = 50, // 0 => “traer todo” (backend real lo transforma)
// } = {}) => {
//   const res = await API.get("/productos/obtener", {
//     params: { texto, disponible, ofertas, pageNumber, pageSize },
//   });
//   return res.data;
// };

// export const getListasFiltros = async () => {
//   const res = await API.get("/productos/listas-filtros");
//   return res.data;
// };

// export const getBannerInfo = async () => {
//   const res = await API.get("/productos/banner");
//   return res.data;
// };



// src/services/ProductoServices.js
import API from "./Services"; // tu axios instance del BFF
import { getProductosMock } from "./moks/productosDb";

/**
 * getProductos
 * - Mock siempre si VITE_FORCE_PRODUCTOS_MOCK=true
 * - Si no, intenta backend
 * - Si backend falla o viene vacío/sin estructura, fallback a mock SIEMPRE
 *   (funciona igual en dev, preview, prod, PWA, etc.)
 */
export const getProductos = async ({
  texto = "",
  disponible = false,
  ofertas = false,
  pageNumber = 1,
  pageSize = 50,
} = {}) => {
  const FORCE_MOCK = import.meta?.env?.VITE_FORCE_PRODUCTOS_MOCK === "true";

  // 1) Mock forzado
  if (FORCE_MOCK) {
    return getProductosMock({ texto, disponible, ofertas, pageNumber, pageSize });
  }

  // 2) Intento backend + fallback universal
  try {
    const res = await API.get("/productos/obtener", {
      params: { texto, disponible, ofertas, pageNumber, pageSize },
    });

    const data = res?.data;

    // Validación mínima de estructura esperada
    const productos = Array.isArray(data?.Productos) ? data.Productos : null;

    // Si no viene estructura o viene vacío => fallback mock
    if (!productos || productos.length === 0) {
      return getProductosMock({ texto, disponible, ofertas, pageNumber, pageSize });
    }

    return data;
  } catch (err) {
    // Si falla request => fallback mock siempre
    return getProductosMock({ texto, disponible, ofertas, pageNumber, pageSize });
  }
};
