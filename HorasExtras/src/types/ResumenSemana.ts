// src/types/resumenSemana.ts
export interface ResumenSemana {
  trabajadorId: number;
  semana: number;
  horasNormales: number;
  extrasDiurnas: number;
  extrasNocturnas: number;
  extrasDomDiurnas: number;
  extrasDomNocturnas: number;
  total: number;
}
