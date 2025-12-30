// src/features/productos/pages/ProductosPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getProductos } from "../../../services/ProductoServices";

import BotonVolver from "../../../shared/components/ui/BotonVolver";
import DataTable from "../../../shared/components/ui/DataTable";

// ✅ Hook del carrito
import { useCart } from "../../cart/hooks/useCart";

const pick = (obj, keys, fallback = "") => {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined && v !== null && String(v).trim() !== "") return v;
  }
  return fallback;
};

const formatARS = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return "-";
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(n);
};

function ProductosPage() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  // filtros simples (cliente) para toolbar derecha
  const [soloDisponibles, setSoloDisponibles] = useState(false);
  const [soloOfertas, setSoloOfertas] = useState(false);

  const navigate = useNavigate();

  // ✅ carrito
  const { addToCart, items } = useCart();

  const columns = useMemo(
    () => [
      {
        id: "codigo",
        header: "Código",
        accessorFn: (row) => pick(row, ["Codigo", "CodArticulo", "Id", "SKU", "Cod"], ""),
        cell: (info) => info.getValue() || "-",
        meta: { label: "Código" },
      },
      {
        id: "descripcion",
        header: "Descripción",
        accessorFn: (row) => pick(row, ["Descripcion", "Nombre", "Producto", "Desc"], ""),
        cell: (info) => info.getValue() || "(sin nombre)",
        meta: { label: "Descripción" },
      },
      {
        id: "rubro",
        header: "Rubro",
        accessorFn: (row) => pick(row, ["Rubro"], ""),
        cell: (info) => info.getValue() || "-",
        meta: { label: "Rubro" },
      },
      {
        id: "subrubro",
        header: "SubRubro",
        accessorFn: (row) => pick(row, ["SubRubro"], ""),
        cell: (info) => info.getValue() || "-",
        meta: { label: "SubRubro" },
      },
      {
        id: "marca",
        header: "Marca",
        accessorFn: (row) => pick(row, ["Marca"], ""),
        cell: (info) => info.getValue() || "-",
        meta: { label: "Marca" },
      },
      {
        id: "precio",
        header: "Precio",
        accessorFn: (row) => Number(row?.PrecioFinal ?? row?.PrecioLista ?? row?.Precio ?? 0),
        cell: (info) => formatARS(info.getValue()),
        meta: { className: "text-right", label: "Precio" },
      },
      {
        id: "stock",
        header: "Stock",
        accessorFn: (row) => Number(row?.Stock ?? 0),
        cell: (info) => String(info.getValue() ?? 0),
        meta: { className: "text-right", label: "Stock" },
      },
      {
        id: "accion",
        header: "Acción",
        cell: ({ row }) => {
          const p = row.original;

          const id = pick(p, ["Codigo", "CodArticulo", "Id", "SKU", "Cod"], "");
          const nombre = pick(p, ["Descripcion", "Nombre", "Producto", "Desc"], "Producto");
          const stock = Number(p?.Stock ?? 0);
          const precio = Number(p?.PrecioFinal ?? p?.PrecioLista ?? p?.Precio ?? 0);

          const inCart = items.find((x) => x.id === id);
          const reachedMax = inCart ? inCart.qty >= stock : false;

          const disabled = !id || stock <= 0 || reachedMax;

          return (
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                addToCart(
                  {
                    id,
                    nombre,
                    precio,
                    stock,
                  },
                  1
                );
              }}
            >
              {stock <= 0 ? "Sin stock" : reachedMax ? "Máximo" : "Agregar"}
            </button>
          );
        },
        meta: { label: "Acción" },
      },
    ],
    [addToCart, items]
  );

  useEffect(() => {
    async function cargar() {
      try {
        // Traemos TODO (así DataTable pagina y filtra solo)
        const res = await getProductos({ pageNumber: 1, pageSize: 0 });

        const arr = Array.isArray(res?.Productos) ? res.Productos : [];
        setProductos(arr);
      } catch (err) {
        console.error("Error cargando productos:", err);
        navigate("/home", { replace: true });
      } finally {
        setLoading(false);
      }
    }

    cargar();
  }, [navigate]);

  const productosFiltrados = useMemo(() => {
    let out = productos;
    if (soloDisponibles) out = out.filter((p) => p?.Disponible === true);
    if (soloOfertas) out = out.filter((p) => p?.Oferta === true);
    return out;
  }, [productos, soloDisponibles, soloOfertas]);

  // 🔑 IMPORTANTE:
  // Tu DataTable busca globalmente en Id/Fecha/Total.
  const dataTableData = useMemo(() => {
    return productosFiltrados.map((p) => {
      const codigo = pick(p, ["Codigo", "CodArticulo", "Id", "SKU", "Cod"], "");
      const desc = pick(p, ["Descripcion", "Nombre", "Producto", "Desc"], "");
      const marca = pick(p, ["Marca"], "");
      const rubro = pick(p, ["Rubro"], "");
      const sub = pick(p, ["SubRubro"], "");
      const precio = Number(p?.PrecioFinal ?? p?.PrecioLista ?? p?.Precio ?? 0);

      return {
        ...p,
        Id: codigo,
        Fecha: `${desc} ${marca} ${rubro} ${sub}`.trim(),
        Total: precio,
      };
    });
  }, [productosFiltrados]);

  if (loading) return <p className="pedidos-loading">Cargando productos...</p>;

  const noHayProductos = dataTableData.length === 0;

  return (
    <div className="table-page-wrapper">
      <div className="table-page-header">
        <div className="table-page-header-left">
          <BotonVolver visible={true} />
          <div>
            <h2 className="table-page-title">Productos (mock)</h2>
            <div className="table-page-subtitle">Listado de prueba para DataTable</div>
          </div>
        </div>
      </div>

      {noHayProductos ? (
        <p className="pedidos-vacio">No hay productos registrados.</p>
      ) : (
        <DataTable
          data={dataTableData}
          columns={columns}
          pageSizeDefault={10}
          searchPlaceholder="Buscar producto (código, descripción, marca, rubro, precio)..."
          renderToolbarRight={
            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={soloDisponibles}
                  onChange={(e) => setSoloDisponibles(e.target.checked)}
                />
                Solo disponibles
              </label>

              <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={soloOfertas}
                  onChange={(e) => setSoloOfertas(e.target.checked)}
                />
                Solo ofertas
              </label>
            </div>
          }
        />
      )}
    </div>
  );
}

export default ProductosPage;
