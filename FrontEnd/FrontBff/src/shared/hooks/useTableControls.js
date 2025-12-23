// src/hooks/useTableControls.js
import { useMemo, useState } from "react";

/**
 * Hook genérico para manejar:
 * - búsqueda
 * - paginación
 * 
 * data: array completo
 * options:
 *   - pageSizeDefault: tamaño de página (por defecto 15)
 *   - filterFn: función (item, term) => boolean para filtrar
 */
export function useTableControls(data = [], options = {}) {
  const { pageSizeDefault = 10, filterFn } = options;

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(pageSizeDefault);

  // 1) Filtrado
  const filteredData = useMemo(() => {
    let result = data || [];
    const term = search.trim().toLowerCase();

    if (!term) return result;

    // Si viene una función de filtro específica, la usamos
    if (typeof filterFn === "function") {
      return result.filter((item) => filterFn(item, term));
    }

    // Filtro genérico: busca el término en el JSON del item
    return result.filter((item) =>
      JSON.stringify(item).toLowerCase().includes(term)
    );
  }, [data, search, filterFn]);

  // 2) Paginación
  const totalItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  const dataPage = filteredData.slice(startIndex, endIndex);

  const goToPage = (p) =>
    setPage(Math.min(Math.max(1, p), totalPages));

  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);

  const changePageSize = (size) => {
    setPageSize(size);
    setPage(1); // al cambiar tamaño, volvemos a la primera página
  };

  return {
    // estado de búsqueda
    search,
    setSearch,

    // paginación
    pageSize,
    setPageSize: changePageSize,
    currentPage,
    totalPages,
    totalItems,
    startIndex,
    endIndex,
    dataPage,

    // helpers
    goToPage,
    nextPage,
    prevPage,
  };
}
