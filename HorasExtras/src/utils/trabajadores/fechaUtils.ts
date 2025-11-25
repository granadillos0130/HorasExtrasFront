// Utilidades de fechas para trabajadores

export const formatDateForInput = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const getStartOfWeek = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

export const getEndOfWeek = (date: Date): Date => {
  const startOfWeek = getStartOfWeek(date);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  return endOfWeek;
};

export const getCurrentWeekRange = () => {
  const today = new Date();
  return {
    inicio: getStartOfWeek(today),
    fin: getEndOfWeek(today)
  };
};

export const formatFechaSafe = (
  fechaStr: string | null | undefined, 
  options?: Intl.DateTimeFormatOptions
): string => {
  if (!fechaStr) return 'N/A';
  const fecha = new Date(fechaStr + 'T00:00:00');
  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
  };
  return fecha.toLocaleDateString('es-CO', options || defaultOptions);
};

export const formatFechaCompensado = (fechaStr: string): string => {
  const fecha = new Date(fechaStr + 'T00:00:00');
  return fecha.toLocaleDateString('es-CO', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
  });
};

export const formatPeriodoOrigen = (inicio: string, fin: string): string => {
  const fechaInicio = new Date(inicio + 'T00:00:00');
  const fechaFin = new Date(fin + 'T00:00:00');
  return `${fechaInicio.toLocaleDateString('es-CO', { 
    day: '2-digit', 
    month: '2-digit', 
    year: '2-digit' 
  })} - ${fechaFin.toLocaleDateString('es-CO', { 
    day: '2-digit', 
    month: '2-digit', 
    year: '2-digit' 
  })}`;
};

export const formatFechaLegible = (fechaStr: string): string => {
  const fecha = new Date(fechaStr + 'T00:00:00');
  return fecha.toLocaleDateString('es-CO', {
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  });
};

export const getRangoFechasTexto = (fechaInicio: string, fechaFin: string): string => {
  if (fechaInicio === fechaFin) {
    return formatFechaLegible(fechaInicio);
  }
  return `${formatFechaLegible(fechaInicio)} - ${formatFechaLegible(fechaFin)}`;
};

export const getDiasEnRango = (fechaInicio: string, fechaFin: string): number => {
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);
  const diffTime = Math.abs(fin.getTime() - inicio.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
};

export const formatHours = (hours: number): string => {
  if (hours === 0) return "0:00";
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}:${m.toString().padStart(2, "0")}`;
};

export const safeSubstring = (
  str: string | null | undefined, 
  start: number, 
  end?: number
): string => {
  if (!str) return '';
  return str.substring(start, end);
};

// Agrega esta función al final de src/utils/trabajadores/fechaUtils.ts

export const formatCentroName = (nombreCentro: string | null | undefined): string => {
  return nombreCentro || 'Sin centro';
};