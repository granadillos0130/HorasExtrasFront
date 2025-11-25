export const calcularDiasAusencia = (fechaInicio: Date, fechaFin: Date): number => {
  const tiempoTranscurrido = fechaFin.getTime() - fechaInicio.getTime();
  const diasTranscurridos = Math.ceil(tiempoTranscurrido / (1000 * 60 * 60 * 24));
  return diasTranscurridos + 1;
};

export const calcularHorasTotales = (
  horaInicio: string, 
  horaFin: string, 
  dias: number,
  esVacaciones: boolean
): number => {
  if (esVacaciones) {
    return dias * 8;
  }

  const [horaInicioH, horaInicioM] = horaInicio.split(':').map(Number);
  const [horaFinH, horaFinM] = horaFin.split(':').map(Number);

  const minutosInicio = horaInicioH * 60 + horaInicioM;
  const minutosFin = horaFinH * 60 + horaFinM;

  let horasPorDia = (minutosFin - minutosInicio) / 60;

  const inicioAlmuerzoMinutos = 12 * 60 + 30;
  const finAlmuerzoMinutos = 14 * 60;
  const duracionAlmuerzo = 1.5;

  const incluyeAlmuerzo = minutosInicio < finAlmuerzoMinutos && minutosFin > inicioAlmuerzoMinutos;

  if (incluyeAlmuerzo) {
    const inicioDescuento = Math.max(minutosInicio, inicioAlmuerzoMinutos);
    const finDescuento = Math.min(minutosFin, finAlmuerzoMinutos);
    const tiempoAlmuerzoIncluido = (finDescuento - inicioDescuento) / 60;
    const descuentoReal = Math.min(tiempoAlmuerzoIncluido, duracionAlmuerzo);
    horasPorDia = Math.max(0, horasPorDia - descuentoReal);
  }

  return horasPorDia * dias;
};

export const verificaIncluyeAlmuerzo = (horaInicio: string, horaFin: string): boolean => {
  const horaInicioMinutos = parseInt(horaInicio.split(':')[0]) * 60 + parseInt(horaInicio.split(':')[1]);
  const horaFinMinutos = parseInt(horaFin.split(':')[0]) * 60 + parseInt(horaFin.split(':')[1]);
  return horaInicioMinutos < 840 && horaFinMinutos > 750;
};

export const calcularHorasBrutas = (horaInicio: string, horaFin: string): number => {
  const horaInicioMinutos = parseInt(horaInicio.split(':')[0]) * 60 + parseInt(horaInicio.split(':')[1]);
  const horaFinMinutos = parseInt(horaFin.split(':')[0]) * 60 + parseInt(horaFin.split(':')[1]);
  return (horaFinMinutos - horaInicioMinutos) / 60;
};

export const esVacaciones = (tipoAusencia: string): boolean => {
  return tipoAusencia.toLowerCase().includes("vacacion");
};

export const tiposConDiagnostico = [
  "Cita médica general",
  "Cita Seguimiento EO",
  "Enfermedad común",
  "Enfermedad Laboral"
];

export const mostrarCampoDiagnostico = (tipoAusencia: string): boolean => {
  return tiposConDiagnostico.includes(tipoAusencia);
};

export const generarMensajeExito = (
  esVacacion: boolean,
  diasAusencia: number,
  horasTotales: number,
  formData: {
    fechaInicio: Date;
    fechaFin: Date;
    horaInicio: string;
    horaFin: string;
    tipoAusencia: string;
    remunerado: boolean;
    diagnosticoCodigo: string;
    diagnosticoDescripcion: string;
  },
  diasVacaciones: number,
  diasADescontar: number,
  fechaRegreso: Date | null
): string => {
  if (esVacacion) {
    return `success:Vacaciones registradas exitosamente

DETALLES DE LAS VACACIONES:
- Días solicitados: ${diasVacaciones} días
- Período: ${formData.fechaInicio.toLocaleDateString('es-ES')} - ${formData.fechaFin.toLocaleDateString('es-ES')}
- Días calendarios totales: ${diasAusencia} días
- Días laborables a descontar: ${diasADescontar} días
- Fecha de regreso: ${fechaRegreso?.toLocaleDateString('es-ES') || 'No calculada'}

INTEGRACIÓN AUTOMÁTICA CON REGISTROS:
- Se crearon ${diasAusencia} registro${diasAusencia > 1 ? 's' : ''} de vacaciones
- Horario: Día completo (08:00 - 17:00)
- Total de horas: ${horasTotales.toFixed(2)} horas

${formData.remunerado
      ? `VACACIONES REMUNERADAS:
- Las horas contarán como horas normales trabajadas
- Se incluirán en el cálculo de jornada completa`
      : `VACACIONES NO REMUNERADAS:
- Las horas se marcarán como horas ausentes
- No contarán para horas normales trabajadas`
    }

Los registros aparecerán marcados como "AUSENCIA - Vacaciones" en el Dashboard de Registros.`;
  }

  return `success:Ausencia registrada exitosamente

INTEGRACIÓN AUTOMÁTICA CON REGISTROS:
- Se crearon ${diasAusencia} registro${diasAusencia > 1 ? 's' : ''} en el sistema de horas
- Fechas afectadas: ${formData.fechaInicio.toLocaleDateString('es-ES')} - ${formData.fechaFin.toLocaleDateString('es-ES')}
- Horario de ausencia: ${formData.horaInicio} - ${formData.horaFin}
- Total de horas: ${horasTotales.toFixed(2)} horas
${formData.diagnosticoCodigo ? `• Diagnóstico: ${formData.diagnosticoCodigo} - ${formData.diagnosticoDescripcion}` : ''}

${formData.remunerado
    ? `AUSENCIA REMUNERADA:
- Las horas contarán como horas normales trabajadas
- Se incluirán en el cálculo de jornada completa`
    : `AUSENCIA NO REMUNERADA:
- Las horas se marcarán como horas ausentes
- No contarán para horas normales trabajadas`
  }

Los registros aparecerán marcados como "AUSENCIA - ${formData.tipoAusencia}" en el Dashboard.`;
};