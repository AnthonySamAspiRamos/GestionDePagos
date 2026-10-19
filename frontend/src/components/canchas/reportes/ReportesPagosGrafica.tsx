import React from "react";
import { ResponsivePie } from "@nivo/pie";

export interface MetodoPagoMetrica {
  id: string;
  label: string;
  cantidad: number;
  monto: number;
}

interface DonaMetricasProps {
  data: MetodoPagoMetrica[];
  metrica: 'monto' | 'cantidad';
  titulo: string;
  subtitulo: string;
}

export const DonaMetricas: React.FC<DonaMetricasProps> = ({
  data,
  metrica,
  titulo,
  subtitulo,
}) => {
  // Transformamos los datos para asignarle a 'value' el atributo correcto según la métrica
  const dataFormateada = data.map((item) => ({
    id: item.id,
    label: item.label,
    value: item[metrica], // Selecciona dinámicamente 'monto' o 'cantidad'
  }));

  const esMonto = metrica === 'monto';

  return (
    <div className="bg-claro-tarjeta dark:bg-oscuro-tarjeta p-5 rounded-2xl border border-claro-borde dark:border-oscuro-borde shadow-sm transition-colors">
      <div className="mb-2">
        <h3 className="text-base font-bold text-claro-texto dark:text-oscuro-texto">
          {titulo}
        </h3>
        <p className="text-xs font-medium text-claro-texto2 dark:text-oscuro-texto2">
          {subtitulo}
        </p>
      </div>

      <div className="h-64 w-full">
        <ResponsivePie
          data={dataFormateada}
          margin={{ top: 20, right: 60, bottom: 20, left: 60 }}
          innerRadius={0.65}
          padAngle={2}
          cornerRadius={5}
          activeOuterRadiusOffset={6}
          borderWidth={1}
          borderColor={{
            from: 'color',
            modifiers: [['darker', 0.2]],
          }}
          // Colores fijos por método de pago para mantener consistencia
          colors={({ id }) => {
            if (id === 'qr') return '#3B82F6';       // Azul
            if (id === 'efectivo') return '#10B981'; // Verde
            if (id === 'transferencia') return '#8B5CF6'; // Púrpura
            return '#6B7280';
          }}
          enableArcLinkLabels={true}
          arcLinkLabel={(d) => `${d.id}`}
          arcLinkLabelsTextColor="currentColor"
          arcLinkLabelsThickness={2}
          arcLinkLabelsColor={{ from: 'color' }}
          arcLabelsSkipAngle={10}
          arcLabelsTextColor="#ffffff"
          // Formateador dinámico para el Tooltip
          valueFormat={(val) =>
            esMonto
              ? `Bs. ${Number(val).toLocaleString('es-BO', { minimumFractionDigits: 2 })}`
              : `${val} transacciones`
          }
          theme={{
            text: {
              fontSize: 11,
              fill: 'currentColor',
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
    </div>
  );
};
