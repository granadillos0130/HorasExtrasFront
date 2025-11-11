export interface LoginRequest {
  cedulaOrEmail: string;
  password: string;
}

export interface TrabajadorDto {
  id: number;
  nombre: string;
  cedula: string | null;
  correoElectronico: string | null;
  cargoDesempenado: string | null;
  imagen_Url: string | null;
}

export interface LoginResponse {
  success: boolean;
  message: string | null;
  token: string | null;
  trabajador: TrabajadorDto | null;
}