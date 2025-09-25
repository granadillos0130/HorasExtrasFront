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
  trabajadorId: number;
  nombreTrabajador: string;
  detalleDias: Array<{
    fecha: string;
    horasNormales: number;
    extrasDiurnas: number;
    extrasNocturnas: number;
    dominicalesDiurnas: number;
    dominicalesNocturnas: number;
    totalHoras: number;
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
