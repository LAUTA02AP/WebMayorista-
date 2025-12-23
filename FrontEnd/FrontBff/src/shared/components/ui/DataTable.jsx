import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

import "../styles/Generales/Table.css";

export default function DataTable({
  data,
  columns,
  pageSizeDefault = 10,
  searchPlaceholder = "Buscar...",
  renderToolbarRight = null,
  className = "",
}) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: pageSizeDefault,
  });

  // Búsqueda global (por defecto: Id/Fecha/Total) — podés extenderla cuando quieras
  const globalFilterFn = (row, _columnIds, filterValue) => {
    const term = String(filterValue ?? "").toLowerCase().trim();
    if (!term) return true;

    const original = row.original ?? {};
    const id = String(original.Id ?? original.id ?? "").toLowerCase();
    const fecha = String(original.Fecha ?? original.fecha ?? "").toLowerCase();
    const total = String(original.Total ?? original.total ?? "").toLowerCase();

    return id.includes(term) || fecha.includes(term) || total.includes(term);
  };

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter, pagination },
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    globalFilterFn,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const totalItems = table.getFilteredRowModel().rows.length;
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;

  const pageRows = table.getRowModel().rows; // filas ya paginadas
  const startIndex = totalItems === 0 ? 0 : pageIndex * pageSize;
  const endIndex = startIndex + pageRows.length;

  const noHayResultadosConFiltro = totalItems === 0;

  return (
    <div className={`table-card ${className}`}>
      {/* TOOLBAR */}
      <div className="table-toolbar">
        <div className="table-toolbar-left">
          <div className="table-search-wrapper">
            <input
              type="text"
              className="table-search-input"
              placeholder={searchPlaceholder}
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
            />
          </div>
        </div>

        <div className="table-toolbar-right">
          <span className="table-count">
            {noHayResultadosConFiltro ? (
              "No se encontraron resultados"
            ) : (
              <>
                Mostrando {startIndex + 1}-{endIndex} de {totalItems}
              </>
            )}
          </span>

          {renderToolbarRight}
        </div>
      </div>

      {/* TABLA */}
      {!noHayResultadosConFiltro && (
        <>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      const def = header.column.columnDef;
                      const thClass = def?.meta?.className || "";

                      return (
                        <th key={header.id} className={thClass}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(def.header, header.getContext())}
                        </th>
                      );
                    })}
                  </tr>
                ))}
              </thead>

              <tbody>
                {pageRows.map((row) => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map((cell) => {
                      const def = cell.column.columnDef;
                      const tdClass = def?.meta?.className || "";

                      const label =
                        def?.meta?.label ??
                        (typeof def?.header === "string" ? def.header : "");

                      return (
                        <td
                          key={cell.id}
                          className={tdClass}
                          data-label={label}
                        ><div className="table-cell-value">
                          {flexRender(def.cell, cell.getContext())}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINACIÓN */}
          <div className="table-pagination">
            <button
              className="table-pagination-button"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Anterior
            </button>

            <span className="table-pagination-info">
              Página {pageIndex + 1} de {table.getPageCount()}
            </span>

            <button
              className="table-pagination-button"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Siguiente
            </button>
          </div>
        </>
      )}
    </div>
  );
}
