export const fechaUtils = {
  formatearFecha: (fecha: string): string => {
    const date = new Date(fecha);
    const opciones: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('es-ES', opciones);
  },

  formatearHora: (timeString: string): string => {
    return timeString?.substring(0, 5) || "--:--";
  },

  formatearHoras: (hours: number): string => {
    if (hours === 0) return "0:00";
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}:${m.toString().padStart(2, "0")}`;
  },

  obtenerDiasDelMes: (año: number, mes: number): (number | null)[] => {
    const diasEnMes = new Date(año, mes, 0).getDate();
    const primerDia = new Date(año, mes - 1, 1).getDay();
    
    const dias: (number | null)[] = [];
    
    for (let i = 0; i < primerDia; i++) {
      dias.push(null);
    }
    
    for (let dia = 1; dia <= diasEnMes; dia++) {
      dias.push(dia);
    }
    
    return dias;
  },

  meses: [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ],

  diasSemana: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
};