import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getPedidosSimulados } from "../../../services/Services";

import BotonDescargar from "../../../shared/components/ui/BotonDescargar";
import DataTable from "../../../shared/components/ui/DataTable";

function PedidosPageCliente() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const columns = useMemo(
    () => [
      {
        id: "id",
        header: "ID",
        accessorFn: (row) => row.Id ?? row.id ?? "",
        cell: (info) => info.getValue(),
        meta: { label: "ID" },
      },
      {
        id: "fecha",
        header: "Fecha",
        accessorFn: (row) => row.Fecha ?? row.fecha ?? null,
        cell: (info) => {
          const fecha = info.getValue();
          return fecha ? new Date(fecha).toLocaleDateString("es-AR") : "-";
        },
        meta: { label: "Fecha" },
      },
      {
        id: "total",
        header: "Total",
        accessorFn: (row) => row.Total ?? row.total ?? 0,
        cell: (info) => `$${Number(info.getValue() ?? 0).toFixed(2)}`,
        meta: { className: "text-right", label: "Total" },
      },
    ],
    []
  );

  useEffect(() => {
    async function cargar() {
      try {
        const pedidosData = await getPedidosSimulados();
        setPedidos(Array.isArray(pedidosData) ? pedidosData : []);
      } catch (err) {
        console.error("Error cargando pedidos simulados:", err);
        navigate("/home", { replace: true });
      } finally {
        setLoading(false);
      }
    }

    cargar();
  }, [navigate]);

  if (loading) return <p className="pedidos-loading">Cargando pedidos...</p>;

  const noHayPedidos = pedidos.length === 0;

  return (
    <div className="table-page-wrapper">
      <div className="table-page-header">
        <div className="table-page-header-left">
          <div>
            <h2 className="table-page-title">Pedidos (simulado)</h2>
            <div className="table-page-subtitle">
              Listado de prueba para DataTable
            </div>
          </div>
        </div>
      </div>

      {noHayPedidos ? (
        <p className="pedidos-vacio">No hay pedidos registrados.</p>
      ) : (
        <DataTable
          data={pedidos}
          columns={columns}
          pageSizeDefault={10}
          searchPlaceholder="Buscar pedido (ID, fecha, total)..."
          renderToolbarRight={
            <BotonDescargar
              label="Descargar"
              data={pedidos}
              nombreArchivo="Pedidos"
              nombreHoja="Pedidos"
            />
          }
        />
      )}
    </div>
  );
}

export default PedidosPageCliente;
