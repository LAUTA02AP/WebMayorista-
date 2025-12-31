// src/features/productos/pages/ProductosPage.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Trash2 } from "lucide-react";

import { getProductos } from "../../../services/ProductoServices";

import DataTable from "../../../shared/components/ui/DataTable";

import "./Productos.css";

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

  // ✅ carrito (tu useCart solo retorna el contexto)
  // El provider puede exponer distintas funciones; por eso hacemos fallback.
  const cart = useCart();
  const { addToCart, items } = cart;

  // ✅ remover: intenta varias funciones comunes, y si existe dispatch, usa REMOVE (tu reducer)
  const removeLineItem = useCallback(
    (id) => {
      if (!id) return;

      if (typeof cart.removeFromCart === "function") return cart.removeFromCart(id);
      if (typeof cart.removeItem === "function") return cart.removeItem(id);
      if (typeof cart.remove === "function") return cart.remove(id);
      if (typeof cart.deleteItem === "function") return cart.deleteItem(id);

      // fallback directo a reducer si tu provider expone dispatch
      if (typeof cart.dispatch === "function") {
        return cart.dispatch({ type: "REMOVE", payload: { id } });
      }

      console.warn(
        "No encontré función para eliminar en CartProvider. Agregá removeFromCart/removeItem/remove o expone dispatch."
      );
    },
    [cart]
  );

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

          // sumar 1 solo si se puede
          const canAdd = !!id && stock > 0 && !reachedMax;

          // estados visuales
          let stateClass = "is-add";
          let titleText = "Agregar al carrito";

          if (inCart && reachedMax) {
            stateClass = "is-in-cart is-max";
            titleText = `En carrito (${inCart.qty}) - Máximo`;
          } else if (inCart) {
            stateClass = "is-in-cart";
            titleText = `En carrito (${inCart.qty})`;
          } else if (stock <= 0) {
            stateClass = "is-out";
            titleText = "Sin stock";
          }

          return (
            <div className="producto-accion-wrap">
              {/* Botón principal */}
              <button
                type="button"
                className={`producto-accion-btn ${stateClass}`}
                disabled={!canAdd}
                title={titleText}
                aria-label={inCart ? `Producto en carrito. Cantidad ${inCart.qty}` : "Agregar al carrito"}
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart({ id, nombre, precio, stock }, 1);
                }}
              >
                {/* Si está en carrito: SOLO icono + badge */}
                {inCart ? (
                  <>
                    <ShoppingCart size={18} aria-hidden="true" />
                    <span className="producto-accion-badge" title="Cantidad en carrito">
                      {inCart.qty}
                    </span>
                  </>
                ) : (
                  <span className="producto-accion-text">
                    {stock <= 0 ? "Sin stock" : "Agregar"}
                  </span>
                )}
              </button>

              {/* Tachito: solo si está en carrito */}
              {inCart ? (
                <button
                  type="button"
                  className="producto-accion-trash-btn"
                  title="Quitar del carrito"
                  aria-label="Quitar del carrito"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeLineItem(id);
                  }}
                >
                  <Trash2 size={18} aria-hidden="true" />
                </button>
              ) : null}
            </div>
          );
        },
        meta: { label: "Acción" },
      },
    ],
    [addToCart, items, removeLineItem]
  );

  useEffect(() => {
    async function cargar() {
      try {
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

  // DataTable busca globalmente en Id/Fecha/Total.
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
