export interface DateRangeStrings {
  fechaInicio: string;
  fechaFin: string;
}

export const formatearFecha = (fecha: Date): string => {
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, '0');
  const day = String(fecha.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const defaultRangeDate = (): DateRangeStrings => {
  const today = new Date();

  const fechaFinStr = formatearFecha(today);

  let fechaInicio = new Date(today.getFullYear(), today.getMonth(), 1);

  return {
    fechaInicio: formatearFecha(fechaInicio),
    fechaFin: fechaFinStr,
  }
}
