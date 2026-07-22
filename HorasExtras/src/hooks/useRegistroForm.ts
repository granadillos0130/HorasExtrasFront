import { AxiosError } from "axios";
import { useState, useEffect } from "react";
import { trabajadoresService } from "../api/trabajadoresService";
import { centrosService } from "../api/centrosService";
import { cursosService } from "../api/cursoService";
import { registrosService } from "../api/registrosService";
import type { Trabajador } from "../types/trabajadores";
import type { Centro } from "../types/centros";
import type { Curso, RegistroInputDto, TipoDestino } from "../types/registros";
import { convertirATimeSpan } from "../utils/registros/timeUtils";
import { useDuplicadoCheck } from "./useDuplicadoCheck";
import { useCargarCatalogos } from "./useCargarCatalogos";

export function useRegistroForm(onSuccess: () => void, fechaInicial?: string) {
  const [loading, setLoading] = useState(false);

  // Catálogos cargados al montar
  const { data: catalogos } = useCargarCatalogos<{
    trabajadores: () => Promise<Trabajador[]>;
    centros: () => Promise<Centro[]>;
    cursos: () => Promise<Curso[]>;
    analistas: () => Promise<{ id: number; nombreCompleto: string }[]>;
  }>({
    trabajadores: () =>
      trabajadoresService.getAll().then((data) =>
        data.filter((t) => t && t.id && t.nombre && t.cedula)
      ),
    centros: () => centrosService.getAll(),
    cursos: () => cursosService.getAll(),
    analistas: () => trabajadoresService.getAnalistas(),
  });
  const trabajadores = catalogos.trabajadores ?? [];
  const centros = catalogos.centros ?? [];
  const cursos = catalogos.cursos ?? [];
  const analistas = catalogos.analistas ?? [];

  // Estado para tipo de destino (centro o curso)
  const [tipoDestino, setTipoDestino] = useState<TipoDestino>('centro');

  const [formData, setFormData] = useState<RegistroInputDto>({
    Trabajador_ID: 0,
    Centro_ID: "",
    Nombr_Centro: "",
    CursoId: undefined,
    CursoNombre: undefined,
    CursoDescripcion: undefined,
    Fecha: fechaInicial || new Date().toISOString().split("T")[0],
    FechaSalida: undefined,
    Hora_Ingreso: "08:00",
    Hora_Salida: "17:00",
    Tiempo_Almuerzo: "01:00",
    desplazamientoIda: "",
    desplazamientoRegreso: "",
    EsConductor: false,
  });

  // Sincronizar fecha inicial
  useEffect(() => {
    if (fechaInicial) {
      setFormData((prev) => ({
        ...prev,
        Fecha: fechaInicial,
      }));
    }
  }, [fechaInicial]);

  // Limpiar selección al cambiar tipo de destino
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      Centro_ID: "",
      Nombr_Centro: "",
      CursoId: undefined,
      CursoNombre: undefined,
      CursoDescripcion: undefined,
    }));
  }, [tipoDestino]);

  const { registrosExistentes, showDuplicateWarning, verificandoRegistros } =
    useDuplicadoCheck(formData.Trabajador_ID, formData.Fecha);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Verificar que tenga centro O curso
    const tieneCentro = formData.Centro_ID && formData.Nombr_Centro;
    const tieneCurso = formData.CursoId && formData.CursoId > 0;

    if (!formData.Trabajador_ID) {
      alert("Por favor seleccione un trabajador");
      return;
    }

    if (!tieneCentro && !tieneCurso) {
      alert(`Por favor seleccione un ${tipoDestino === 'centro' ? 'centro' : 'curso'}`);
      return;
    }

    if (tieneCentro && tieneCurso) {
      alert("No puede seleccionar tanto centro como curso. Elija uno.");
      return;
    }

    if (showDuplicateWarning) {
      const trabajadorNombre = trabajadores.find(t => t.id === formData.Trabajador_ID)?.nombre || "este trabajador";
      const tipoTrabajador = formData.EsConductor ? "conductor" : "trabajador";
      const tipoDestinoTexto = tieneCurso ? "curso" : "centro";
      const nombreDestino = tieneCurso ? formData.CursoNombre : formData.Nombr_Centro;

      const confirmMessage = `⚠️ ATENCIÓN: Ya existe${registrosExistentes.length > 1 ? 'n' : ''} ${registrosExistentes.length} registro${registrosExistentes.length > 1 ? 's' : ''} para ${trabajadorNombre} en la fecha ${new Date(formData.Fecha).toLocaleDateString('es-ES')}.\n\n` +
        `${formData.EsConductor
          ? '🚛 CONDUCTOR: Los desplazamientos se incluirán como tiempo de trabajo.'
          : '👷 NO CONDUCTOR: Los desplazamientos se restarán del tiempo trabajado.'
        }\n\n` +
        `${registrosExistentes.length === 1 ? 'El tiempo de almuerzo NO se descontará de este nuevo registro.' : 'El tiempo de almuerzo ya fue descontado en el primer registro del día.'}\n\n` +
        `¿Está seguro que desea continuar creando este registro adicional de ${tipoDestinoTexto} "${nombreDestino}" para ${tipoTrabajador}?`;

      if (!confirm(confirmMessage)) {
        return;
      }
    }

    setLoading(true);

    try {
      const normalizarHora = (hora: string) =>
        hora.length === 5 ? `${hora}:00` : hora;

      // Preparar payload según tipo de destino
      const payload: RegistroInputDto = {
        ...formData,
        Tiempo_Almuerzo: !formData.Tiempo_Almuerzo || formData.Tiempo_Almuerzo === ""
          ? null  // Enviar null para "sin almuerzo"
          : normalizarHora(formData.Tiempo_Almuerzo),
        desplazamientoIda: formData.desplazamientoIda?.trim()
          ? convertirATimeSpan(formData.desplazamientoIda)
          : undefined,
        desplazamientoRegreso: formData.desplazamientoRegreso?.trim()
          ? convertirATimeSpan(formData.desplazamientoRegreso)
          : undefined,
      };

      // Limpiar campos según el tipo seleccionado
      if (tipoDestino === 'centro') {
        payload.CursoId = undefined;
        payload.CursoNombre = undefined;
        payload.CursoDescripcion = undefined;
      } else {
        payload.Centro_ID = "";
        payload.Nombr_Centro = "";
      }

      await registrosService.crear(payload);

      const tipoDestinoTexto = tieneCurso ? "curso" : "centro";
      const nombreDestino = tieneCurso ? formData.CursoNombre : formData.Nombr_Centro;
      const tipoMensaje = formData.EsConductor
        ? `Registro de ${tipoDestinoTexto} "${nombreDestino}" creado correctamente para conductor (desplazamientos incluidos)`
        : `Registro de ${tipoDestinoTexto} "${nombreDestino}" creado correctamente (desplazamientos descontados)`;

      alert(tipoMensaje);
      onSuccess();
    } catch (error: unknown) {
      console.error("Error al crear registro:", error);
      if (error instanceof AxiosError && error.response?.data) {
        alert(
          "Error del servidor:\n" +
          JSON.stringify(error.response.data, null, 2)
        );
      } else {
        alert("Error al crear el registro");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof RegistroInputDto, value: string | number | boolean | undefined) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTrabajadorChange = (trabajadorId: number) => {
    setFormData((prev) => ({
      ...prev,
      Trabajador_ID: trabajadorId,
    }));
  };

  const handleCentroChange = (centroId: string) => {
    const centroSeleccionado = centros.find((c) => c.id === centroId);
    setFormData((prev) => ({
      ...prev,
      Centro_ID: centroId,
      Nombr_Centro: centroSeleccionado?.nombreCentro || "",
      // Limpiar campos de curso al seleccionar centro
      CursoId: undefined,
      CursoNombre: undefined,
      CursoDescripcion: undefined,
    }));
  };

  const handleCursoChange = (cursoId: number, curso?: Curso) => {
    setFormData((prev) => ({
      ...prev,
      CursoId: cursoId > 0 ? cursoId : undefined,
      CursoNombre: curso?.nombre || undefined,
      CursoDescripcion: curso?.descripcion || undefined,
      // Limpiar campos de centro al seleccionar curso
      Centro_ID: "",
      Nombr_Centro: "",
    }));
  };

  const handleTipoDestinoChange = (tipo: TipoDestino) => {
    setTipoDestino(tipo);
  };

  const tieneSeleccionValida = () => {
    if (tipoDestino === 'centro') {
      return Boolean(formData.Centro_ID && formData.Nombr_Centro);
    } else {
      return Boolean(formData.CursoId && formData.CursoId > 0);
    }
  };

  return {
    loading,
    trabajadores,
    centros,
    cursos,
    analistas,
    tipoDestino,
    formData,
    registrosExistentes,
    showDuplicateWarning,
    verificandoRegistros,
    handleSubmit,
    handleInputChange,
    handleTrabajadorChange,
    handleCentroChange,
    handleCursoChange,
    handleTipoDestinoChange,
    tieneSeleccionValida,
  };
}
