import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { registrosService } from "../api/registrosService";
import { trabajadoresService } from "../api/trabajadoresService";
import { centrosService } from "../api/centrosService";
import type { Registro, RegistroInputDto } from "../types/registros";
import type { Trabajador } from "../types/trabajadores";
import type { Centro } from "../types/centros";
import { convertirATimeSpan } from "../utils/registros/timeUtils";
import { useDuplicadoCheck } from "./useDuplicadoCheck";
import { useCargarCatalogos } from "./useCargarCatalogos";

// FUNCIÓN PARA LIMPIAR Y FORMATEAR TIEMPOS
const timeSpanToString = (timeString: string | null | undefined): string => {
  if (!timeString) return "";

  // Convertir a string y eliminar TODOS los espacios en blanco
  const str = String(timeString).replace(/\s+/g, '');

  if (!str) return "";

  // Si viene en formato "HH:mm:ss" o "HH:mm", procesar
  if (str.includes(':')) {
    const parts = str.split(':');

    if (parts.length >= 2) {
      // Asegurar que las partes sean números válidos
      const hoursNum = parseInt(parts[0], 10);
      const minutesNum = parseInt(parts[1], 10);

      if (!isNaN(hoursNum) && !isNaN(minutesNum) &&
        hoursNum >= 0 && hoursNum <= 23 &&
        minutesNum >= 0 && minutesNum <= 59) {

        const hours = hoursNum.toString().padStart(2, '0');
        const minutes = minutesNum.toString().padStart(2, '0');
        return `${hours}:${minutes}`;
      }
    }
  }

  return "";
};

// MAPEO DE PROPIEDADES: el registro puede llegar con distintas variantes de
// nombre de campo (camelCase, PascalCase, snake_case) según el endpoint.
const mapearPropiedad = (obj: Record<string, unknown>, propiedades: string[]) => {
  for (const prop of propiedades) {
    if (obj[prop] !== undefined && obj[prop] !== null) {
      return obj[prop];
    }
  }
  return null;
};

