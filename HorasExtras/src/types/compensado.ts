// types/compensado.ts

export interface Compensado {
  id: number;
  trabajadorId: number;
  trabajadorNombre: string;
  centroId: string;
  centroNombre: string;
  fecha: string; // ISO string
  horaInicio: string; // "HH:mm"
  horaFin: string; // "HH:mm"
  horasCompensadas: number;
  periodoOrigenInicio: string; // ISO string
  periodoOrigenFin: string; // ISO string
  horasDisponiblesAntes: number;
  horasDisponiblesDespues: number;
  balanceOrigenTotal: number | null;
  fechaCreacion: string; // ISO string
  usuarioCreacion: string | null;
  descripcion: string | null;
  estado: 'ACTIVO' | 'CANCELADO';
}

export interface CrearCompensado {
  trabajadorId: number;
  centroId: string;
  fecha: string; // ISO string
  horaInicio: string; // "HH:mm"
  horaFin: string; // "HH:mm"
  horasCompensadas: number;
  periodoOrigenInicio: string; // ISO string
  periodoOrigenFin: string; // ISO string
  descripcion?: string;
  usuarioCreacion?: string;
}

export interface ActualizarCompensado {
  fecha: string; // ISO string
  horaInicio: string; // "HH:mm"
  horaFin: string; // "HH:mm"
  horasCompensadas: number;
  descripcion?: string;
  usuarioModificacion?: string;
}

export interface ConsultarHorasDisponibles {
  trabajadorId: number;
  periodoOrigenInicio: string; // ISO string
  periodoOrigenFin: string; // ISO string
}

export interface CompensadoResumen {
  id: number;
  fecha: string; // ISO string
  centroNombre: string;
  horasUtilizadas: number;
  estado: string;
}

export interface HorasDisponibles {
  trabajadorId: number;
  trabajadorNombre: string;
  periodoOrigenInicio: string; // ISO string
  periodoOrigenFin: string; // ISO string
  balanceTotal: number;
  horasYaUtilizadas: number;
  horasDisponibles: number;
  tieneHorasDisponibles: boolean;
  compensadosExistentes: CompensadoResumen[];
  mensaje: string;
}

export interface EstadisticasCompensados {
  totalCompensados: number;
  compensadosActivos: number;
  compensadosCancelados: number;
  totalHorasCompensadas: number;
  estadisticasPorTrabajador: EstadisticaTrabajador[];
  estadisticasPorCentro: EstadisticaCentro[];
}

export interface EstadisticaTrabajador {
  trabajadorId: number;
  trabajadorNombre: string;
  totalCompensados: number;
  totalHorasUtilizadas: number;
  ultimoCompensado: string; // ISO string
}

export interface EstadisticaCentro {
  centroId: string;
  centroNombre: string;
  totalCompensados: number;
  totalHorasUtilizadas: number;
  trabajadoresUnicos: number;
}