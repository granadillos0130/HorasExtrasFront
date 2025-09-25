import { useState, useEffect, useCallback } from "react";
import { centrosService } from "../api/centrosService";
import { clientesService } from "../api/clientesService";
import type { Centro, EstadisticaTrabajador, CentroPorMesCompleto, CentroPorEstado } from "../types/centros";
import type { Cliente } from "../types/cliente";

interface DatosCompletosCentro {
  cliente: Cliente | null;
  manoObraTotal: number;
  cargosUnicos: string[];
}

interface ModalState {
  isOpen: boolean;
  type: 'info' | 'cargos';
  source: 'busqueda' | 'estado' | 'meses';
}

export const useCentros = () => {
  // Estados básicos
  const [añoSeleccionado, setAñoSeleccionado] = useState<number>(new Date().getFullYear());
  const [mesSeleccionado, setMesSeleccionado] = useState<number | null>(null);
  const [vistaActual, setVistaActual] = useState<'crear' | 'ejecucion' | 'busqueda' | 'editar' | 'estado' | null>(null);
  const [loading, setLoading] = useState(false);

  // Estados para datos
  const [centrosDelMes, setCentrosDelMes] = useState<CentroPorMesCompleto[]>([]);
  const [todosCentros, setTodosCentros] = useState<Centro[]>([]);
  const [centrosPorEstado, setCentrosPorEstado] = useState<CentroPorEstado[]>([]);

  // Estados para modales y selecciones
  const [centroSeleccionado, setCentroSeleccionado] = useState<CentroPorMesCompleto | null>(null);
  const [centroEncontrado, setCentroEncontrado] = useState<Centro | null>(null);
  const [centroAEditar, setCentroAEditar] = useState<Centro | null>(null);

  // Estado del modal
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    type: 'info',
    source: 'meses'
  });

  // Estados para búsqueda y filtros
  const [centroBuscado, setCentroBuscado] = useState<string>("");
  const [loadingBusqueda, setLoadingBusqueda] = useState(false);
  const [estadoFiltro, setEstadoFiltro] = useState<'todos' | 'abierto' | 'cerrado'>('todos');
  const [loadingEstado, setLoadingEstado] = useState(false);

  // Estados para datos adicionales
  const [datosCompletos, setDatosCompletos] = useState<DatosCompletosCentro>({
    cliente: null,
    manoObraTotal: 0,
    cargosUnicos: []
  });

  // ================================
  // FUNCIONES DE CARGA DE DATOS
  // ================================
  const cargarTodosCentros = useCallback(async () => {
    try {
      const centros = await centrosService.getAll();
      const centrosFiltrados = centros.filter(centro => {
        const nombre = centro.nombreCentro.toLowerCase();
        return !nombre.includes('festivo') && !nombre.includes('vacaciones');
      });
      setTodosCentros(centrosFiltrados);
    } catch (error) {
      console.error("Error al cargar todos los centros:", error);
    }
  }, []);

  const cargarCentrosDelMes = useCallback(async () => {
    if (mesSeleccionado === null) return;
    setLoading(true);
    try {
      const centrosCompletos = await centrosService.obtenerPorMes(añoSeleccionado, mesSeleccionado);
      const centrosFiltrados = centrosCompletos.filter(centro => {
        const nombre = centro.centroNombre.toLowerCase();
        return !nombre.includes('festivo') && !nombre.includes('vacaciones');
      });
      setCentrosDelMes(centrosFiltrados);
    } catch (error) {
      console.error("Error al cargar centros del mes:", error);
      setCentrosDelMes([]);
    } finally {
      setLoading(false);
    }
  }, [añoSeleccionado, mesSeleccionado]);

  const cargarCentrosPorEstado = useCallback(async (estado: 'abierto' | 'cerrado') => {
    setLoadingEstado(true);
    try {
      const centros = await centrosService.obtenerPorEstado(estado);
      setCentrosPorEstado(centros);
    } catch (error) {
      console.error(`Error al cargar centros ${estado}:`, error);
      setCentrosPorEstado([]);
    } finally {
      setLoadingEstado(false);
    }
  }, []);

  const cargarDatosCompletosCentro = async (
    centro: Centro,
    estadisticas: { trabajadores?: EstadisticaTrabajador[] } | null,
    centroCompleto?: CentroPorMesCompleto
  ) => {
    try {
      if (centroCompleto) {
        setDatosCompletos({
          cliente: centroCompleto.cliente ? {
            id: centroCompleto.cliente.id,
            nombreCliente: centroCompleto.cliente.nombre
          } as Cliente : null,
          manoObraTotal: centroCompleto.manoObraTotal,
          cargosUnicos: centroCompleto.cargosUnicos
        });
        return;
      }

      // Cargar datos desde API si no están disponibles
      let cliente = null;
      if (centro.clienteId) {
        try {
          cliente = await clientesService.obtenerPorId(centro.clienteId);
        } catch (error) {
          console.warn("No se pudo cargar el cliente:", error);
        }
      }

      let manoObraTotal = 0;
      try {
        const resultadoBatch = await centrosService.obtenerManoObraTotalBatch([centro.id]);
        if (resultadoBatch.length > 0 && resultadoBatch[0].success) {
          manoObraTotal = resultadoBatch[0].manoObraTotal;
        }
      } catch (error) {
        console.warn("No se pudo cargar la mano de obra total:", error);
      }

      const cargosUnicos: string[] = [];
      if (estadisticas && estadisticas.trabajadores) {
        const cargosSet = new Set<string>();
        estadisticas.trabajadores.forEach((t: EstadisticaTrabajador) => {
          if ((t as any).cargo && (t as any).cargo !== 'No especificado') {
            cargosSet.add((t as any).cargo);
          }
        });
        if (cargosSet.size === 0) {
          cargosSet.add("Trabajador General");
        }
        cargosUnicos.push(...Array.from(cargosSet));
      } else {
        cargosUnicos.push("Trabajador General");
      }

      setDatosCompletos({
        cliente,
        manoObraTotal,
        cargosUnicos
      });
    } catch (error) {
      console.error("Error al cargar datos completos:", error);
      setDatosCompletos({
        cliente: null,
        manoObraTotal: 0,
        cargosUnicos: []
      });
    }
  };

  // ================================
  // FUNCIONES DE MODAL
  // ================================
  const abrirModal = (tipo: 'info' | 'cargos', fuente: 'busqueda' | 'estado' | 'meses') => {
    setModal({
      isOpen: true,
      type: tipo,
      source: fuente
    });
  };

  const cerrarModal = () => {
    setModal({
      isOpen: false,
      type: 'info',
      source: 'meses'
    });
    setCentroSeleccionado(null);
    setVistaActual(null);
    setCentroAEditar(null);
    setDatosCompletos({
      cliente: null,
      manoObraTotal: 0,
      cargosUnicos: []
    });
  };

  const toggleModalType = () => {
    setModal(prev => ({
      ...prev,
      type: prev.type === 'info' ? 'cargos' : 'info'
    }));
  };

  // ================================
  // FUNCIONES DE MANEJO
  // ================================
  const prepararCentroParaModal = async (centro: any, fuente: 'busqueda' | 'estado' | 'meses') => {
    setCentroSeleccionado(centro);
    try {
      if (fuente === 'meses') {
        const centroCompleto = await centrosService.getById(centro.centroId);
        setCentroEncontrado(centroCompleto);
        await cargarDatosCompletosCentro(centroCompleto, null, centro);
      } else {
        await cargarDatosCompletosCentro(centro, null);
      }
    } catch (error) {
      console.error("Error al preparar centro para modal:", error);
    }
  };

  const handleBusquedaCentro = async (centroId: string, centro?: Centro) => {
    setCentroBuscado(centroId);
    if (!centroId) {
      setCentroEncontrado(null);
      setCentroSeleccionado(null);
      return;
    }

    setLoadingBusqueda(true);
    try {
      let centroData: Centro;
      if (centro) {
        centroData = centro;
      } else {
        centroData = await centrosService.getById(centroId);
      }

      const estadisticas = await centrosService.getEstadisticas({ centroId: centroData.id });
      setCentroEncontrado(centroData);

      if (estadisticas && estadisticas.trabajadores) {
        const centroCompleto: CentroPorMesCompleto = {
          centroId: centroData.id,
          centroNombre: centroData.nombreCentro,
          fechaInicio: centroData.fechaInicio,
          fechaFinal: centroData.fechaFinal,
          manoObraTotal: 0,
          cargosUnicos: [],
          trabajadores: estadisticas.trabajadores.map((t: EstadisticaTrabajador) => ({
            trabajadorId: t.trabajadorId,
            nombre: t.nombreTrabajador,
            totalHoras: t.totalHoras,
            horasNormales: t.horasNormales,
            extrasDiurnas: t.horasExtrasDiurnas,
            extrasNocturnas: t.horasExtrasNocturnas,
            cargo: 'No especificado'
          }))
        };
        setCentroSeleccionado(centroCompleto);
        await cargarDatosCompletosCentro(centroData, estadisticas);
      } else {
        const centroBasico: CentroPorMesCompleto = {
          centroId: centroData.id,
          centroNombre: centroData.nombreCentro,
          fechaInicio: centroData.fechaInicio,
          fechaFinal: centroData.fechaFinal,
          manoObraTotal: 0,
          cargosUnicos: [],
          trabajadores: []
        };
        setCentroSeleccionado(centroBasico);
        await cargarDatosCompletosCentro(centroData, null);
      }
    } catch (error) {
      console.error("Error al buscar centro:", error);
      setCentroEncontrado(null);
      setCentroSeleccionado(null);
    } finally {
      setLoadingBusqueda(false);
    }
  };

  const handleSeleccionarCentroEstado = async (centroId: string) => {
    try {
      setLoading(true);
      const centroCompleto = centrosPorEstado.find(c => c.centroId === centroId);
      
      if (!centroCompleto) {
        alert("Error: No se encontraron los datos completos del centro");
        return;
      }

      const centroData: Centro = {
        id: centroCompleto.centroId,
        nombreCentro: centroCompleto.centroNombre,
        fechaInicio: centroCompleto.fechaInicio,
        fechaFinal: centroCompleto.fechaFinal,
        clienteId: centroCompleto.clienteId || "",
        estado: centroCompleto.estado,
        tipo: centroCompleto.tipo ?? undefined,
        valorOrden: centroCompleto.valorOrden ?? undefined,
        fechaFactura: centroCompleto.fechaFactura ?? undefined,
        interventor: centroCompleto.interventor ?? undefined,
        vendedor: centroCompleto.vendedor ?? undefined
      };
      
      setCentroEncontrado(centroData);

      const centroParaModal: CentroPorMesCompleto = {
        centroId: centroCompleto.centroId,
        centroNombre: centroCompleto.centroNombre,
        fechaInicio: centroCompleto.fechaInicio,
        fechaFinal: centroCompleto.fechaFinal,
        manoObraTotal: centroCompleto.manoObraTotal || 0,
        cargosUnicos: centroCompleto.cargosUnicos || [],
        trabajadores: (centroCompleto.trabajadores || []).map(t => ({
          trabajadorId: t.trabajadorId,
          nombre: t.nombre,
          totalHoras: t.totalHoras,
          horasNormales: t.horasNormales,
          extrasDiurnas: t.extrasDiurnas,
          extrasNocturnas: t.extrasNocturnas,
          extrasDominicalesDiurnas: t.extrasDominicalesDiurnas || 0,
          extrasDominicalesNocturnas: t.extrasDominicalesNocturnas || 0,
          cargo: t.cargo
        })),
        cliente: centroCompleto.cliente || undefined
      };

      setCentroSeleccionado(centroParaModal);
      setDatosCompletos({
        cliente: centroCompleto.cliente ? {
          id: centroCompleto.cliente.id,
          nombreCliente: centroCompleto.cliente.nombre
        } : null,
        manoObraTotal: centroCompleto.manoObraTotal || 0,
        cargosUnicos: centroCompleto.cargosUnicos || ['Trabajador General']
      });
    } catch (error) {
      console.error("Error al cargar centro desde vista por estado:", error);
      alert("Error al cargar los datos del centro");
    } finally {
      setLoading(false);
    }
  };

  const handleEditarCentro = async (centroId: string) => {
    try {
      setLoading(true);
      const centroCompleto = await centrosService.getById(centroId);
      setCentroAEditar(centroCompleto);
      setVistaActual('editar');
    } catch (error) {
      console.error("Error al cargar centro para editar:", error);
      alert("Error al cargar los datos del centro");
    } finally {
      setLoading(false);
    }
  };

  const handleCambiarEstado = async (centroId: string, nuevoEstado: 'abierto' | 'cerrado', nombreCentro: string) => {
    const estadoActual = nuevoEstado === 'abierto' ? 'cerrado' : 'abierto';
    const confirmación = window.confirm(
      `¿Estás seguro de cambiar el estado del centro "${nombreCentro}" de ${estadoActual} a ${nuevoEstado}?`
    );

    if (!confirmación) return;

    try {
      setLoading(true);
      const resultado = await centrosService.cambiarEstado(centroId, nuevoEstado);
      alert(`✅ ${resultado.mensaje}`);

      if (estadoFiltro !== 'todos') {
        await cargarCentrosPorEstado(estadoFiltro);
      }
      if (mesSeleccionado !== null) {
        await cargarCentrosDelMes();
      }
      await cargarTodosCentros();
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      alert("❌ Error al cambiar el estado del centro");
    } finally {
      setLoading(false);
    }
  };

  const handleCentroCreado = () => {
    if (mesSeleccionado !== null) {
      cargarCentrosDelMes();
    }
    cargarTodosCentros();
    cerrarModal();
  };

  const handleCentroActualizado = () => {
    if (mesSeleccionado !== null) {
      cargarCentrosDelMes();
    }
    cargarTodosCentros();
    if (vistaActual === 'busqueda' && centroEncontrado) {
      handleBusquedaCentro(centroEncontrado.id);
    }
    cerrarModal();
  };

  // Effects
  useEffect(() => {
    cargarTodosCentros();
  }, [cargarTodosCentros]);

  useEffect(() => {
    if (mesSeleccionado !== null) {
      cargarCentrosDelMes();
    }
  }, [mesSeleccionado, cargarCentrosDelMes]);

  return {
    // Estados
    añoSeleccionado,
    mesSeleccionado,
    vistaActual,
    loading,
    centrosDelMes,
    todosCentros,
    centrosPorEstado,
    centroSeleccionado,
    centroEncontrado,
    centroAEditar,
    modal,
    centroBuscado,
    loadingBusqueda,
    estadoFiltro,
    loadingEstado,
    datosCompletos,

    // Setters
    setAñoSeleccionado,
    setMesSeleccionado,
    setVistaActual,
    setEstadoFiltro,
    setCentroBuscado,

    // Funciones
    cargarCentrosPorEstado,
    abrirModal,
    cerrarModal,
    toggleModalType,
    prepararCentroParaModal,
    handleBusquedaCentro,
    handleSeleccionarCentroEstado,
    handleEditarCentro,
    handleCambiarEstado,
    handleCentroCreado,
    handleCentroActualizado
  };
};