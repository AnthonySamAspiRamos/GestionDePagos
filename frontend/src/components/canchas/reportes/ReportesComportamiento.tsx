import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ReporteData {
  clientesVip: Array<{
    id_cliente: number;
    cliente: string;
    correo: string;
    telefono: string;
    total_reservas: number;
    total_gastado: number;
  }>;
  metricas: {
    total_solicitadas: number;
    confirmadas: number;
    canceladas: number;
    pendientes: number;
    porcentaje_cancelacion: number;
  };
  nuevosClientes: number;
}

export const ReporteComportamiento: React.FC<{ fechaInicio: string; fechaFin: string }> = ({ fechaInicio, fechaFin }) => {
  const [data, setData] = useState<ReporteData | null>(null);
  const [cargando, setCargando] = useState<boolean>(false);

  useEffect(() => {
    const cargarReporte = async () => {
      if (!fechaInicio || !fechaFin) return;
      setCargando(true);
      try {
        const res = await api.post('/reportes/comportamiento-usuarios', { fechaInicio, fechaFin });
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (error) {
        console.error("Error al cargar reporte:", error);
      } finally {
        setCargando(false);
      }
    };
    cargarReporte();
  }, [fechaInicio, fechaFin]);

  const exportarExcel = () => {
    if (!data) return;

    const dataExcel = data.clientesVip.map(c => ({
      ID: c.id_cliente,
      Cliente: c.cliente,
      Correo: c.correo,
      Teléfono: c.telefono,
      'Total Reservas': c.total_reservas,
      'Total Gastado (Bs.)': c.total_gastado
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Clientes VIP");
    XLSX.writeFile(workbook, `Reporte_Comportamiento_${fechaInicio}_al_${fechaFin}.xlsx`);
  };

  const exportarPDF = async () => {
    const elemento = document.getElementById('seccion-reporte-pdf');
    if (!elemento) return;

    const canvas = await html2canvas(elemento, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, width, height);
    pdf.save(`Reporte_Comportamiento_${fechaInicio}_al_${fechaFin}.pdf`);
  };
  if (cargando) return <div className="p-5 text-center text-claro-texto2 dark:text-oscuro-texto2">Cargando reporte...</div>;
  if (!data) return <div className="p-5 text-center text-claro-texto2 dark:text-oscuro-texto2">Seleccione un rango de fechas.</div>;

  return (
    <div className="space-y-6">
      {/* BARRA DE BOTONES DE EXPORTACIÓN */}
      <div className="flex justify-between items-center bg-claro-tarjeta dark:bg-oscuro-tarjeta p-5 rounded-2xl border border-claro-borde dark:border-oscuro-borde shadow-sm transition-colors">
        <h2 className="text-xl font-bold text-claro-texto dark:text-oscuro-texto">
          Reporte de Comportamiento
        </h2>
        <div className="space-x-3">
          <button
            onClick={exportarExcel}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl text-sm transition-colors shadow-sm"
          >
            Exportar Excel
          </button>
          <button
            onClick={exportarPDF}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-xl text-sm transition-colors shadow-sm"
          >
            Exportar PDF
          </button>
        </div>
      </div>

      {/* CONTENEDOR PRINCIPAL */}
      <div id="seccion-reporte-pdf" className="space-y-6">

        {/* TARJETAS RESUMEN (Métricas) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

          <div className="bg-claro-tarjeta dark:bg-oscuro-tarjeta p-5 rounded-2xl border border-claro-borde dark:border-oscuro-borde shadow-sm transition-colors">
            <p className="text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2">Nuevos Registros</p>
            <h3 className="text-3xl font-bold text-claro-texto dark:text-oscuro-texto mt-2">{data.nuevosClientes}</h3>
          </div>

          <div className="bg-claro-tarjeta dark:bg-oscuro-tarjeta p-5 rounded-2xl border border-claro-borde dark:border-oscuro-borde shadow-sm transition-colors">
            <p className="text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2">Reservas Totales</p>
            <h3 className="text-3xl font-bold text-claro-texto dark:text-oscuro-texto mt-2">{data.metricas.total_solicitadas}</h3>
          </div>

          <div className="bg-claro-tarjeta dark:bg-oscuro-tarjeta p-5 rounded-2xl border border-claro-borde dark:border-oscuro-borde shadow-sm transition-colors">
            <p className="text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2">Confirmadas</p>
            <h3 className="text-3xl font-bold text-claro-texto dark:text-oscuro-texto mt-2">{data.metricas.confirmadas}</h3>
          </div>

          <div className="bg-claro-tarjeta dark:bg-oscuro-tarjeta p-5 rounded-2xl border border-claro-borde dark:border-oscuro-borde shadow-sm transition-colors">
            <p className="text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2">Tasa de Cancelación</p>
            <h3 className="text-3xl font-bold text-claro-texto dark:text-oscuro-texto mt-2">
              {data.metricas.porcentaje_cancelacion || 0}%
            </h3>
          </div>

        </div>

        {/* TABLA DE CLIENTES VIP */}
        <div className="bg-claro-tarjeta dark:bg-oscuro-tarjeta p-5 rounded-2xl border border-claro-borde dark:border-oscuro-borde shadow-sm transition-colors overflow-hidden">
          <h3 className="text-lg font-bold text-claro-texto dark:text-oscuro-texto mb-4">
            Clientes Frecuentes (VIP)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-claro-borde dark:border-oscuro-borde text-sm font-medium text-claro-texto2 dark:text-oscuro-texto2">
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Contacto</th>
                  <th className="py-3 px-4 text-center">Reservas</th>
                  <th className="py-3 px-4 text-right">Total Gastado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-claro-borde dark:divide-oscuro-borde">
                {data.clientesVip.map((c) => (
                  <tr key={c.id_cliente} className="transition-colors hover:bg-black/5 dark:hover:bg-white/5">
                    <td className="py-3 px-4 font-medium text-claro-texto dark:text-oscuro-texto">{c.cliente}</td>
                    <td className="py-3 px-4 text-sm text-claro-texto2 dark:text-oscuro-texto2">{c.correo} | {c.telefono}</td>
                    <td className="py-3 px-4 text-center font-bold text-claro-texto dark:text-oscuro-texto">{c.total_reservas}</td>
                    <td className="py-3 px-4 text-right font-bold text-claro-texto dark:text-oscuro-texto">
                      {Number(c.total_gastado).toFixed(2)} Bs.
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
