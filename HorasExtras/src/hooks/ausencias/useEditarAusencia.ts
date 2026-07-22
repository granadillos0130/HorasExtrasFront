import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ausenciasService,
  validarDiasVacaciones,
} from "../../api/ausenciasService";
import { trabajadoresService } from "../../api/trabajadoresService";
import type {
  Ausencia,
  AusenciaDto,
  ValidacionVacacionesResponse
} from "../../types/ausencia";
import type { Trabajador } from "../../types/trabajadores";
import type { Diagnostico } from "../../types/diagnostico";

const initialFormData = {
  fecha: "",
  tipoAusencia: "",
  descripcion: "",
  trabajadorNombre: "",
  cargo: "",
  fechaInicio: "",
  fechaFin: "",
  horaInicio: "",
  horaFin: "",
  remunerado: false,
  diagnosticoId: undefined as number | undefined,
  diagnosticoCodigo: "",
  diagnosticoDescripcion: ""
};

export function useEditarAusencia(id: string | undefined) {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [ausencia, setAusencia] = useState<Ausencia | null>(null);
  const [error, setError] = useState<string>("");
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [trabajadorSeleccionadoId, setTrabajadorSeleccionadoId] = useState<number>(0);

  const [validacionVacaciones, setValidacionVacaciones] = useState<ValidacionVacacionesResponse | null>(null);
  const [loadingValidacion, setLoadingValidacion] = useState(false);

  const [formData, setFormData] = useState(initialFormData);

  // Función para verificar si es vacaciones (memoizada)
  const esVacaciones = useCallback(() => {
    return formData.tipoAusencia.toLowerCase().includes("vacacion");
  }, [formData.tipoAusencia]);

  // Función para validar vacaciones cuando cambien fechas o trabajador (memoizada)
  const validarVacacionesSiAplica = useCallback(async () => {
    if (!esVacaciones() || !trabajadorSeleccionadoId || !formData.fechaInicio || !formData.fechaFin) {
      setValidacionVacaciones(null);
      return;
    }

    setLoadingValidacion(true);
    try {
      const validacion = await validarDiasVacaciones({
        fechaInicio: new Date(formData.fechaInicio),
        fechaFin: new Date(formData.fechaFin),
        tipoAusencia: formData.tipoAusencia,
        trabajadorId: trabajadorSeleccionadoId
      });
      setValidacionVacaciones(validacion);
    } catch (error) {
      console.error("Error al validar vacaciones:", error);
      setValidacionVacaciones(null);
    } finally {
      setLoadingValidacion(false);
    }
  }, [esVacaciones, trabajadorSeleccionadoId, formData.fechaInicio, formData.fechaFin, formData.tipoAusencia]);

  // Effect para validar vacaciones cuando cambien las dependencias
  useEffect(() => {
    if (esVacaciones() && trabajadorSeleccionadoId && formData.fechaInicio && formData.fechaFin) {
      const timeoutId = setTimeout(() => {
        validarVacacionesSiAplica();
      }, 500);

      return () => clearTimeout(timeoutId);
    } else {
      setValidacionVacaciones(null);
    }
  }, [esVacaciones, validarVacacionesSiAplica, trabajadorSeleccionadoId, formData.fechaInicio, formData.fechaFin]);

  // Función para determinar si mostrar el campo diagnóstico
  const mostrarCampoDiagnostico = () => {
    const tiposConDiagnostico = [
      "Cita médica general",
      "Cita Seguimiento EO",
      "Enfermedad común",
      "Enfermedad Laboral"
    ];

    return tiposConDiagnostico.includes(formData.tipoAusencia);
  };

  // Cargar trabajadores al montar el componente
  useEffect(() => {
    const cargarTrabajadores = async () => {
      try {
        const data = await trabajadoresService.getAll();
        setTrabajadores(data);
      } catch (error) {
        console.error("Error al cargar trabajadores:", error);
      }
    };

    cargarTrabajadores();
  }, []);

  // Cargar datos de la ausencia al montar el componente
  useEffect(() => {
    const cargarAusencia = async () => {
      if (!id) {
        setError("ID de ausencia no válido");
        setLoading(false);
        return;
      }

      try {
        const ausenciaData = await ausenciasService.getById(parseInt(id));
        setAusencia(ausenciaData);

        // Buscar el trabajador para obtener el ID
        const trabajador = trabajadores.find(t => t.nombre === ausenciaData.trabajadorNombre);
        if (trabajador) {
          setTrabajadorSeleccionadoId(trabajador.id);
        }

        // Llenar el formulario con los datos existentes
        setFormData({
          fecha: ausenciaData.fecha.split('T')[0],
          tipoAusencia: ausenciaData.tipoAusencia,
          descripcion: ausenciaData.descripcion,
          trabajadorNombre: ausenciaData.trabajadorNombre,
          cargo: ausenciaData.cargo,
          fechaInicio: ausenciaData.fechaInicio.split('T')[0],
          fechaFin: ausenciaData.fechaFin.split('T')[0],
          horaInicio: ausenciaData.horaInicio,
          horaFin: ausenciaData.horaFin,
          remunerado: ausenciaData.remunerado,
          diagnosticoId: ausenciaData.diagnosticoId,
          diagnosticoCodigo: ausenciaData.diagnosticoCodigo || "",
          diagnosticoDescripcion: ausenciaData.diagnosticoDescripcion || ""
        });
      } catch (error) {
        console.error("Error al cargar ausencia:", error);
        setError("Error al cargar los datos de la ausencia");
      } finally {
        setLoading(false);
      }
    };

    if (trabajadores.length > 0) {
      cargarAusencia();
    }
  }, [id, trabajadores]);

  // Manejar cambios en los inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (name === "tipoAusencia") {
      // Cuando cambie el tipo de ausencia, ajustar horarios
      const nuevasHoras = value.toLowerCase().includes("vacacion")
        ? { horaInicio: "08:00", horaFin: "17:00" } // Día completo para vacaciones
        : { horaInicio: formData.horaInicio, horaFin: formData.horaFin }; // Mantener horas actuales para otras

      setFormData(prev => ({
        ...prev,
        tipoAusencia: value,
        // Limpiar diagnóstico cuando cambia el tipo
        diagnosticoId: undefined,
        diagnosticoCodigo: "",
        diagnosticoDescripcion: "",
        ...nuevasHoras
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  // Manejar selección de trabajador
  const handleTrabajadorSelect = (trabajadorId: number, trabajador?: Trabajador) => {
    setTrabajadorSeleccionadoId(trabajadorId);

    if (trabajador) {
      setFormData(prev => ({
        ...prev,
        trabajadorNombre: trabajador.nombre,
        cargo: trabajador.cargo || ""
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        trabajadorNombre: "",
        cargo: ""
      }));
    }
  };

  // Manejar selección de diagnóstico
  const handleDiagnosticoSelect = (diagnosticoId: number | undefined, diagnostico?: Diagnostico) => {
    setFormData(prev => ({
      ...prev,
      diagnosticoId: diagnosticoId,
      diagnosticoCodigo: diagnostico?.codigo || "",
      diagnosticoDescripcion: diagnostico?.descripcion || ""
    }));
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id || !ausencia) return;

    setGuardando(true);
    setError("");

    try {
      const ausenciaDto: AusenciaDto = {
        id: ausencia.id,
        fecha: new Date(formData.fecha),
        tipoAusencia: formData.tipoAusencia,
        descripcion: formData.descripcion,
        trabajadorNombre: formData.trabajadorNombre,
        cargo: formData.cargo,
        fechaInicio: new Date(formData.fechaInicio),
        fechaFin: new Date(formData.fechaFin),
        horaInicio: formData.horaInicio,
        horaFin: formData.horaFin,
        remunerado: formData.remunerado,
        diagnosticoId: formData.diagnosticoId,
        diagnosticoCodigo: formData.diagnosticoCodigo,
        diagnosticoDescripcion: formData.diagnosticoDescripcion
      };

      await ausenciasService.actualizarAusencia(parseInt(id), ausenciaDto);

      console.log("✅ Ausencia actualizada correctamente");
      navigate("/ausencias", {
        state: {
          message: esVacaciones()
            ? "Vacaciones actualizadas correctamente"
            : "Ausencia actualizada correctamente",
          type: "success"
        }
      });
    } catch (error) {
      console.error("Error al actualizar ausencia:", error);
      setError("Error al actualizar la ausencia. Por favor, intenta de nuevo.");
    } finally {
      setGuardando(false);
    }
  };

  return {
    loading,
    guardando,
    ausencia,
    error,
    trabajadores,
    trabajadorSeleccionadoId,
    validacionVacaciones,
    loadingValidacion,
    formData,
    esVacaciones,
    mostrarCampoDiagnostico,
    handleInputChange,
    handleTrabajadorSelect,
    handleDiagnosticoSelect,
    handleSubmit,
  };
}
