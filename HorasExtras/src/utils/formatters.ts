export const formatearMoneda = (valor: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(valor);
};

export const formatearHoras = (hours: number) => {
  if (hours === 0) return "0:00";
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}:${m.toString().padStart(2, "0")}`;
};

export const formatearFecha = (fecha: string) => {
  try {
    const fechaSolo = fecha.includes('T') ? fecha.split('T')[0] : fecha;
    const [year, month, day] = fechaSolo.split('-');
    const fechaObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    
    if (isNaN(fechaObj.getTime())) {
      return fecha;
    }
    
    return fechaObj.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return fecha;
  }
};

export const formatearFechaPeriodo = (fechaInicio: string, fechaFin: string) => {
  try {
    const fechaInicioSolo = fechaInicio.includes('T') ? fechaInicio.split('T')[0] : fechaInicio;
    const fechaFinSolo = fechaFin.includes('T') ? fechaFin.split('T')[0] : fechaFin;
    
    const [yearI, monthI, dayI] = fechaInicioSolo.split('-');
    const [yearF, monthF, dayF] = fechaFinSolo.split('-');
    
    const inicio = new Date(parseInt(yearI), parseInt(monthI) - 1, parseInt(dayI));
    const fin = new Date(parseInt(yearF), parseInt(monthF) - 1, parseInt(dayF));
    
    const inicioStr = inicio.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    const finStr = fin.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    
    return `${inicioStr} - ${finStr}`;
  } catch (error) {
    console.error('Error al formatear período:', error);
    return `${fechaInicio} - ${fechaFin}`;
  }
};
export const formatearPorcentaje = (valor: number): string => {
  return `${valor.toFixed(1)}%`;
};

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};