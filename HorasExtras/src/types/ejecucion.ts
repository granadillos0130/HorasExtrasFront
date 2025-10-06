export interface ManoObraData {
  centroId: string;
  manoObraTotal: number;
}

export interface TrabajadorManoObra {
  centroId: string;
  trabajadorId: number;
  nombreTrabajador: string;
  manoObraTotal: number;
}

export interface DetalleDias {
  centroId: string;
  centroNombre: string;  // ✅ Cambia esto (quita el "centro" duplicado)
  trabajadorId: number;
  nombreTrabajador: string;
  totalDias: number;
  detalleDias: Array<{
    fecha: string;
    diaSemana: string;
    // Horario trabajado
    horaIngreso: string;
    horaSalida: string;
    tiempoAlmuerzo: string;
    intensidadHoraria: number;
    // Centro del día
    centroId: string;
    centroDia: string;
    // Horas
    horasNormales: number;
    extrasDiurnas: number;
    extrasNocturnas: number;
    dominicalesDiurnas: number;
    dominicalesNocturnas: number;
    totalHoras: number;
    // Desplazamientos
    desplazamientoIda: string;
    desplazamientoRegreso: string;
    esConductor: boolean;
    // Indicadores
    esCompensado: boolean;
    esFestivo: boolean;
    esAusencia: boolean;
  }>;
}

export interface TrabajadorInfo {
  trabajadorId: number;
  nombre: string;
  cargo?: string;
}

export interface CentroDelMes {
  centroId: string;
  trabajadores: TrabajadorInfo[];
}

export type VistaEjecucion = 'meses' | 'trabajadores' | 'estadisticas' | 'trabajadores-tipo' | 'detalle';
