import React, { useState, useEffect, useCallback } from "react";
import { centrosService } from "../api/centrosService";
import { clientesService } from "../api/clientesService";
import CentroForm from "../components/centros/CentroForm";
import CentroBuscador from "../components/shared/CentroBuscador";
import InformacionEjecucionPage from "./InformacionEjecucionPage";
import type { Centro, EstadisticaTrabajador, CentroPorMesCompleto } from "../types/centros";
import type { Cliente } from "../types/cliente";

const CentrosPage: React.FC = () => {
  const [añoSeleccionado, setAñoSeleccionado] = useState<number>(new Date().getFullYear());
  const [mesSeleccionado, setMesSeleccionado] = useState<number | null>(null);
  const [centrosDelMes, setCentrosDelMes] = useState<CentroPorMesCompleto[]>([]);
  // ✅ Unificado para usar CentroPorMesCompleto
  const [centroSeleccionado, setCentroSeleccionado] = useState<CentroPorMesCompleto | null>(null);
  const [vistaActual, setVistaActual] = useState<'info' | 'cargos' | 'crear' | 'ejecucion' | 'busqueda' | 'editar' | null>(null); const [centroAEditar, setCentroAEditar] = useState<Centro | null>(null);

  // Estado separado para el modal en la vista de búsqueda
  const [modalBusqueda, setModalBusqueda] = useState<'info' | 'cargos' | null>(null);

  const [loading, setLoading] = useState(false);

  // Estados para búsqueda
  const [todosCentros, setTodosCentros] = useState<Centro[]>([]);
  const [centroBuscado, setCentroBuscado] = useState<string>("");
  const [centroEncontrado, setCentroEncontrado] = useState<Centro | null>(null);
  const [loadingBusqueda, setLoadingBusqueda] = useState(false);

  // Estados para datos adicionales del centro
  const [datosCompletos, setDatosCompletos] = useState<{
    cliente: Cliente | null;
    manoObraTotal: number;
    cargosUnicos: string[];
  }>({
    cliente: null,
    manoObraTotal: 0,
    cargosUnicos: []
  });

  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const cargarTodosCentros = useCallback(async () => {
  try {
    const centros = await centrosService.getAll();
    // 🚫 FILTRO: Excluir centros con nombres como "festivo", "vacaciones"
    const centrosFiltrados = centros.filter(centro => {
      const nombre = centro.nombreCentro.toLowerCase();
      return !nombre.includes('festivo') && !nombre.includes('vacaciones');
    });
    setTodosCentros(centrosFiltrados);
  } catch (error) {
    console.error("Error al cargar todos los centros:", error);
  }
}, []);

  // ✅ Función optimizada - UNA SOLA PETICIÓN
 const cargarCentrosDelMes = useCallback(async () => {
  if (mesSeleccionado === null) return;

  setLoading(true);
  try {
    // ✅ UNA SOLA PETICIÓN que ya trae toda la información
    const centrosCompletos = await centrosService.obtenerPorMes(añoSeleccionado, mesSeleccionado);
    
    // 🚫 FILTRO: Excluir centros con nombres como "festivo", "vacaciones"
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

  // Cargar todos los centros al montar el componente para la búsqueda
  useEffect(() => {
    cargarTodosCentros();
  }, [cargarTodosCentros]);

  // Cargar centros cuando se selecciona un mes
  useEffect(() => {
    if (mesSeleccionado !== null) {
      cargarCentrosDelMes();
    }
  }, [mesSeleccionado, cargarCentrosDelMes]);


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
  // ✅ AGREGAR ESTA FUNCIÓN:
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
  // ✅ Función optimizada para usar datos precargados cuando están disponibles
  const cargarDatosCompletosCentro = async (
    centro: Centro,
    estadisticas: { trabajadores?: EstadisticaTrabajador[] } | null,
    centroCompleto?: CentroPorMesCompleto // ✅ Nuevo parámetro opcional
  ) => {
    try {
      // ✅ Si tenemos los datos completos del mes, usarlos directamente (evitar peticiones HTTP)
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

      // ✅ Solo hacer peticiones HTTP si NO tenemos los datos (caso de búsqueda)
      // Obtener datos del cliente
      let cliente = null;
      if (centro.clienteId) {
        try {
          cliente = await clientesService.obtenerPorId(centro.clienteId);
        } catch (error) {
          console.warn("No se pudo cargar el cliente:", error);
        }
      }

      // Obtener mano de obra total
      let manoObraTotal = 0;
      try {
        const manoObra = await centrosService.obtenerManoObraTotal(centro.id);
        manoObraTotal = manoObra.manoObraTotal;
      } catch (error) {
        console.warn("No se pudo cargar la mano de obra total:", error);
      }

      // Extraer cargos únicos de los trabajadores
      const cargosUnicos: string[] = [];
      if (estadisticas && estadisticas.trabajadores) {
        const cargosSet = new Set<string>();

        // Intentar obtener los cargos desde las estadísticas
        estadisticas.trabajadores.forEach((t: EstadisticaTrabajador) => {
          // Asumiendo que EstadisticaTrabajador tiene un campo cargo
          if ((t as any).cargo && (t as any).cargo !== 'No especificado') {
            cargosSet.add((t as any).cargo);
          }
        });

        // Si no se obtuvieron cargos, usar un valor por defecto
        if (cargosSet.size === 0) {
          cargosSet.add("Trabajador General");
        }

        cargosUnicos.push(...Array.from(cargosSet));
      } else {
        // Fallback: usar valor por defecto
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

  const handleBusquedaCentro = async (centroId: string, centro?: Centro) => {
    setCentroBuscado(centroId);

    if (!centroId) {
      setCentroEncontrado(null);
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

      // Obtener las estadísticas completas del centro
      const estadisticas = await centrosService.getEstadisticas({ centroId: centroData.id });

      // ✅ USAR BATCH EN LUGAR DE LLAMADA INDIVIDUAL
      let manoObraTotal = 0;
      try {
        const resultadoBatch = await centrosService.obtenerManoObraTotalBatch([centroData.id]);
        if (resultadoBatch.length > 0 && resultadoBatch[0].success) {
          manoObraTotal = resultadoBatch[0].manoObraTotal;
        }
      } catch (error) {
        console.warn("No se pudo cargar la mano de obra total:", error);
      }

      setCentroEncontrado(centroData);

      // Si hay estadísticas, crear un objeto CentroPorMesCompleto con los datos completos
      if (estadisticas && estadisticas.trabajadores) {
        const centroCompleto: CentroPorMesCompleto = {
          centroId: centroData.id,
          centroNombre: centroData.nombreCentro,
          fechaInicio: centroData.fechaInicio,
          fechaFinal: centroData.fechaFinal,
          manoObraTotal,
          cargosUnicos: [], // Se llenará en cargarDatosCompletosCentro
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

        // Cargar datos completos del centro
        await cargarDatosCompletosCentro(centroData, estadisticas);
      } else {
        // Si no hay estadísticas, crear un objeto básico
        const centroBasico: CentroPorMesCompleto = {
          centroId: centroData.id,
          centroNombre: centroData.nombreCentro,
          fechaInicio: centroData.fechaInicio,
          fechaFinal: centroData.fechaFinal,
          manoObraTotal,
          cargosUnicos: [],
          trabajadores: []
        };
        setCentroSeleccionado(centroBasico);

        // Cargar datos completos del centro
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

  // ✅ Función optimizada para usar datos precargados
  const handleSeleccionarCentroDelMes = async (centro: CentroPorMesCompleto) => {
    setCentroSeleccionado(centro);

    // Obtener datos completos del centro
    try {
      const centroCompleto = await centrosService.getById(centro.centroId);
      setCentroEncontrado(centroCompleto);

      // ✅ Usar los datos que ya vienen del endpoint optimizado
      await cargarDatosCompletosCentro(centroCompleto, null, centro);
    } catch (error) {
      console.error("Error al cargar datos completos del centro:", error);
    }
  };

  const cerrarModal = () => {
    setCentroSeleccionado(null);
    setVistaActual(null);
    setCentroAEditar(null);
    // También cerrar el modal de búsqueda
    setModalBusqueda(null);
    setDatosCompletos({
      cliente: null,
      manoObraTotal: 0,
      cargosUnicos: []
    });
  };

  const handleCentroCreado = () => {
    // Recargar los centros del mes actual si hay uno seleccionado
    if (mesSeleccionado !== null) {
      cargarCentrosDelMes();
    }
    // Recargar todos los centros para la búsqueda
    cargarTodosCentros();
    cerrarModal();
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatearHoras = (hours: number) => {
    if (hours === 0) return "0:00";
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}:${m.toString().padStart(2, "0")}`;
  };

  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(valor);
  };

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
              // NUEVO: Limpiar modal de búsqueda
              setModalBusqueda(null);
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
              setVistaActual(null);
              setCentroBuscado("");
              setCentroEncontrado(null);
              // NUEVO: Limpiar modal de búsqueda
              setModalBusqueda(null);
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
                <div style={{
                  marginTop: '30px'
                }}>
                  <div style={{
                    marginBottom: '25px',
                    padding: '15px 20px',
                    background: 'linear-gradient(135deg, #43e97b, #38f9d7)',
                    color: 'white',
                    borderRadius: '12px',
                    textAlign: 'center'
                  }}>
                    <h4 style={{ margin: 0, fontSize: '1.2rem' }}>
                      ✅ Centro Encontrado
                    </h4>
                    <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', opacity: 0.9 }}>
                      {centroSeleccionado.trabajadores.length > 0 ?
                        `Total de trabajadores: ${centroSeleccionado.trabajadores.length}` :
                        'Centro sin trabajadores registrados'
                      }
                    </p>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr',
                    gap: '20px'
                  }}>
                    <div style={{
                      background: 'linear-gradient(135deg, #f8fafb, #ffffff)',
                      padding: '25px',
                      borderRadius: '15px',
                      border: '2px solid #e1e8ed',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      transition: 'all 0.3s ease'
                    }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-5px)';
                        e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                      }}
                    >
                      {/* Header del centro */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px',
                        marginBottom: '20px'
                      }}>
                        <div style={{
                          background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
                          color: 'white',
                          width: '60px',
                          height: '60px',
                          borderRadius: '15px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.8rem'
                        }}>
                          🏢
                        </div>
                        <div style={{ flex: 1 }}>
                          <h3 style={{
                            margin: '0 0 5px 0',
                            fontSize: '1.3rem',
                            fontWeight: '700',
                            color: '#333'
                          }}>
                            {centroSeleccionado.centroNombre}
                          </h3>
                          <p style={{
                            margin: 0,
                            color: '#666',
                            fontSize: '0.9rem'
                          }}>
                            Orden de compra: {centroSeleccionado.centroId}
                          </p>
                        </div>
                      </div>

                      {/* Información básica */}
                      <div style={{
                        background: '#f0f9ff',
                        padding: '15px',
                        borderRadius: '10px',
                        marginBottom: '20px',
                        border: '1px solid #bfdbfe'
                      }}>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '10px',
                          fontSize: '0.9rem'
                        }}>
                          <div>
                            <strong style={{ color: '#1d4ed8' }}>📅 Inicio:</strong><br />
                            {formatearFecha(centroSeleccionado.fechaInicio)}
                          </div>
                          <div>
                            <strong style={{ color: '#1d4ed8' }}>📅 Final:</strong><br />
                            {centroSeleccionado.fechaFinal ? formatearFecha(centroSeleccionado.fechaFinal) : 'Vigente'}
                          </div>
                          <div>
                            <strong style={{ color: '#1d4ed8' }}>👥 Trabajadores:</strong><br />
                            {centroSeleccionado.trabajadores.length}
                          </div>
                          <div>
                            <strong style={{ color: '#1d4ed8' }}>⏰ Total Horas:</strong><br />
                            {centroSeleccionado.trabajadores.length > 0 ?
                              formatearHoras(centroSeleccionado.trabajadores.reduce((sum, t) => sum + t.totalHoras, 0)) :
                              '0:00'
                            }
                          </div>
                        </div>

                        {/* Agregar mano de obra total */}
                        <div style={{
                          marginTop: '15px',
                          paddingTop: '15px',
                          borderTop: '1px solid #bfdbfe'
                        }}>
                          <div style={{ textAlign: 'center' }}>
                            <strong style={{ color: '#1d4ed8' }}>💰 Mano de Obra Total:</strong><br />
                            <span style={{ fontSize: '1.1rem', fontWeight: '600', color: '#059669' }}>
                              {formatearMoneda(centroSeleccionado.manoObraTotal || 0)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Botones de acción - MODIFICADO */}
                      <div style={{
                        display: 'flex',
                        gap: '8px',
                        flexWrap: 'wrap'
                      }}>
                        <button
                          onClick={() => {
                            setModalBusqueda('info');
                          }}
                          style={{
                            flex: 1,
                            minWidth: '120px',
                            background: 'linear-gradient(135deg, #22c55e, #15803d)',
                            color: 'white',
                            border: 'none',
                            padding: '10px 12px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '0.85rem',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          📊 Ver Info
                        </button>
                        <button
                          onClick={() => {
                            if (centroSeleccionado && centroSeleccionado.trabajadores.length > 0) {
                              setModalBusqueda('cargos');
                            } else {
                              alert('Este centro no tiene trabajadores registrados en el sistema.');
                            }
                          }}
                          style={{
                            flex: 1,
                            minWidth: '120px',
                            background: centroSeleccionado.trabajadores.length > 0 ?
                              'linear-gradient(135deg, #f59e0b, #d97706)' :
                              'linear-gradient(135deg, #9ca3af, #6b7280)',
                            color: 'white',
                            border: 'none',
                            padding: '10px 12px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '0.85rem',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          👷 Ver Cargos
                        </button>
                        <button
                          onClick={() => {
                            setVistaActual('ejecucion');
                          }}
                          style={{
                            flex: 1,
                            minWidth: '140px',
                            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                            color: 'white',
                            border: 'none',
                            padding: '10px 12px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '0.85rem',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          📈 Info Ejecución
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {centroBuscado && !centroEncontrado && !loadingBusqueda && (
                <div style={{
                  marginTop: '30px',
                  textAlign: 'center',
                  padding: '40px',
                  background: '#fef2f2',
                  borderRadius: '15px',
                  border: '2px solid #fecaca'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '15px' }}>❌</div>
                  <h3 style={{ margin: '0 0 10px 0', color: '#dc2626' }}>
                    Centro no encontrado
                  </h3>
                  <p style={{ margin: 0, color: '#666' }}>
                    No se encontró ningún centro con el ID "{centroBuscado}"
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Vista por meses */}
        {vistaActual !== 'busqueda' && (
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
                  fontSize: '1.2rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
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
                  {meses.map((mes, index) => (
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
                        transition: 'all 0.3s ease',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-5px)';
                        e.currentTarget.style.boxShadow = '0 15px 35px rgba(102,126,234,0.3)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
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
                    🏢 Centros Activos - {meses[mesSeleccionado - 1]} {añoSeleccionado}
                    {loading && (
                      <span style={{
                        fontSize: '1rem',
                        color: '#666',
                        marginLeft: '10px'
                      }}>
                        🔄 Cargando...
                      </span>
                    )}
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

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                      gap: '20px'
                    }}>
                      {centrosDelMes.map((centro) => (
                        <div key={centro.centroId} style={{
                          background: 'linear-gradient(135deg, #f8fafb, #ffffff)',
                          padding: '25px',
                          borderRadius: '15px',
                          border: '2px solid #e1e8ed',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                          transition: 'all 0.3s ease'
                        }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-5px)';
                            e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                          }}
                        >
                          {/* Header del centro */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '15px',
                            marginBottom: '20px'
                          }}>
                            <div style={{
                              background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
                              color: 'white',
                              width: '60px',
                              height: '60px',
                              borderRadius: '15px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '1.8rem'
                            }}>
                              🏢
                            </div>
                            <div style={{ flex: 1 }}>
                              <h3 style={{
                                margin: '0 0 5px 0',
                                fontSize: '1.3rem',
                                fontWeight: '700',
                                color: '#333'
                              }}>
                                {centro.centroNombre}
                              </h3>
                              <p style={{
                                margin: 0,
                                color: '#666',
                                fontSize: '0.9rem'
                              }}>
                                Orden de compra: {centro.centroId}
                              </p>
                            </div>
                          </div>

                          {/* Información básica */}
                          <div style={{
                            background: '#f0f9ff',
                            padding: '15px',
                            borderRadius: '10px',
                            marginBottom: '20px',
                            border: '1px solid #bfdbfe'
                          }}>
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: '1fr 1fr',
                              gap: '10px',
                              fontSize: '0.9rem'
                            }}>
                              <div>
                                <strong style={{ color: '#1d4ed8' }}>📅 Inicio:</strong><br />
                                {formatearFecha(centro.fechaInicio)}
                              </div>
                              <div>
                                <strong style={{ color: '#1d4ed8' }}>📅 Final:</strong><br />
                                {centro.fechaFinal ? formatearFecha(centro.fechaFinal) : 'Vigente'}
                              </div>
                              <div>
                                <strong style={{ color: '#1d4ed8' }}>👥 Trabajadores:</strong><br />
                                {centro.trabajadores.length}
                              </div>
                              <div>
                                <strong style={{ color: '#1d4ed8' }}>⏰ Total Horas:</strong><br />
                                {formatearHoras(centro.trabajadores.reduce((sum, t) => sum + t.totalHoras, 0))}
                              </div>
                            </div>

                            {/* Mano de obra total */}
                            <div style={{
                              marginTop: '15px',
                              paddingTop: '15px',
                              borderTop: '1px solid #bfdbfe',
                              textAlign: 'center'
                            }}>
                              <strong style={{ color: '#1d4ed8' }}>💰 Mano de Obra Total:</strong><br />
                              <span style={{
                                fontSize: '1.1rem',
                                fontWeight: '600',
                                color: '#059669',
                                background: '#f0fdf4',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                display: 'inline-block',
                                marginTop: '5px'
                              }}>
                                {formatearMoneda(centro.manoObraTotal || 0)}
                              </span>
                            </div>
                          </div>

                          {/* Botones de acción */}
                          <div style={{
                            display: 'flex',
                            gap: '8px',
                            flexWrap: 'wrap'
                          }}>
                            <button
                              onClick={() => {
                                handleSeleccionarCentroDelMes(centro);
                                setVistaActual('info');
                              }}
                              style={{
                                flex: 1,
                                minWidth: '120px',
                                background: 'linear-gradient(135deg, #22c55e, #15803d)',
                                color: 'white',
                                border: 'none',
                                padding: '10px 12px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '0.85rem',
                                transition: 'all 0.3s ease'
                              }}
                            >
                              📊 Ver Info
                            </button>
                            <button
                              onClick={() => {
                                handleSeleccionarCentroDelMes(centro);
                                setVistaActual('cargos');
                              }}
                              style={{
                                flex: 1,
                                minWidth: '120px',
                                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                color: 'white',
                                border: 'none',
                                padding: '10px 12px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '0.85rem',
                                transition: 'all 0.3s ease'
                              }}
                            >
                              👷 Ver Cargos
                            </button>
                            <button
                              onClick={() => {
                                handleSeleccionarCentroDelMes(centro);
                                setVistaActual('ejecucion');
                              }}
                              style={{
                                flex: 1,
                                minWidth: '140px',
                                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                                color: 'white',
                                border: 'none',
                                padding: '10px 12px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '0.85rem',
                                transition: 'all 0.3s ease'
                              }}
                            >
                              📈 Info Ejecución
                            </button>
                            <button
                              onClick={() => {
                                handleEditarCentro(centro.centroId);
                              }}
                              style={{
                                flex: 1,
                                minWidth: '120px',
                                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                                color: 'white',
                                border: 'none',
                                padding: '10px 12px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '0.85rem',
                                transition: 'all 0.3s ease'
                              }}
                            >
                              ✏️ Editar
                            </button>
                          </div>
                        </div>
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
                      No se encontraron centros con actividad en {meses[mesSeleccionado - 1]} {añoSeleccionado}
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Modal de información del centro desde vista por meses */}
        {centroSeleccionado && vistaActual && vistaActual !== 'crear' && vistaActual !== 'ejecucion' && vistaActual !== 'busqueda' && vistaActual !== 'editar' && (<div style={{
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
            padding: '30px',
            maxWidth: '900px',
            width: '100%',
            maxHeight: '85vh',
            overflowY: 'auto',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '25px',
              paddingBottom: '15px',
              borderBottom: '2px solid #f0f0f0'
            }}>
              <div>
                <h3 style={{
                  margin: '0 0 5px 0',
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#333'
                }}>
                  🏢 {centroSeleccionado.centroNombre}
                </h3>
                <p style={{
                  margin: 0,
                  fontSize: '0.9rem',
                  color: '#666'
                }}>
                  {vistaActual === 'info' ? '📊 Información Completa' : '👷 Cargos de Trabajadores'}
                </p>
              </div>
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

            {vistaActual === 'info' ? (
              // Vista de información completa
              <div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '20px',
                  marginBottom: '30px'
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
                    color: 'white',
                    padding: '20px',
                    borderRadius: '15px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🏢</div>
                    <h4 style={{ margin: '0 0 5px 0' }}>Orden de Compra</h4>
                    <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: '600' }}>
                      {centroSeleccionado.centroId}
                    </p>
                  </div>

                  <div style={{
                    background: 'linear-gradient(135deg, #22c55e, #15803d)',
                    color: 'white',
                    padding: '20px',
                    borderRadius: '15px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '2rem', marginBottom: '10px' }}>👥</div>
                    <h4 style={{ margin: '0 0 5px 0' }}>Total Trabajadores</h4>
                    <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: '600' }}>
                      {centroSeleccionado.trabajadores.length}
                    </p>
                  </div>

                  <div style={{
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    color: 'white',
                    padding: '20px',
                    borderRadius: '15px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⏰</div>
                    <h4 style={{ margin: '0 0 5px 0' }}>Total Horas</h4>
                    <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: '600' }}>
                      {formatearHoras(centroSeleccionado.trabajadores.reduce((sum, t) => sum + t.totalHoras, 0))}
                    </p>
                  </div>

                  <div style={{
                    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                    color: 'white',
                    padding: '20px',
                    borderRadius: '15px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '2rem', marginBottom: '10px' }}>💰</div>
                    <h4 style={{ margin: '0 0 5px 0' }}>Mano de Obra</h4>
                    <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: '600' }}>
                      {formatearMoneda(centroSeleccionado.manoObraTotal || datosCompletos.manoObraTotal)}
                    </p>
                  </div>
                </div>

                {/* Información del proyecto */}
                <div style={{
                  background: '#f8fafb',
                  padding: '20px',
                  borderRadius: '15px',
                  border: '2px solid #e1e8ed',
                  marginBottom: '20px'
                }}>
                  <h4 style={{
                    margin: '0 0 15px 0',
                    color: '#333',
                    fontSize: '1.2rem'
                  }}>
                    📋 Información del Proyecto
                  </h4>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '15px'
                  }}>
                    <div>
                      <strong style={{ color: '#22c55e' }}>Cliente:</strong><br />
                      <span style={{ fontSize: '1.1rem' }}>
                        {datosCompletos.cliente ? datosCompletos.cliente.nombreCliente : 'Sin cliente asignado'}
                      </span>
                    </div>
                    <div>
                      <strong style={{ color: '#22c55e' }}>Estado:</strong><br />
                      <span style={{ fontSize: '1.1rem' }}>
                        {centroEncontrado?.estado ? (centroEncontrado.estado ? 'Abierto' : 'Cerrado') : 'No especificado'}
                      </span>
                    </div>
                    <div>
                      <strong style={{ color: '#22c55e' }}>Tipo:</strong><br />
                      <span style={{ fontSize: '1.1rem' }}>
                        {centroEncontrado?.tipo || 'No especificado'}
                      </span>
                    </div>
                    <div>
                      <strong style={{ color: '#22c55e' }}>Valor de la Orden:</strong><br />
                      <span style={{ fontSize: '1.1rem' }}>
                        {centroEncontrado?.valorOrden ? formatearMoneda(centroEncontrado.valorOrden) : 'No especificado'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Personal del proyecto */}
                <div style={{
                  background: '#f0f9ff',
                  padding: '20px',
                  borderRadius: '15px',
                  border: '2px solid #bfdbfe',
                  marginBottom: '20px'
                }}>
                  <h4 style={{
                    margin: '0 0 15px 0',
                    color: '#333',
                    fontSize: '1.2rem'
                  }}>
                    👥 Personal del Proyecto
                  </h4>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '15px'
                  }}>
                    <div>
                      <strong style={{ color: '#1d4ed8' }}>Interventor:</strong><br />
                      <span style={{ fontSize: '1.1rem' }}>
                        {centroEncontrado?.interventor || 'No asignado'}
                      </span>
                    </div>
                    <div>
                      <strong style={{ color: '#1d4ed8' }}>Vendedor:</strong><br />
                      <span style={{ fontSize: '1.1rem' }}>
                        {centroEncontrado?.vendedor || 'No asignado'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Fechas del proyecto */}
                <div style={{
                  background: '#fef3c7',
                  padding: '20px',
                  borderRadius: '15px',
                  border: '2px solid #fde68a'
                }}>
                  <h4 style={{
                    margin: '0 0 15px 0',
                    color: '#333',
                    fontSize: '1.2rem'
                  }}>
                    📅 Fechas del Proyecto
                  </h4>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '15px'
                  }}>
                    <div>
                      <strong style={{ color: '#d97706' }}>Fecha de Inicio:</strong><br />
                      <span style={{ fontSize: '1.1rem' }}>
                        {formatearFecha(centroSeleccionado.fechaInicio)}
                      </span>
                    </div>
                    <div>
                      <strong style={{ color: '#d97706' }}>Fecha Final:</strong><br />
                      <span style={{ fontSize: '1.1rem' }}>
                        {centroSeleccionado.fechaFinal ? formatearFecha(centroSeleccionado.fechaFinal) : '🟢 Vigente'}
                      </span>
                    </div>
                    <div>
                      <strong style={{ color: '#d97706' }}>Fecha de Factura:</strong><br />
                      <span style={{ fontSize: '1.1rem' }}>
                        {centroEncontrado?.fechaFactura ? formatearFecha(centroEncontrado.fechaFactura) : 'No especificada'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Mostrar botón para ver cargos o mensaje informativo */}
                <div style={{
                  marginTop: '20px',
                  textAlign: 'center'
                }}>
                  {centroSeleccionado.trabajadores.length > 0 ? (
                    <button
                      onClick={() => setVistaActual('cargos')}
                      style={{
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        color: 'white',
                        border: 'none',
                        padding: '15px 30px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '1rem'
                      }}
                    >
                      👷 Ver Cargos de Trabajadores ({centroSeleccionado.trabajadores.length})
                    </button>
                  ) : (
                    <div style={{
                      padding: '20px',
                      background: '#f3f4f6',
                      borderRadius: '12px',
                      border: '2px solid #d1d5db'
                    }}>
                      <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📋</div>
                      <h4 style={{ margin: '0 0 10px 0', color: '#374151' }}>
                        Centro sin Trabajadores Registrados
                      </h4>
                      <p style={{ margin: 0, color: '#6b7280', fontSize: '0.95rem' }}>
                        Este centro no tiene trabajadores registrados en el sistema.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Vista de cargos
              <div>
                <div style={{
                  marginBottom: '20px',
                  padding: '15px 20px',
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: 'white',
                  borderRadius: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <h4 style={{ margin: 0, fontSize: '1.2rem' }}>
                    👷 Cargos en el Centro
                  </h4>
                  <button
                    onClick={() => setVistaActual('info')}
                    style={{
                      background: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      border: '1px solid rgba(255,255,255,0.3)',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '0.9rem'
                    }}
                  >
                    📊 Ver Información
                  </button>
                  <button
                    onClick={() => {
                      if (centroSeleccionado) {
                        handleEditarCentro(centroSeleccionado.centroId);
                      }
                    }}
                    style={{
                      flex: 1,
                      minWidth: '120px',
                      background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                      color: 'white',
                      border: 'none',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '0.85rem',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    ✏️ Editar
                  </button>
                </div>

                {datosCompletos.cargosUnicos.length > 0 ? (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '15px',
                    maxHeight: '500px',
                    overflowY: 'auto',
                    padding: '10px'
                  }}>
                    {datosCompletos.cargosUnicos.map((cargo, index) => (
                      <div key={index} style={{
                        background: 'linear-gradient(135deg, #f8fafb, #ffffff)',
                        padding: '25px',
                        borderRadius: '15px',
                        border: '2px solid #e1e8ed',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        textAlign: 'center',
                        transition: 'all 0.3s ease'
                      }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.transform = 'translateY(-3px)';
                          e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                        }}
                      >
                        <div style={{
                          background: 'linear-gradient(135deg, #22c55e, #15803d)',
                          color: 'white',
                          width: '80px',
                          height: '80px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '2rem',
                          margin: '0 auto 15px'
                        }}>
                          👷
                        </div>
                        <h5 style={{
                          margin: '0 0 10px 0',
                          fontSize: '1.2rem',
                          fontWeight: '600',
                          color: '#333'
                        }}>
                          {cargo}
                        </h5>
                        <div style={{
                          background: '#f0fdf4',
                          color: '#15803d',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          fontSize: '0.9rem',
                          fontWeight: '600'
                        }}>
                          Presente en el proyecto
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{
                    textAlign: 'center',
                    padding: '60px',
                    color: '#666'
                  }}>
                    <div style={{ fontSize: '4rem', marginBottom: '20px' }}>👷</div>
                    <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>
                      No hay información de cargos
                    </h3>
                    <p style={{ margin: 0, color: '#666' }}>
                      No se encontró información detallada de los cargos para este centro.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        )}

        {/* NUEVO: Modal de información del centro desde vista de búsqueda */}
        {centroSeleccionado && modalBusqueda && vistaActual === 'busqueda' && (
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
              padding: '30px',
              maxWidth: '900px',
              width: '100%',
              maxHeight: '85vh',
              overflowY: 'auto',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '25px',
                paddingBottom: '15px',
                borderBottom: '2px solid #f0f0f0'
              }}>
                <div>
                  <h3 style={{
                    margin: '0 0 5px 0',
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    color: '#333'
                  }}>
                    🏢 {centroSeleccionado.centroNombre}
                  </h3>
                  <p style={{
                    margin: 0,
                    fontSize: '0.9rem',
                    color: '#666'
                  }}>
                    {modalBusqueda === 'info' ? '📊 Información Completa' : '👷 Cargos de Trabajadores'} (Desde Búsqueda)
                  </p>
                </div>
                <button
                  onClick={() => setModalBusqueda(null)}
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

              {modalBusqueda === 'info' ? (
                // Vista de información completa
                <div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '20px',
                    marginBottom: '30px'
                  }}>
                    <div style={{
                      background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
                      color: 'white',
                      padding: '20px',
                      borderRadius: '15px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🏢</div>
                      <h4 style={{ margin: '0 0 5px 0' }}>Orden de Compra</h4>
                      <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: '600' }}>
                        {centroSeleccionado.centroId}
                      </p>
                    </div>

                    <div style={{
                      background: 'linear-gradient(135deg, #22c55e, #15803d)',
                      color: 'white',
                      padding: '20px',
                      borderRadius: '15px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '2rem', marginBottom: '10px' }}>👥</div>
                      <h4 style={{ margin: '0 0 5px 0' }}>Total Trabajadores</h4>
                      <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: '600' }}>
                        {centroSeleccionado.trabajadores.length}
                      </p>
                    </div>

                    <div style={{
                      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                      color: 'white',
                      padding: '20px',
                      borderRadius: '15px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⏰</div>
                      <h4 style={{ margin: '0 0 5px 0' }}>Total Horas</h4>
                      <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: '600' }}>
                        {formatearHoras(centroSeleccionado.trabajadores.reduce((sum, t) => sum + t.totalHoras, 0))}
                      </p>
                    </div>

                    <div style={{
                      background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                      color: 'white',
                      padding: '20px',
                      borderRadius: '15px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '2rem', marginBottom: '10px' }}>💰</div>
                      <h4 style={{ margin: '0 0 5px 0' }}>Mano de Obra</h4>
                      <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: '600' }}>
                        {formatearMoneda(centroSeleccionado.manoObraTotal || datosCompletos.manoObraTotal)}
                      </p>
                    </div>
                  </div>

                  {/* Información del proyecto */}
                  <div style={{
                    background: '#f8fafb',
                    padding: '20px',
                    borderRadius: '15px',
                    border: '2px solid #e1e8ed',
                    marginBottom: '20px'
                  }}>
                    <h4 style={{
                      margin: '0 0 15px 0',
                      color: '#333',
                      fontSize: '1.2rem'
                    }}>
                      📋 Información del Proyecto
                    </h4>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                      gap: '15px'
                    }}>
                      <div>
                        <strong style={{ color: '#22c55e' }}>Cliente:</strong><br />
                        <span style={{ fontSize: '1.1rem' }}>
                          {datosCompletos.cliente ? datosCompletos.cliente.nombreCliente : 'Sin cliente asignado'}
                        </span>
                      </div>
                      <div>
                        <strong style={{ color: '#22c55e' }}>Estado:</strong><br />
                        <span style={{ fontSize: '1.1rem' }}>
                          {centroEncontrado?.estado ? (centroEncontrado.estado ? 'Abierto' : 'Cerrado') : 'No especificado'}
                        </span>
                      </div>
                      <div>
                        <strong style={{ color: '#22c55e' }}>Tipo:</strong><br />
                        <span style={{ fontSize: '1.1rem' }}>
                          {centroEncontrado?.tipo || 'No especificado'}
                        </span>
                      </div>
                      <div>
                        <strong style={{ color: '#22c55e' }}>Valor de la Orden:</strong><br />
                        <span style={{ fontSize: '1.1rem' }}>
                          {centroEncontrado?.valorOrden ? formatearMoneda(centroEncontrado.valorOrden) : 'No especificado'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Personal del proyecto */}
                  <div style={{
                    background: '#f0f9ff',
                    padding: '20px',
                    borderRadius: '15px',
                    border: '2px solid #bfdbfe',
                    marginBottom: '20px'
                  }}>
                    <h4 style={{
                      margin: '0 0 15px 0',
                      color: '#333',
                      fontSize: '1.2rem'
                    }}>
                      👥 Personal del Proyecto
                    </h4>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '15px'
                    }}>
                      <div>
                        <strong style={{ color: '#1d4ed8' }}>Interventor:</strong><br />
                        <span style={{ fontSize: '1.1rem' }}>
                          {centroEncontrado?.interventor || 'No asignado'}
                        </span>
                      </div>
                      <div>
                        <strong style={{ color: '#1d4ed8' }}>Vendedor:</strong><br />
                        <span style={{ fontSize: '1.1rem' }}>
                          {centroEncontrado?.vendedor || 'No asignado'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Fechas del proyecto */}
                  <div style={{
                    background: '#fef3c7',
                    padding: '20px',
                    borderRadius: '15px',
                    border: '2px solid #fde68a'
                  }}>
                    <h4 style={{
                      margin: '0 0 15px 0',
                      color: '#333',
                      fontSize: '1.2rem'
                    }}>
                      📅 Fechas del Proyecto
                    </h4>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '15px'
                    }}>
                      <div>
                        <strong style={{ color: '#d97706' }}>Fecha de Inicio:</strong><br />
                        <span style={{ fontSize: '1.1rem' }}>
                          {formatearFecha(centroSeleccionado.fechaInicio)}
                        </span>
                      </div>
                      <div>
                        <strong style={{ color: '#d97706' }}>Fecha Final:</strong><br />
                        <span style={{ fontSize: '1.1rem' }}>
                          {centroSeleccionado.fechaFinal ? formatearFecha(centroSeleccionado.fechaFinal) : '🟢 Vigente'}
                        </span>
                      </div>
                      <div>
                        <strong style={{ color: '#d97706' }}>Fecha de Factura:</strong><br />
                        <span style={{ fontSize: '1.1rem' }}>
                          {centroEncontrado?.fechaFactura ? formatearFecha(centroEncontrado.fechaFactura) : 'No especificada'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Mostrar botón para ver cargos o mensaje informativo */}
                  <div style={{
                    marginTop: '20px',
                    textAlign: 'center'
                  }}>
                    {centroSeleccionado.trabajadores.length > 0 ? (
                      <button
                        onClick={() => setModalBusqueda('cargos')}
                        style={{
                          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                          color: 'white',
                          border: 'none',
                          padding: '15px 30px',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '1rem'
                        }}
                      >
                        👷 Ver Cargos de Trabajadores ({centroSeleccionado.trabajadores.length})
                      </button>
                    ) : (
                      <div style={{
                        padding: '20px',
                        background: '#f3f4f6',
                        borderRadius: '12px',
                        border: '2px solid #d1d5db'
                      }}>
                        <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📋</div>
                        <h4 style={{ margin: '0 0 10px 0', color: '#374151' }}>
                          Centro sin Trabajadores Registrados
                        </h4>
                        <p style={{ margin: 0, color: '#6b7280', fontSize: '0.95rem' }}>
                          Este centro no tiene trabajadores registrados en el sistema.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // Vista de cargos
                <div>
                  <div style={{
                    marginBottom: '20px',
                    padding: '15px 20px',
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    color: 'white',
                    borderRadius: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <h4 style={{ margin: 0, fontSize: '1.2rem' }}>
                      👷 Cargos en el Centro
                    </h4>
                    <button
                      onClick={() => setModalBusqueda('info')}
                      style={{
                        background: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.3)',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.9rem'
                      }}
                    >
                      📊 Ver Información
                    </button>
                  </div>

                  {datosCompletos.cargosUnicos.length > 0 ? (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                      gap: '15px',
                      maxHeight: '500px',
                      overflowY: 'auto',
                      padding: '10px'
                    }}>
                      {datosCompletos.cargosUnicos.map((cargo, index) => (
                        <div key={index} style={{
                          background: 'linear-gradient(135deg, #f8fafb, #ffffff)',
                          padding: '25px',
                          borderRadius: '15px',
                          border: '2px solid #e1e8ed',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                          textAlign: 'center',
                          transition: 'all 0.3s ease'
                        }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-3px)';
                            e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                          }}
                        >
                          <div style={{
                            background: 'linear-gradient(135deg, #22c55e, #15803d)',
                            color: 'white',
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2rem',
                            margin: '0 auto 15px'
                          }}>
                            👷
                          </div>
                          <h5 style={{
                            margin: '0 0 10px 0',
                            fontSize: '1.2rem',
                            fontWeight: '600',
                            color: '#333'
                          }}>
                            {cargo}
                          </h5>
                          <div style={{
                            background: '#f0fdf4',
                            color: '#15803d',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            fontWeight: '600'
                          }}>
                            Presente en el proyecto
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{
                      textAlign: 'center',
                      padding: '60px',
                      color: '#666'
                    }}>
                      <div style={{ fontSize: '4rem', marginBottom: '20px' }}>👷</div>
                      <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>
                        No hay información de cargos
                      </h3>
                      <p style={{ margin: 0, color: '#666' }}>
                        No se encontró información detallada de los cargos para este centro.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
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