export interface Preoperacional {
    id: string;
    vehiculo: string;
    placa: string;
    fecha: string;
    mes: string;
    semanaInspeccion: string;
    estado: 'OK' | 'Con Fallas' | 'Sin verificar';
    fallas: string[];
    diaSemana: string;
}

export interface PreoperacionalFilters {
    vehiculo?: string;
    estado?: string;
    fechaDesde?: string;
    fechaHasta?: string;
}

