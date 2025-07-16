export interface Banco {
  id: number;
  nombre: string;
  numeroCuenta: string;
  trabajadorId: number;
}

export interface CrearBancoDto {
  nombre: string;
  numeroCuenta: string;
  trabajadorId: number;
}
