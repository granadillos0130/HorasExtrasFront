// types/consolidado.ts o agregar a types/registros.ts

export interface TotalesHoras {
  horasNormales: number;
  horasExtrasDiurnas: number;
  horasExtrasNocturnas: number;
  extrasDominicalesDiurnas: number;
  extrasDominicalesNocturnas: number;
  totalHoras: number;
}

export interface TrabajadorConsolidado {
  trabajadorId: number;
  nombre: string;
  cedula: string;
  estado: string;
  totales: TotalesHoras;
  diasRegistrados: number;
  centrosUnicos: number;
}

export interface MetadataConsolidado {
  totalTrabajadores: number;
  fechaInicio: string;
  fechaFin: string;
  diasEnRango: number;
  estadoFiltro: string;
  busquedaAplicada: string;
}

export interface RespuestaConsolidadoIntensidad {
  success: boolean;
  trabajadores: TrabajadorConsolidado[];
  totalesGenerales: TotalesHoras;
  metadata: MetadataConsolidado;
}