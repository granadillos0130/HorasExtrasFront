/* eslint-disable @typescript-eslint/no-explicit-any */
// CentrosPage.tsx - Versión Ultra Simplificada
import React, { useState, useEffect, useCallback } from "react";
import { centrosService } from "../api/centrosService";
import { clientesService } from "../api/clientesService";
import CentroForm from "../components/centros/CentroForm";
import CentroBuscador from "../components/shared/CentroBuscador";
import InformacionEjecucionPage from "./InformacionEjecucionPage";
import CentroModalUniversal from "../components/centros/CentroModalUniversal";
import { CentroCard } from "../components/centros/CentroCard";
import type { Centro, EstadisticaTrabajador, CentroPorMesCompleto, CentroPorEstado } from "../types/centros";
import type { Cliente } from "../types/cliente";

// Utilidades
const formatearMoneda = (valor: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(valor);
};

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const CentrosPage: React.FC = () => {
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

  // Estado del modal universal - SIMPLIFICADO: solo un modal
  const [modal, setModal] = useState<{
    isOpen: boolean;
    type: 'info' | 'cargos';
    source: 'busqueda' | 'estado' | 'meses';
  }>({
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
  const [datosCompletos, setDatosCompletos] = useState<{
    cliente: Cliente | null;
    manoObraTotal: number;
    cargosUnicos: string[];
  }>({
    cliente: null,
    manoObraTotal: 0,
    cargosUnicos: []
  });

  // ================================
  // FUNCIONES DE CARGA DE DATOS (sin cambios)
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
  // FUNCIONES SIMPLIFICADAS PARA MANEJAR MODAL
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
  // FUNCIONES DE MANEJO SIMPLIFICADAS
  // ================================
  
  const prepararCentroParaModal = async (centro: any, fuente: 'busqueda' | 'estado' | 'meses') => {
    setCentroSeleccionado(centro);
    try {
      if (fuente === 'meses') {
        // Para meses ya tenemos los datos completos
        const centroCompleto = await centrosService.getById(centro.centroId);
        setCentroEncontrado(centroCompleto);
        await cargarDatosCompletosCentro(centroCompleto, null, centro);
      } else {
        // Para búsqueda y estado, cargar los datos
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

      // Asegurarse que estadisticas tiene la propiedad trabajadores
      const trabajadores = (estadisticas && (estadisticas as any).trabajadores) ? (estadisticas as any).trabajadores : [];

      if (trabajadores.length > 0) {
        const centroCompleto: CentroPorMesCompleto = {
          centroId: centroData.id,
          centroNombre: centroData.nombreCentro,
          fechaInicio: centroData.fechaInicio,
          fechaFinal: centroData.fechaFinal,
          manoObraTotal: 0,
          cargosUnicos: [],
          trabajadores: trabajadores.map((t: any) => ({
            trabajadorId: t.trabajadorId,
            nombre: t.nombreTrabajador,
            totalHoras: t.totalHoras,
            horasNormales: t.horasNormales,
            extrasDiurnas: t.horasExtrasDiurnas,
            extrasNocturnas: t.horasExtrasNocturnas,
            cargo: t.cargo || 'No especificado'
          }))
        };
        setCentroSeleccionado(centroCompleto);
        await cargarDatosCompletosCentro(centroData, { trabajadores });
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

  // ================================
  // EFFECTS
  // ================================
  useEffect(() => {
    cargarTodosCentros();
  }, [cargarTodosCentros]);

  useEffect(() => {
    if (mesSeleccionado !== null) {
      cargarCentrosDelMes();
    }
  }, [mesSeleccionado, cargarCentrosDelMes]);

  // ================================
  // RENDER PRINCIPAL
  // ================================
  
  // Si estamos en la vista de información de ejecución
  if (vistaActual === 'ejecucion' && centroSeleccionado) {
    return (
      <InformacionEjecucionPage
        centroId={centroSeleccionado.centroId}
        centroNombre={centroSeleccionado.centroNombre}
        onVolver={() => setVistaActual(null)}
      />
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '40px',
          color: 'white'
        }}>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: '700',
            marginBottom: '10px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            🏢 Dashboard de Centros de Trabajo
          </h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>
            Visualiza todos los centros activos por mes o busca un centro específico
          </p>
        </div>

        {/* Navegación entre vistas */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '15px',
          marginBottom: '30px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => {
              setVistaActual('busqueda');
              setMesSeleccionado(null);
              setCentroSeleccionado(null);
              cerrarModal();
            }}
            style={{
              background: vistaActual === 'busqueda' ?
                'linear-gradient(135deg, #3b82f6, #1e40af)' :
                'linear-gradient(135deg, #64748b, #475569)',
              color: 'white',
              border: 'none',
              padding: '15px 25px',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
              transition: 'all 0.3s ease'
            }}
          >
            🔍 Buscar Centro
          </button>
          
          <button
            onClick={() => {
              setVistaActual('estado');
              setMesSeleccionado(null);
              setCentroSeleccionado(null);
              setCentroBuscado("");
              setCentroEncontrado(null);
              cerrarModal();
              setEstadoFiltro('abierto');
              cargarCentrosPorEstado('abierto');
            }}
            style={{
              background: vistaActual === 'estado' ?
                'linear-gradient(135deg, #f59e0b, #d97706)' :
                'linear-gradient(135deg, #64748b, #475569)',
              color: 'white',
              border: 'none',
              padding: '15px 25px',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
              transition: 'all 0.3s ease'
            }}
          >
            📊 Filtrar por Estado
          </button>

          <button
            onClick={() => {
              setVistaActual(null);
              setCentroBuscado("");
              setCentroEncontrado(null);
              cerrarModal();
            }}
            style={{
              background: vistaActual === null || mesSeleccionado !== null ?
                'linear-gradient(135deg, #3b82f6, #1e40af)' :
                'linear-gradient(135deg, #64748b, #475569)',
              color: 'white',
              border: 'none',
              padding: '15px 25px',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
              transition: 'all 0.3s ease'
            }}
          >
            📅 Vista por Meses
          </button>

          <button
            onClick={() => setVistaActual('crear')}
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              border: 'none',
              padding: '15px 25px',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
              transition: 'all 0.3s ease'
            }}
          >
            ➕ Crear Nuevo Centro
          </button>
        </div>

        {/* Vista de búsqueda */}
        {vistaActual === 'busqueda' && (
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '30px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            marginBottom: '30px'
          }}>
            <h2 style={{
              textAlign: 'center',
              marginBottom: '30px',
              color: '#333',
              fontSize: '1.8rem',
              fontWeight: '600'
            }}>
              🔍 Buscar Centro de Trabajo
            </h2>

            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
              <CentroBuscador
                centros={todosCentros}
                value={centroBuscado}
                onChange={handleBusquedaCentro}
                placeholder="Buscar por nombre del centro o ID..."
                label="Buscar Centro"
                showSelectedInfo={true}
                className="busqueda-principal"
              />

              {loadingBusqueda && (
                <div style={{
                  textAlign: 'center',
                  padding: '20px',
                  color: '#667eea',
                  fontSize: '1.1rem'
                }}>
                  🔄 Buscando centro...
                </div>
              )}

              {centroEncontrado && centroSeleccionado && (
                <div style={{ marginTop: '30px' }}>
                  <CentroCard
                    centro={{
                      centroId: centroSeleccionado.centroId,
                      centroNombre: centroSeleccionado.centroNombre,
                      fechaInicio: centroSeleccionado.fechaInicio,
                      fechaFinal: centroSeleccionado.fechaFinal ?? undefined,
                      trabajadores: centroSeleccionado.trabajadores,
                      manoObraTotal: centroSeleccionado.manoObraTotal
                    }}
                    onVerInfo={() => {
                      prepararCentroParaModal(centroSeleccionado, 'busqueda');
                      abrirModal('info', 'busqueda');
                    }}
                    onVerCargos={() => {
                      if (centroSeleccionado.trabajadores.length > 0) {
                        prepararCentroParaModal(centroSeleccionado, 'busqueda');
                        abrirModal('cargos', 'busqueda');
                      } else {
                        alert('Este centro no tiene trabajadores registrados en el sistema.');
                      }
                    }}
                    onVerEjecucion={() => setVistaActual('ejecucion')}
                    showEditButton={false}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Vista de filtro por estado */}
        {vistaActual === 'estado' && (
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '30px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            marginBottom: '30px'
          }}>
            <h2 style={{
              textAlign: 'center',
              marginBottom: '30px',
              color: '#333',
              fontSize: '1.8rem',
              fontWeight: '600'
            }}>
              📊 Centros por Estado
            </h2>

            {/* Selector de estado */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '15px',
              marginBottom: '30px'
            }}>
              <button
                onClick={() => {
                  setEstadoFiltro('abierto');
                  cargarCentrosPorEstado('abierto');
                }}
                style={{
                  background: estadoFiltro === 'abierto' ?
                    'linear-gradient(135deg, #22c55e, #15803d)' :
                    'linear-gradient(135deg, #64748b, #475569)',
                  color: 'white',
                  border: 'none',
                  padding: '15px 25px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '1rem'
                }}
              >
                🟢 Centros Abiertos
              </button>
              <button
                onClick={() => {
                  setEstadoFiltro('cerrado');
                  cargarCentrosPorEstado('cerrado');
                }}
                style={{
                  background: estadoFiltro === 'cerrado' ?
                    'linear-gradient(135deg, #ef4444, #dc2626)' :
                    'linear-gradient(135deg, #64748b, #475569)',
                  color: 'white',
                  border: 'none',
                  padding: '15px 25px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '1rem'
                }}
              >
                🔴 Centros Cerrados
              </button>
            </div>

            {/* Grid de centros por estado */}
            {loadingEstado ? (
              <div style={{
                textAlign: 'center',
                padding: '60px',
                fontSize: '1.5rem',
                color: '#667eea'
              }}>
                🔄 Cargando centros...
              </div>
            ) : centrosPorEstado.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                gap: '20px'
              }}>
                {centrosPorEstado.map((centro) => (
                  <CentroCard
                    key={centro.centroId}
                    centro={{
                      centroId: centro.centroId,
                      centroNombre: centro.centroNombre,
                      fechaInicio: centro.fechaInicio,
                      fechaFinal: centro.fechaFinal ?? undefined,
                      trabajadores: centro.trabajadores || [],
                      manoObraTotal: centro.manoObraTotal,
                      estado: centro.estado,
                      clienteNombre: centro.clienteNombre
                    }}
                    onVerInfo={() => {
                      handleSeleccionarCentroEstado(centro.centroId);
                      abrirModal('info', 'estado');
                    }}
                    onVerCargos={() => {
                      handleSeleccionarCentroEstado(centro.centroId);
                      abrirModal('cargos', 'estado');
                    }}
                    onVerEjecucion={() => {
                      setCentroSeleccionado({
                        centroId: centro.centroId,
                        centroNombre: centro.centroNombre,
                        fechaInicio: centro.fechaInicio,
                        fechaFinal: centro.fechaFinal,
                        manoObraTotal: 0,
                        cargosUnicos: [],
                        trabajadores: []
                      } as CentroPorMesCompleto);
                      setVistaActual('ejecucion');
                    }}
                    onEditar={() => handleEditarCentro(centro.centroId)}
                    onCambiarEstado={() => handleCambiarEstado(
                      centro.centroId,
                      centro.estado === 'Abierto' ? 'cerrado' : 'abierto',
                      centro.centroNombre
                    )}
                    showEditButton={true}
                    showStateButton={true}
                    showClientInfo={true}
                  />
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '60px',
                color: '#666'
              }}>
                <h3>No hay centros {estadoFiltro}s</h3>
              </div>
            )}
          </div>
        )}

        {/* Vista por meses */}
        {vistaActual !== 'busqueda' && vistaActual !== 'estado' && (
          <>
            {/* Selector de año */}
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '30px',
              marginBottom: '30px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <div style={{ maxWidth: '300px', margin: '0 auto' }}>
                <label style={{
                  display: 'block',
                  fontWeight: '600',
                  color: '#333',
                  marginBottom: '15px',
                  fontSize: '1.2rem'
                }}>
                  📅 Selecciona el Año
                </label>
                <select
                  value={añoSeleccionado}
                  onChange={(e) => {
                    setAñoSeleccionado(Number(e.target.value));
                    setMesSeleccionado(null);
                    setCentroSeleccionado(null);
                  }}
                  style={{
                    width: '100%',
                    padding: '15px',
                    border: '2px solid #e1e8ed',
                    borderRadius: '10px',
                    fontSize: '1.2rem',
                    background: '#f8fafb',
                    cursor: 'pointer',
                    textAlign: 'center',
                    fontWeight: '600'
                  }}
                >
                  {[2023, 2024, 2025, 2026, 2027, 2028].map(año => (
                    <option key={año} value={año}>{año}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Vista de meses */}
            {mesSeleccionado === null && (
              <div style={{
                background: 'white',
                borderRadius: '20px',
                padding: '30px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
              }}>
                <h2 style={{
                  textAlign: 'center',
                  marginBottom: '30px',
                  color: '#333',
                  fontSize: '1.8rem',
                  fontWeight: '600'
                }}>
                  🗓️ Selecciona el Mes - {añoSeleccionado}
                </h2>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '20px'
                }}>
                  {MESES.map((mes, index) => (
                    <button
                      key={index}
                      onClick={() => setMesSeleccionado(index + 1)}
                      style={{
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        color: 'white',
                        border: 'none',
                        padding: '20px',
                        borderRadius: '15px',
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {mes}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Vista de centros del mes */}
            {mesSeleccionado !== null && (
              <div style={{
                background: 'white',
                borderRadius: '20px',
                padding: '30px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '30px',
                  flexWrap: 'wrap',
                  gap: '15px'
                }}>
                  <h2 style={{
                    margin: 0,
                    color: '#333',
                    fontSize: '1.8rem',
                    fontWeight: '600'
                  }}>
                    🏢 Centros Activos - {MESES[mesSeleccionado - 1]} {añoSeleccionado}
                  </h2>
                  <button
                    onClick={() => setMesSeleccionado(null)}
                    style={{
                      background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
                      color: 'white',
                      border: 'none',
                      padding: '12px 20px',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '0.95rem'
                    }}
                  >
                    ← Volver a Meses
                  </button>
                </div>

                {loading ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '60px',
                    fontSize: '1.5rem',
                    color: '#667eea'
                  }}>
                    🔄 Cargando centros del mes...
                  </div>
                ) : centrosDelMes.length > 0 ? (
                  <div>
                    {/* Resumen */}
                    <div style={{
                      marginBottom: '25px',
                      padding: '15px 20px',
                      background: 'linear-gradient(135deg, #43e97b, #38f9d7)',
                      color: 'white',
                      borderRadius: '12px',
                      textAlign: 'center'
                    }}>
                      <h4 style={{ margin: 0, fontSize: '1.2rem' }}>
                        ✅ {centrosDelMes.length} Centro{centrosDelMes.length !== 1 ? 's' : ''} Encontrado{centrosDelMes.length !== 1 ? 's' : ''}
                      </h4>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '30px',
                        marginTop: '10px',
                        flexWrap: 'wrap'
                      }}>
                        <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>
                          👥 Total trabajadores: {centrosDelMes.reduce((total, centro) => total + centro.trabajadores.length, 0)}
                        </p>
                        <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>
                          💰 Mano de obra: {formatearMoneda(centrosDelMes.reduce((total, centro) => total + (centro.manoObraTotal || 0), 0))}
                        </p>
                      </div>
                    </div>

                    {/* Grid de centros */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                      gap: '20px'
                    }}>
                      {centrosDelMes.map((centro) => (
                        <CentroCard
                          key={centro.centroId}
                          centro={{
                            centroId: centro.centroId,
                            centroNombre: centro.centroNombre,
                            fechaInicio: centro.fechaInicio,
                            fechaFinal: centro.fechaFinal ?? undefined,
                            trabajadores: centro.trabajadores,
                            manoObraTotal: centro.manoObraTotal
                          }}
                          onVerInfo={() => {
                            prepararCentroParaModal(centro, 'meses');
                            abrirModal('info', 'meses');
                          }}
                          onVerCargos={() => {
                            prepararCentroParaModal(centro, 'meses');
                            abrirModal('cargos', 'meses');
                          }}
                          onVerEjecucion={() => {
                            setCentroSeleccionado(centro);
                            setVistaActual('ejecucion');
                          }}
                          onEditar={() => handleEditarCentro(centro.centroId)}
                          showEditButton={true}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{
                    textAlign: 'center',
                    padding: '60px',
                    color: '#666'
                  }}>
                    <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🏢</div>
                    <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>
                      No hay centros activos
                    </h3>
                    <p style={{ marginBottom: '0', color: '#666' }}>
                      No se encontraron centros con actividad en {MESES[mesSeleccionado - 1]} {añoSeleccionado}
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Modal Universal - UNA SOLA INSTANCIA */}
        {centroSeleccionado && (
          <CentroModalUniversal
            isOpen={modal.isOpen}
            onClose={cerrarModal}
            centro={centroSeleccionado}
            datosCompletos={datosCompletos}
            centroEncontrado={centroEncontrado}
            modalType={modal.type}
            onToggleModal={toggleModalType}
            source={modal.source}
          />
        )}

        {/* Modal de crear centro */}
        {vistaActual === 'crear' && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '0',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
              position: 'relative'
            }}>
              <div style={{
                position: 'sticky',
                top: 0,
                background: 'white',
                borderRadius: '20px 20px 0 0',
                padding: '20px 30px 15px 30px',
                borderBottom: '2px solid #f0f0f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 1001
              }}>
                <h3 style={{
                  margin: 0,
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#333'
                }}>
                  ➕ Crear Nuevo Centro
                </h3>
                <button
                  onClick={cerrarModal}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    color: '#666'
                  }}
                >
                  ❌
                </button>
              </div>
              <div style={{ padding: '0 30px 30px 30px' }}>
                <CentroForm onSuccess={handleCentroCreado} />
              </div>
            </div>
          </div>
        )}

        {/* Modal de editar centro */}
        {vistaActual === 'editar' && centroAEditar && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '0',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
              position: 'relative'
            }}>
              <div style={{
                position: 'sticky',
                top: 0,
                background: 'white',
                borderRadius: '20px 20px 0 0',
                padding: '20px 30px 15px 30px',
                borderBottom: '2px solid #f0f0f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 1001
              }}>
                <h3 style={{
                  margin: 0,
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#333'
                }}>
                  ✏️ Editar Centro: {centroAEditar.nombreCentro}
                </h3>
                <button
                  onClick={cerrarModal}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    color: '#666'
                  }}
                >
                  ❌
                </button>
              </div>
              <div style={{ padding: '0 30px 30px 30px' }}>
                <CentroForm
                  centroAEditar={centroAEditar}
                  onSuccess={handleCentroActualizado}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CentrosPage;