import { useEffect, useState } from "react";
import { defaultRangeDate } from "../utils/formatDate";
import api from "../services/api";
import { DonaMetricas, MetodoPagoMetrica } from "../components/canchas/reportes/ReportesPagosGrafica";
import { MapaOcupacionCanchas } from "../components/canchas/reportes/ReportesHeatMap";
import { ReportesRentabilidad } from "../components/canchas/reportes/ReportesRentabilidad";
import { ReporteComportamiento } from "../components/canchas/reportes/ReportesComportamiento";

interface ReportPagos {
  estado: string;
  total: number;
  cantidad: number;
}

const Reportes = () => {

  // obtiene la fecha de inicio por defecto como el primer dia del mes en curso evaluando la fecha actual
  const defaultRange = defaultRangeDate();

  const [fechaInicio, setFechaInicio] = useState<string>(defaultRange.fechaInicio);
  const [fechaFin, setFechaFin] = useState<string>(defaultRange.fechaFin);

  const [dataPagos, setDataPagos] = useState<ReportPagos[]>([]);
  const [dataMetricasPagos, setDataMetricasPagos] = useState<MetodoPagoMetrica[]>([]);

  const obtenerDataPagos = async () => {
    try {
      const payload = {
        fechaInicio: fechaInicio,
        fechaFin: fechaFin,
      }
      const resultPagos = await api.post('/reportes/pagos', payload);
      const resultMetricaPagos = await api.post('reportes/metricasPagos', payload);
      setDataPagos(resultPagos.data.data);
      setDataMetricasPagos(resultMetricaPagos.data.data);
    } catch (error) {
      console.error('error al tratar de obtener la analitica de pagos', error);
    }
  }

  useEffect(() => { obtenerDataPagos(); }, [fechaInicio, fechaFin]);

  // estado para controlar la tarjeta activa

  const [tabActive, setTabActive] = useState<
    'ocupacion' | 'finanzas' | 'rentabilidad' | 'usuarios'
  >('ocupacion');
  return (
    <div className="space-y-6">
      <div className="bg-claro-tarjeta dark:bg-oscuro-tarjeta p-5 rounded-2xl border border-claro-borde dark:border-oscuro-borde shadow-sm transition-colors mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

          <div>
            <p className="text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2">Rango de fechas</p>
            <h3 className="text-xl font-bold text-claro-texto dark:text-oscuro-texto mt-1">Filtrar reportes</h3>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="bg-transparent text-claro-texto dark:text-oscuro-texto text-sm px-3 py-2 rounded-xl border border-claro-borde dark:border-oscuro-borde focus:outline-none cursor-pointer"
            />

            <span className="hidden sm:inline text-claro-texto2 dark:text-oscuro-texto2 text-sm font-medium">a</span>

            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="bg-transparent text-claro-texto dark:text-oscuro-texto text-sm px-3 py-2 rounded-xl border border-claro-borde dark:border-oscuro-borde focus:outline-none cursor-pointer"
            />
          </div>

        </div>
      </div>

      {/* BARRA DE PESTAÑAS (TABS) */}
      <div className="bg-claro-tarjeta dark:bg-oscuro-tarjeta p-2 rounded-2xl border border-claro-borde dark:border-oscuro-borde shadow-sm transition-colors">
        <div className="flex flex-wrap gap-2">

          {/* Pestaña 1: Reporte ocupacional */}
          <button
            onClick={() => setTabActive('ocupacion')}
            className={`flex-1 sm:flex-initial text-sm font-medium px-5 py-2.5 rounded-xl transition-colors ${tabActive === 'ocupacion'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-claro-texto2 dark:text-oscuro-texto2 hover:text-claro-texto dark:hover:text-oscuro-texto hover:bg-claro-borde/30 dark:hover:bg-oscuro-borde/30'
              }`}
          >
            Reporte ocupacional
          </button>

          {/* Pestaña 2: Reporte de finanzas */}
          <button
            onClick={() => setTabActive('finanzas')}
            className={`flex-1 sm:flex-initial text-sm font-medium px-5 py-2.5 rounded-xl transition-colors ${tabActive === 'finanzas'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-claro-texto2 dark:text-oscuro-texto2 hover:text-claro-texto dark:hover:text-oscuro-texto hover:bg-claro-borde/30 dark:hover:bg-oscuro-borde/30'
              }`}
          >
            Reporte de finanzas
          </button>
          {/* Pestaña 3: Reporte de rentabilidad */}
          <button
            onClick={() => setTabActive('rentabilidad')}
            className={`px-4 py-2 rounded-xl text-sm font-medium ${tabActive === 'rentabilidad'
                ? 'bg-blue-600 text-white'
                : 'text-claro-texto2 dark:text-oscuro-texto2'
              }`}
          >
            Rentabilidad
          </button>
          {/* Pestaña 4: Usuarios */}
          <button
            onClick={() => setTabActive('usuarios')}
            className={`flex-1 sm:flex-initial text-sm font-medium px-5 py-2.5 rounded-xl transition-colors ${tabActive === 'usuarios'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-claro-texto2 dark:text-oscuro-texto2 hover:text-claro-texto dark:hover:text-oscuro-texto hover:bg-claro-borde/30 dark:hover:bg-oscuro-borde/30'
              }`}
          >
            Comportamiento Usuarios
          </button>

        </div>
      </div>

      {/* CONTENIDO SEGÚN LA PESTAÑA SELECCIONADA */}
      {tabActive === 'ocupacion' && (
        <MapaOcupacionCanchas
          fechaInicio={fechaInicio}
          fechaFin={fechaFin}
        />
      )}

      {tabActive === 'finanzas' && (
        dataPagos && dataPagos.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {/* Tarjetas resumen */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {dataPagos.map((item) => (
                <div
                  key={item.estado}
                  className="bg-claro-tarjeta dark:bg-oscuro-tarjeta p-5 rounded-2xl border border-claro-borde dark:border-oscuro-borde shadow-sm transition-colors"
                >
                  <p className="text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2">{item.estado}</p>
                  <p className="text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2">Cantidad: {item.cantidad}</p>
                  <h3 className="text-3xl font-bold text-claro-texto dark:text-oscuro-texto mt-2">{item.total} Bs.</h3>
                </div>
              ))}
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DonaMetricas
                data={dataMetricasPagos}
                metrica="cantidad"
                titulo="Volumen de Transacciones"
                subtitulo="Distribución según la frecuencia de uso de cada método"
              />

              <DonaMetricas
                data={dataMetricasPagos}
                metrica="monto"
                titulo="Ingresos Totales (Bs.)"
                subtitulo="Distribución del dinero recaudado por método de pago"
              />
            </div>
          </div>
        ) : (
          /* Estado vacío cuando no hay datos */
          <div className="flex flex-col items-center justify-center p-12 text-center bg-claro-tarjeta dark:bg-oscuro-tarjeta rounded-2xl border border-claro-borde dark:border-oscuro-borde">
            <div className="w-12 h-12 mb-3 rounded-full bg-claro-borde/30 dark:bg-oscuro-borde/30 flex items-center justify-center text-claro-texto2 dark:text-oscuro-texto2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l2-2 4 4m4-7a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-claro-texto dark:text-oscuro-texto">No hay datos disponibles</h4>
            <p className="text-sm text-claro-texto2 dark:text-oscuro-texto2 mt-1">
              No se encontraron registros de pagos o finanzas para el rango de fechas seleccionado.
            </p>
          </div>
        )
      )
      }
      {tabActive === 'rentabilidad' && (
        <ReportesRentabilidad
          fechaInicio={fechaInicio}
          fechaFin={fechaFin}
        />
      )}
      {
        tabActive === 'usuarios' && (
          <ReporteComportamiento
            fechaInicio={fechaInicio}
            fechaFin={fechaFin}
          />

        )
      }

    </div >
  );

};

export default Reportes;
