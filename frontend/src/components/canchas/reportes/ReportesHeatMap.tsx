import React, { useState, useEffect } from 'react';
import { ResponsiveHeatMap } from '@nivo/heatmap';
import api from '../../../services/api';


interface Cancha {
  id_cancha: number;
  nombre: string;
  disciplina: string;
}

interface HeatmapNivoData {
  id: string;
  data: { x: string; y: number }[];
}

interface MapaOcupacionProps {
  fechaInicio: string;
  fechaFin: string;
}

export const MapaOcupacionCanchas: React.FC<MapaOcupacionProps> = ({ fechaInicio, fechaFin }) => {
  const [canchas, setCanchas] = useState<Cancha[]>([]);
  const [canchaSeleccionada, setCanchaSeleccionada] = useState<string>('todas');
  const [dataHeatmap, setDataHeatmap] = useState<HeatmapNivoData[]>([]);
  const [cargando, setCargando] = useState<boolean>(false);
  const [totalReservas, setTotalReservas] = useState<number>(0);
  const [horasOcupadas, setHorasOcupadas] = useState<number>(0);
  const [mayorDemanda, setMayorDemanda] = useState<string>('-');

  useEffect(() => {
    const obtenerCanchas = async () => {
      const res = await api.get('/reportes/listarCanchas');
      if (res.data.success) {
        setCanchas(res.data.data);
      }
    };
    obtenerCanchas();
  }, []);


  const obtenerOcupacion = async () => {
    if (!fechaInicio || !fechaFin) return;

    const payload = {
      fechaInicio: fechaInicio,
      fechaFin: fechaFin,
      idCancha: canchaSeleccionada,
    }
    setCargando(true);

    const result = await api.post('/reportes/heatmap', payload);
    const resultTotal = await api.post('/reportes/totalReservas', payload);
    const resultHoras = await api.post('/reportes/horasOcupadas', payload);
    const resultDemanda = await api.post('/reportes/mayorDemanda', payload);

    if (result.data.success) {
      setDataHeatmap(result.data.data);
    }

    if (resultTotal.data.success) {
      setTotalReservas(resultTotal.data.data.total);
    }

    if (resultHoras.data.success) {
      setHorasOcupadas(Number(resultHoras.data.data.horas));
    }

    if (resultDemanda.data.success) {
      setMayorDemanda(resultDemanda.data.data.hora);
    }
    setCargando(false);
  };
  useEffect(() => {

    obtenerOcupacion();
  }, [fechaInicio, fechaFin, canchaSeleccionada]);
  const exportarCSV = () => {
    let contenido = 'REPORTE DE OCUPACIÓN\n\n';

    contenido += `Fecha inicio,${fechaInicio}\n`;
    contenido += `Fecha fin,${fechaFin}\n`;

    const cancha =
      canchaSeleccionada === 'todas'
        ? 'Todas las canchas'
        : canchas.find(
          (c) => c.id_cancha.toString() === canchaSeleccionada
        )?.nombre || 'Cancha seleccionada';

    contenido += `Cancha,${cancha}\n`;
    contenido += `Total de reservas,${totalReservas}\n`;
    contenido += `Horas ocupadas,${horasOcupadas}\n`;
    contenido += `Mayor demanda,${mayorDemanda}\n\n`;

    contenido += 'Día,Hora,Reservas\n';

    dataHeatmap.forEach((dia) => {
      dia.data.forEach((hora) => {
        contenido += `${dia.id},${hora.x},${hora.y}\n`;
      });
    });


    const archivo = new Blob([contenido], {
      type: 'text/csv;charset=utf-8;'
    });

    const url = URL.createObjectURL(archivo);
    const enlace = document.createElement('a');

    enlace.href = url;
    enlace.download = 'reporte_ocupacion.csv';
    enlace.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-claro-tarjeta dark:bg-oscuro-tarjeta p-5 rounded-2xl border border-claro-borde dark:border-oscuro-borde shadow-sm transition-colors">

      {/* Cabecera con Título y Selector de Cancha */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-claro-texto dark:text-oscuro-texto">
            Mapa de Calor de Ocupación
          </h3>
          <p className="text-xs font-medium text-claro-texto2 dark:text-oscuro-texto2">
            Frecuencia de reservas según días y horas pico
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportarCSV}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
          >
            Exportar CSV
          </button>

          {/* select de cancha */}
        </div>

        {/* Selector de Canchas */}
        <div className="flex items-center gap-2">
          <label htmlFor="select-cancha" className="text-xs font-medium text-claro-texto2 dark:text-oscuro-texto2">
            Cancha:
          </label>
          <select
            id="select-cancha"
            value={canchaSeleccionada}
            onChange={(e) => setCanchaSeleccionada(e.target.value)}
            className="bg-transparent text-claro-texto dark:text-oscuro-texto text-sm px-3 py-2 rounded-xl border border-claro-borde dark:border-oscuro-borde focus:outline-none cursor-pointer"
          >
            <option value="todas" className="bg-claro-tarjeta dark:bg-oscuro-tarjeta">
              Todas las canchas
            </option>
            {canchas.map((cancha) => (
              <option
                key={cancha.id_cancha}
                value={cancha.id_cancha}
                className="bg-claro-tarjeta dark:bg-oscuro-tarjeta"
              >
                {cancha.nombre} ({cancha.disciplina})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Resumen de ocupación */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">

        <div className="bg-claro-fondo dark:bg-oscuro-fondo p-4 rounded-xl border border-claro-borde dark:border-oscuro-borde">
          <p className="text-xs font-medium text-claro-texto2 dark:text-oscuro-texto2">
            Total de reservas
          </p>
          <p className="text-2xl font-bold text-claro-texto dark:text-oscuro-texto mt-1">
            {totalReservas}
          </p>
        </div>

        <div className="bg-claro-fondo dark:bg-oscuro-fondo p-4 rounded-xl border border-claro-borde dark:border-oscuro-borde">
          <p className="text-xs font-medium text-claro-texto2 dark:text-oscuro-texto2">
            Horas ocupadas
          </p>
          <p className="text-2xl font-bold text-claro-texto dark:text-oscuro-texto mt-1">
            {horasOcupadas}
          </p>
        </div>

        <div className="bg-claro-fondo dark:bg-oscuro-fondo p-4 rounded-xl border border-claro-borde dark:border-oscuro-borde">
          <p className="text-xs font-medium text-claro-texto2 dark:text-oscuro-texto2">
            Mayor demanda
          </p>
          <p className="text-2xl font-bold text-claro-texto dark:text-oscuro-texto mt-1">
            {mayorDemanda}
          </p>
        </div>

      </div>

      {cargando ? (
        <div className="h-80 flex items-center justify-center text-claro-texto2 dark:text-oscuro-texto2 text-sm">
          Cargando datos de ocupación...
        </div>
      ) : dataHeatmap.length > 0 ? (
        <div className="h-80 w-full">
          <ResponsiveHeatMap
            data={dataHeatmap}
            margin={{ top: 20, right: 30, bottom: 50, left: 70 }}
            valueFormat={(val) => `${val} reservas`}
            axisTop={null}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: -45,
              legend: 'Hora del día',
              legendPosition: 'middle',
              legendOffset: 40,
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
            }}
            colors={{
              type: 'sequential',
              scheme: 'blues',
            }}
            emptyColor="#e5e7eb"
            borderRadius={3}
            borderWidth={1}
            borderColor={{ from: 'color', modifiers: [['darker', 0.1]] }}
            enableLabels={true}
            labelTextColor={{ from: 'color', modifiers: [['darker', 1.8]] }}
            theme={{
              text: {
                fontSize: 11,
                fill: 'currentColor',
              },
              axis: {
                ticks: { text: { fill: 'currentColor' } },
                legend: { text: { fill: 'currentColor', fontWeight: 'bold' } },
              },
              tooltip: {
                container: {
                  background: '#1f2937',
                  color: '#ffffff',
                  fontSize: '12px',
                  borderRadius: '8px',
                },
              },
            }}
          />
        </div>
      ) : (
        <div className="h-80 flex items-center justify-center text-claro-texto2 dark:text-oscuro-texto2 text-sm">
          No hay reservas registradas para esta cancha en las fechas seleccionadas.
        </div>
      )}

    </div>
  );
};
