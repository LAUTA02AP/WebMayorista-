// src/features/productos/pages/ProductosPage.jsx
import { useEffect, useMemo, useState } from "react";
import { getProductos } from "../../../services/ProductoServices";

// helper para agarrar campos sin saber el nombre exacto
const pick = (obj, keys, fallback = "") => {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined && v !== null && String(v).trim() !== "") return v;
  }
  return fallback;
};

export default function ProductosPage() {
  const [data, setData] = useState(null);     // { Paginacion, Productos, filtrosAdic }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      setError("");
      try {
        // ✅ TRAER TODO: pageSize = 0 (tu API real lo transforma a nMaxFilas)
        const res = await getProductos({ pageNumber: 1, pageSize: 0 });
        if (!alive) return;
        setData(res);
      } catch (e) {
        if (!alive) return;
        console.error(e);
        setError("No se pudieron cargar los productos.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const productos = useMemo(
    () => (Array.isArray(data?.Productos) ? data.Productos : []),
    [data]
  );

  if (loading) return <div style={{ padding: 16 }}>Cargando productos...</div>;

  if (error) return <div style={{ padding: 16, color: "crimson" }}>{error}</div>;

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ marginTop: 0 }}>Productos</h1>

      <div style={{ marginBottom: 12, opacity: 0.8 }}>
        Total: <b>{data?.Paginacion?.TotalCount ?? productos.length}</b>
      </div>

      {productos.length === 0 ? (
        <div>No hay productos.</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={th}>Código</th>
                <th style={th}>Nombre</th>
                <th style={th}>Rubro</th>
                <th style={th}>SubRubro</th>
                <th style={th}>Precio</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p, idx) => {
                const codigo = pick(p, ["Codigo", "CodArticulo", "Id", "Articulo", "SKU", "Cod"], "-");
                const nombre = pick(p, ["Descripcion", "Nombre", "Producto", "Desc"], "(sin nombre)");
                const rubro = pick(p, ["Rubro"], "-");
                const subRubro = pick(p, ["SubRubro"], "-");
                const precio = pick(p, ["Precio", "PrecioFinal", "Importe", "PrecioLista"], "-");

                return (
                  <tr key={codigo !== "-" ? codigo : idx}>
                    <td style={td}>{codigo}</td>
                    <td style={td}>{nombre}</td>
                    <td style={td}>{rubro}</td>
                    <td style={td}>{subRubro}</td>
                    <td style={td}>{precio}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const th = { textAlign: "left", borderBottom: "1px solid #ddd", padding: 8, whiteSpace: "nowrap" };
const td = { borderBottom: "1px solid #eee", padding: 8, verticalAlign: "top" };