export function useEditarRegistro(id: string | undefined, returnUrl: string) {
  const navigate = useNavigate();

  const [registro, setRegistro] = useState<Registro | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");

  const [formData, setFormData] = useState<RegistroInputDto>({
    Trabajador_ID: 0,
    Centro_ID: "",
    Nombr_Centro: "",
    Fecha: "",
    Hora_Ingreso: "",
    Hora_Salida: "",
    Tiempo_Almuerzo: "",
    desplazamientoIda: "",
    desplazamientoRegreso: "",
    EsConductor: false,
    AnalistaId: 1
  });

  const { data: catalogos } = useCargarCatalogos<{
    trabajadores: () => Promise<Trabajador[]>;
    centros: () => Promise<Centro[]>;
  }>({
    trabajadores: () =>
      trabajadoresService.getAll().then((data) => data.filter((t) => t.estado === "Vigente")),
    centros: () => centrosService.getAll(),
  });
  const trabajadores = catalogos.trabajadores ?? [];
  const centros = catalogos.centros ?? [];

  const { registrosExistentes, showDuplicateWarning, verificandoRegistros } =
    useDuplicadoCheck(formData.Trabajador_ID, formData.Fecha, id ? Number(id) : undefined);

  // Cargar el registro a editar
  useEffect(() => {
    const cargarRegistro = async () => {
      try {
        setLoading(true);

        if (!id) {
          setError("ID de registro no válido");
          return;
        }

        const registroData = await registrosService.obtenerPorId(parseInt(id));
        setRegistro(registroData);

        // Extraer cada campo individualmente
        const registroObj = registroData as unknown as Record<string, unknown>;

        const trabajadorIdRaw = mapearPropiedad(registroObj, [
          'trabajadorId', 'TrabajadorId', 'trabajador_id', 'Trabajador_ID'
        ]);

        const centroIdRaw = mapearPropiedad(registroObj, [
          'centroId', 'CentroId', 'centro_id', 'Centro_ID'
        ]);

        const nombreCentroRaw = mapearPropiedad(registroObj, [
          'nombreCentro', 'NombreCentro', 'nombre_centro', 'Nombr_Centro'
        ]);

        const fechaRaw = mapearPropiedad(registroObj, [
          'fecha', 'Fecha'
        ]);

        const horaIngresoRaw = mapearPropiedad(registroObj, [
          'horaIngreso', 'HoraIngreso', 'hora_ingreso', 'Hora_Ingreso', 'horaInicio', 'HoraInicio'
        ]);

        const horaSalidaRaw = mapearPropiedad(registroObj, [
          'horaSalida', 'HoraSalida', 'hora_salida', 'Hora_Salida', 'horaFin', 'HoraFin'
        ]);

        const tiempoAlmuerzoRaw = mapearPropiedad(registroObj, [
          'tiempoAlmuerzo', 'TiempoAlmuerzo', 'tiempo_almuerzo', 'Tiempo_Almuerzo', 'almuerzo', 'Almuerzo'
        ]);

        const desplazamientoIdaRaw = mapearPropiedad(registroObj, [
          'desplazamientoIda', 'DesplazamientoIda', 'desplazamiento_ida', 'viaje_ida'
        ]);

        const desplazamientoRegresoRaw = mapearPropiedad(registroObj, [
          'desplazamientoRegreso', 'DesplazamientoRegreso', 'desplazamiento_regreso', 'viaje_regreso'
        ]);

        const esConductorRaw = mapearPropiedad(registroObj, [
          'esConductor', 'EsConductor', 'es_conductor', 'conductor'
        ]);

        // Limpiar y formatear los tiempos
        const horaIngresoLimpia = horaIngresoRaw ? timeSpanToString(horaIngresoRaw as string) : "";
        const horaSalidaLimpia = horaSalidaRaw ? timeSpanToString(horaSalidaRaw as string) : "";
        const desplazamientoIdaLimpio = desplazamientoIdaRaw ? timeSpanToString(desplazamientoIdaRaw as string) : "";
        const desplazamientoRegresoLimpio = desplazamientoRegresoRaw ? timeSpanToString(desplazamientoRegresoRaw as string) : "";

        // Preparar datos para el formulario
        let tiempoAlmuerzoMapeado = "";
        if (tiempoAlmuerzoRaw) {
          const tiempoStr = String(tiempoAlmuerzoRaw);
          if (tiempoStr === "00:00:00" || tiempoStr === "0:00:00") {
            tiempoAlmuerzoMapeado = ""; // Sin almuerzo
          } else {
            tiempoAlmuerzoMapeado = tiempoStr;
          }
        }

        setFormData({
          Trabajador_ID: (trabajadorIdRaw as number) || 0,
          Centro_ID: String(centroIdRaw || ""),
          Nombr_Centro: (nombreCentroRaw as string) || "",
          Fecha: (fechaRaw as string) || "",
          Hora_Ingreso: horaIngresoLimpia,
          Hora_Salida: horaSalidaLimpia,
          Tiempo_Almuerzo: tiempoAlmuerzoMapeado,
          desplazamientoIda: desplazamientoIdaLimpio,
          desplazamientoRegreso: desplazamientoRegresoLimpio,
          EsConductor: Boolean(esConductorRaw),
          AnalistaId: 1
        });

      } catch (err) {
        console.error("Error al cargar datos:", err);
        setError("Error al cargar los datos del registro");
      } finally {
        setLoading(false);
      }
    };

    cargarRegistro();
  }, [id]);

  const handleInputChange = (field: keyof RegistroInputDto, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCentroChange = (centroId: string, centro?: Centro) => {
    setFormData(prev => ({
      ...prev,
      Centro_ID: centroId,
      Nombr_Centro: centro?.nombreCentro || ""
    }));
  };

  const validarFormulario = (): string[] => {
    const errores: string[] = [];

    if (formData.Trabajador_ID === 0) {
      errores.push("Debe seleccionar un trabajador");
    }

    if (!formData.Centro_ID) {
      errores.push("Debe seleccionar un centro");
    }

    if (!formData.Fecha) {
      errores.push("Debe seleccionar una fecha");
    }

    if (!formData.Hora_Ingreso) {
      errores.push("Debe especificar la hora de ingreso");
    }

    if (!formData.Hora_Salida) {
      errores.push("Debe especificar la hora de salida");
    }

    // Validar que hora de salida sea posterior a hora de ingreso
    if (formData.Hora_Ingreso && formData.Hora_Salida) {
      const ingreso = new Date(`1970-01-01T${formData.Hora_Ingreso}:00`);
      const salida = new Date(`1970-01-01T${formData.Hora_Salida}:00`);

      if (salida <= ingreso) {
        errores.push("La hora de salida debe ser posterior a la hora de ingreso");
      }
    }

    return errores;
  };

  const handleGuardar = async () => {
    try {
      const errores = validarFormulario();
      if (errores.length > 0) {
        setError(errores.join(", "));
        return;
      }

      // Mostrar advertencia si hay registros duplicados
      if (showDuplicateWarning) {
        const trabajadorNombre = trabajadores.find(t => t.id === formData.Trabajador_ID)?.nombre || "este trabajador";
        const tipoTrabajador = formData.EsConductor ? "conductor" : "trabajador";
        const mensajeAlmuerzo = formData.Tiempo_Almuerzo
          ? (registrosExistentes.length === 0 ? 'El tiempo de almuerzo SÍ se descontará de este registro.' : 'El tiempo de almuerzo NO se descontará de este registro (ya hay otros registros en el día).')
          : 'No hay tiempo de almuerzo configurado para descontar.';

        const confirmMessage = `⚠️ ATENCIÓN: Además de este registro que está editando, ya existe${registrosExistentes.length > 1 ? 'n' : ''} ${registrosExistentes.length} registro${registrosExistentes.length > 1 ? 's' : ''} más para ${trabajadorNombre} en la fecha ${new Date(formData.Fecha).toLocaleDateString('es-ES')}.\n\n` +
          `${formData.EsConductor
            ? '🚛 CONDUCTOR: Los desplazamientos se incluirán como tiempo de trabajo.'
            : '👷 NO CONDUCTOR: Los desplazamientos se restarán del tiempo trabajado.'
          }\n\n` +
          `${mensajeAlmuerzo}\n\n` +
          `¿Está seguro que desea continuar actualizando este registro para ${tipoTrabajador}?`;

        if (!confirm(confirmMessage)) {
          return;
        }
      }

      setSaving(true);
      setError("");

      // Preparar datos para envío con nombres correctos para el backend C#
      const datosParaEnvio = {
        Trabajador_ID: formData.Trabajador_ID,
        Centro_ID: formData.Centro_ID,
        Nombr_Centro: formData.Nombr_Centro,
        Fecha: formData.Fecha,
        Hora_Ingreso: formData.Hora_Ingreso,
        Hora_Salida: formData.Hora_Salida,
        // Si está vacío, enviar null; si no, convertir a TimeSpan
        Tiempo_Almuerzo: formData.Tiempo_Almuerzo ? convertirATimeSpan(formData.Tiempo_Almuerzo) : null,
        // IMPORTANTE: El backend C# espera PascalCase para desplazamientos
        DesplazamientoIda: formData.desplazamientoIda ? convertirATimeSpan(formData.desplazamientoIda) : undefined,
        DesplazamientoRegreso: formData.desplazamientoRegreso ? convertirATimeSpan(formData.desplazamientoRegreso) : undefined,
        EsConductor: formData.EsConductor,
        AnalistaId: formData.AnalistaId || 1
      };

      await registrosService.actualizar(parseInt(id!), datosParaEnvio);

      const tipoMensaje = formData.EsConductor
        ? "✅ Registro de conductor actualizado correctamente (desplazamientos incluidos)"
        : "✅ Registro actualizado correctamente (desplazamientos descontados)";

      alert(tipoMensaje);

      // Redirigir con mensaje de éxito
      const targetUrl = new URL(returnUrl, window.location.origin);
      targetUrl.searchParams.set('success', 'registro-actualizado');
      navigate(targetUrl.pathname + targetUrl.search);

    } catch (err: unknown) {
      console.error("Error al guardar:", err);
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Error al guardar el registro");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelar = () => {
    navigate(returnUrl);
  };

  return {
    registro,
    loading,
    saving,
    error,
    setError,
    trabajadores,
    centros,
    formData,
    handleInputChange,
    handleCentroChange,
    handleGuardar,
    handleCancelar,
    registrosExistentes,
    showDuplicateWarning,
    verificandoRegistros,
  };
}
