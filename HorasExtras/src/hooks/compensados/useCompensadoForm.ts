import { useState, useEffect } from "react";
import { compensadoService } from "../../api/compensadosService";
import { centrosService } from "../../api/centrosService";
import type { CrearCompensado, HorasDisponibles } from "../../types/compensado";
import type { Trabajador } from "../../types/trabajadores";
import type { Centro } from "../../types/centros";
import { getApiErrorField, getErrorMessage } from "../../utils/errorUtils";

export interface ValidacionCompensado {
  esValido: boolean;
  horasBrutas: number;
  tiempoAlmuerzoDescontado: number;
  horasEfectivas: number;
  horasDisponibles: number;
  horasSobrantes: number;
  yaHayAlmuerzoEnOtraActividad: boolean;
  mensaje: string;
}

const initialCompensadoState: CrearCompensado = {
  trabajadorId: 0,
  centroId: "",
  fecha: new Date().toISOString().split('T')[0],
  horaInicio: "08:00",
  horaFin: "12:00",
  horasCompensadas: 4.0,
  periodoOrigenInicio: "",
  periodoOrigenFin: "",
  descripcion: "",
  usuarioCreacion: ""
};

export function useCompensadoForm() {
  const [formData, setFormData] = useState<CrearCompensado>(initialCompensadoState);
  const [mensaje, setMensaje] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Estados para trabajadores
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [trabajadorSeleccionado, setTrabajadorSeleccionado] = useState<Trabajador | null>(null);
  const [loadingTrabajadores, setLoadingTrabajadores] = useState(true);

  // Estados para centros
  const [centros, setCentros] = useState<Centro[]>([]);
  const [loadingCentros, setLoadingCentros] = useState(true);

  // Estados para horas disponibles
  const [horasDisponibles, setHorasDisponibles] = useState<HorasDisponibles | null>(null);
  const [loadingHoras, setLoadingHoras] = useState(false);

  // Estados para validación de compensado
  const [validacionCompensado, setValidacionCompensado] = useState<ValidacionCompensado | null>(null);
  const [loadingValidacion, setLoadingValidacion] = useState(false);

  // Cargar trabajadores al montar
  useEffect(() => {
    const cargarTrabajadores = async () => {
      try {
        setLoadingTrabajadores(true);
        const data = await compensadoService.getTrabajadoresConBancoHoras();
        setTrabajadores(data);
      } catch (error) {
        console.error("Error al cargar trabajadores:", error);
        setMensaje("error:Error al cargar la lista de trabajadores con banco de horas.");
      } finally {
        setLoadingTrabajadores(false);
      }
    };

    cargarTrabajadores();
  }, []);

  // Cargar centros al montar
  useEffect(() => {
    const cargarCentros = async () => {
      try {
        setLoadingCentros(true);
        const data = await centrosService.getAll();
        const centrosActivos = data.filter(c => (c.estado as unknown) !== false);
        setCentros(centrosActivos);
      } catch (error) {
        console.error("Error al cargar centros:", error);
        setMensaje("error:Error al cargar la lista de centros de trabajo.");
      } finally {
        setLoadingCentros(false);
      }
    };

    cargarCentros();
  }, []);

  // Consultar horas disponibles cuando cambien período y trabajador
  useEffect(() => {
    const consultarHoras = async () => {
      if (!formData.trabajadorId || !formData.periodoOrigenInicio || !formData.periodoOrigenFin) {
        setHorasDisponibles(null);
        return;
      }

      if (new Date(formData.periodoOrigenInicio) >= new Date(formData.periodoOrigenFin)) {
        setHorasDisponibles(null);
        return;
      }

      setLoadingHoras(true);
      try {
        const horas = await compensadoService.getHorasDisponibles(
          formData.trabajadorId,
          formData.periodoOrigenInicio,
          formData.periodoOrigenFin
        );
        setHorasDisponibles(horas);
      } catch (error) {
        console.error("Error al consultar horas disponibles:", error);
        setHorasDisponibles(null);
      } finally {
        setLoadingHoras(false);
      }
    };

    const timeoutId = setTimeout(consultarHoras, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.trabajadorId, formData.periodoOrigenInicio, formData.periodoOrigenFin]);

  // Validar automáticamente cuando cambien los datos relevantes
  useEffect(() => {
    const validarAutomaticamente = async () => {
      if (
        !formData.trabajadorId ||
        !formData.centroId ||
        !formData.fecha ||
        !formData.horaInicio ||
        !formData.horaFin ||
        !formData.periodoOrigenInicio ||
        !formData.periodoOrigenFin ||
        !horasDisponibles
      ) {
        setValidacionCompensado(null);
        return;
      }

      setLoadingValidacion(true);
      try {
        const validacion = await compensadoService.validarCompensadoConAlmuerzo({
          trabajadorId: formData.trabajadorId,
          centroId: formData.centroId,
          fecha: formData.fecha,
          horaInicio: formData.horaInicio,
          horaFin: formData.horaFin,
          horasCompensadas: formData.horasCompensadas,
          periodoOrigenInicio: formData.periodoOrigenInicio,
          periodoOrigenFin: formData.periodoOrigenFin,
          descripcion: formData.descripcion,
          usuarioCreacion: formData.usuarioCreacion
        });
        setValidacionCompensado(validacion);
      } catch (error) {
        console.error("Error al validar compensado:", error);
        setValidacionCompensado(null);
      } finally {
        setLoadingValidacion(false);
      }
    };

    const timeoutId = setTimeout(validarAutomaticamente, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.trabajadorId, formData.centroId, formData.fecha, formData.horaInicio, formData.horaFin, formData.periodoOrigenInicio, formData.periodoOrigenFin, horasDisponibles, formData.horasCompensadas, formData.descripcion, formData.usuarioCreacion]);

  // Calcular horas automáticamente cuando cambien las horas de inicio/fin
  useEffect(() => {
    if (formData.horaInicio && formData.horaFin) {
      const [horaInicioH, horaInicioM] = formData.horaInicio.split(':').map(Number);
      const [horaFinH, horaFinM] = formData.horaFin.split(':').map(Number);

      const minutosInicio = horaInicioH * 60 + horaInicioM;
      const minutosFin = horaFinH * 60 + horaFinM;

      if (minutosFin > minutosInicio) {
        const horas = (minutosFin - minutosInicio) / 60;
        setFormData(prev => ({
          ...prev,
          horasCompensadas: parseFloat(horas.toFixed(2))
        }));
      }
    }
  }, [formData.horaInicio, formData.horaFin]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTrabajadorSelect = (trabajadorId: number, trabajador?: Trabajador) => {
    setTrabajadorSeleccionado(trabajador || null);
    setFormData(prev => ({
      ...prev,
      trabajadorId: trabajadorId
    }));
    setHorasDisponibles(null);
    setValidacionCompensado(null);
  };

  const handleConsultarHoras = () => {
    if (formData.trabajadorId && formData.periodoOrigenInicio && formData.periodoOrigenFin) {
      setLoadingHoras(true);
      compensadoService.getHorasDisponibles(
        formData.trabajadorId,
        formData.periodoOrigenInicio,
        formData.periodoOrigenFin
      ).then(setHorasDisponibles)
        .finally(() => setLoadingHoras(false));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMensaje("");

    try {
      const validacion = compensadoService.validarCompensado(formData);
      if (!validacion.valido) {
        setMensaje("error:" + validacion.errores.join("\n"));
        return;
      }

      if (!validacionCompensado || !validacionCompensado.esValido) {
        setMensaje(`error:${validacionCompensado?.mensaje || "No se pudo validar el compensado"}`);
        return;
      }

      await compensadoService.crear(formData);

      setMensaje(`success:🎉 ¡Compensado creado exitosamente!

📋 DETALLES DEL COMPENSADO:
- Trabajador: ${trabajadorSeleccionado?.nombre}
- Centro: ${centros.find(c => c.id === formData.centroId)?.nombreCentro}
- Fecha: ${new Date(formData.fecha).toLocaleDateString('es-ES')}
- Horario: ${formData.horaInicio} - ${formData.horaFin}
- Horas brutas: ${validacionCompensado.horasBrutas.toFixed(2)} horas
- Descuento almuerzo: ${validacionCompensado.tiempoAlmuerzoDescontado.toFixed(2)} horas
- Horas efectivas utilizadas: ${validacionCompensado.horasEfectivas.toFixed(2)} horas

💰 DESCUENTO DE BANCO DE HORAS:
- Horas disponibles antes: ${validacionCompensado.horasDisponibles.toFixed(2)} horas
- Horas utilizadas: ${validacionCompensado.horasEfectivas.toFixed(2)} horas
- Horas restantes: ${validacionCompensado.horasSobrantes.toFixed(2)} horas

📅 PERÍODO ORIGEN DE LAS HORAS:
- ${new Date(formData.periodoOrigenInicio).toLocaleDateString('es-ES')} - ${new Date(formData.periodoOrigenFin).toLocaleDateString('es-ES')}

🍽️ INFORMACIÓN DE ALMUERZO:
- ${validacionCompensado.yaHayAlmuerzoEnOtraActividad
  ? "No se descontó almuerzo (ya existe en otro registro del día)"
  : validacionCompensado.tiempoAlmuerzoDescontado > 0
    ? `Se descontaron ${validacionCompensado.tiempoAlmuerzoDescontado.toFixed(2)}h de almuerzo`
    : "No se descontó almuerzo (jornada parcial)"}

🔗 INTEGRACIÓN AUTOMÁTICA:
- Se creó automáticamente un registro en RegistrosTrabajoDiarios
- Aparecerá como trabajo normal en el centro seleccionado
- Las horas se registran como "horas normales" (no generan extras)
- El registro estará marcado como "COMPENSADO" para identificación`);

      setFormData({
        ...initialCompensadoState,
        trabajadorId: formData.trabajadorId,
        periodoOrigenInicio: formData.periodoOrigenInicio,
        periodoOrigenFin: formData.periodoOrigenFin
      });

      setTimeout(() => {
        if (formData.trabajadorId && formData.periodoOrigenInicio && formData.periodoOrigenFin) {
          compensadoService.getHorasDisponibles(
            formData.trabajadorId,
            formData.periodoOrigenInicio,
            formData.periodoOrigenFin
          ).then(setHorasDisponibles);
        }
      }, 1000);

    } catch (error: unknown) {
      console.error("Error al crear compensado:", error);
      const detalle = getApiErrorField(error, "error") || getErrorMessage(error);
      setMensaje(`error:❌ Error al crear el compensado.\n\n${detalle || "Error desconocido"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLimpiar = () => {
    setFormData(initialCompensadoState);
    setTrabajadorSeleccionado(null);
    setHorasDisponibles(null);
    setValidacionCompensado(null);
    setMensaje("");
  };

  return {
    formData,
    mensaje,
    isLoading,
    trabajadores,
    trabajadorSeleccionado,
    loadingTrabajadores,
    centros,
    loadingCentros,
    horasDisponibles,
    loadingHoras,
    validacionCompensado,
    loadingValidacion,
    handleChange,
    handleTrabajadorSelect,
    handleConsultarHoras,
    handleSubmit,
    handleLimpiar,
  };
}
