// src/services/productosService.js
import API from "./Services"; // o desde donde exportes el axios instance

export const getProductos = async ({
  texto = "",
  disponible = false,
  ofertas = false,
  pageNumber = 1,
  pageSize = 50,
} = {}) => {
  const res = await API.get("/productos/obtener", {
    params: { texto, disponible, ofertas, pageNumber, pageSize },
  });
  return res.data;
};

export const getListasFiltros = async () => {
  const res = await API.get("/productos/listas-filtros");
  return res.data;
};

export const getBannerInfo = async () => {
  const res = await API.get("/productos/banner");
  return res.data;
};
