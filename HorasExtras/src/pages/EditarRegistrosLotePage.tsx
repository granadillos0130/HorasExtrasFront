// HorasExtras/src/pages/EditarRegistrosLotePage.tsx - VERSIÓN CORREGIDA
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { registrosService } from "../api/registrosService";
import { trabajadoresService } from "../api/trabajadoresService";
import { centrosService } from "../api/centrosService";
import type { 
  Registro, 
  RegistroActualizacionDto, 
  EstadoEdicionRegistro,
  ConfiguracionEdicionLote, 
  RegistroInputDto
} from "../types/registros";
import type { Trabajador } from "../types/trabajadores";
import type { Centro } from "../types/centros";

const EditarRegistrosLotePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get('return') || '/registros';

  // Estados principales
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string>("");
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [registrosSeleccionados, setRegistrosSeleccionados] = useState<Set<number>>(new Set());
  const [estadosEdicion, setEstadosEdicion] = useState<Map<number, EstadoEdicionRegistro>>(new Map());
  
  // Estados para datos de referencia
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [centros, setCentros] = useState<Centro[]>([]);
  const [analistas, setAnalistas] = useState<{ id: number; nombreCompleto: string }[]>([]);
  
  // Estados para filtros y configuración
  const [configuracion, setConfiguracion] = useState<ConfiguracionEdicionLote>({
    mostrarSoloSeleccionados: false,
    aplicarATodos: false,
    camposAEditar: [],
    filtros: {}
  });

  // Estados para edición en lote
  const [editandoEnLote, setEditandoEnLote] = useState(false);
  const [valoresLote, setValoresLote] = useState<Partial<RegistroActualizacionDto>>({});
  const [camposLoteSeleccionados, setCamposLoteSeleccionados] = useState<Set<string>>(new Set());

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);

        // Obtener parámetros de URL para filtros iniciales
        const trabajadorId = searchParams.get('trabajadorId');
        const fechaInicio = searchParams.get('fechaInicio');
        const fechaFin = searchParams.get('fechaFin');

        let registrosData: Registro[] = [];

        if (trabajadorId && fechaInicio && fechaFin) {
          // Cargar registros por rango de fechas
          registrosData = await registrosService.buscarPorTrabajadorRangoFechas(
            parseInt(trabajadorId),
            fechaInicio,
            fechaFin
          );
        } else {
          // Cargar todos los registros (limitado)
          registrosData = await registrosService.obtenerTodos();
          // Limitar a los últimos 100 registros para rendimiento
          registrosData = registrosData.slice(0, 100);
        }

        // Filtrar solo registros de trabajo (no ausencias)
        const registrosTrabajo = registrosData.filter(r => 
          r.centroId !== 'AUSENCIA' && r.tipoRegistro !== 'AUSENCIA'
        );

        setRegistros(registrosTrabajo);

        // Cargar datos de referencia
        const [trabajadoresData, centrosData, analistasData] = await Promise.all([
          trabajadoresService.getAll(),
          centrosService.getAll(),
          trabajadoresService.getAnalistas()
        ]);

        setTrabajadores(trabajadoresData.filter(t => t.estado === "Vigente"));
        setCentros(centrosData);
        setAnalistas(analistasData);

        // Inicializar estados de edición
        const nuevosEstados = new Map<number, EstadoEdicionRegistro>();
        registrosTrabajo.forEach(registro => {
          nuevosEstados.set(registro.id, {
            id: registro.id,
            editando: false,
            guardando: false,
            errores: [],
            datosOriginales: registro,
            datosEditados: {}
          });
        });
        setEstadosEdicion(nuevosEstados);

      } catch (err) {
        console.error("Error al cargar datos:", err);
        setError("Error al cargar los datos");
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [searchParams]);

  // Manejar selección de registros
  const toggleSeleccionRegistro = (id: number) => {
    const nuevaSeleccion = new Set(registrosSeleccionados);
    if (nuevaSeleccion.has(id)) {
      nuevaSeleccion.delete(id);
    } else {
      nuevaSeleccion.add(id);
    }
    setRegistrosSeleccionados(nuevaSeleccion);
  };

  // Seleccionar/deseleccionar todos
  const toggleSeleccionTodos = () => {
    if (registrosSeleccionados.size === registros.length) {
      setRegistrosSeleccionados(new Set());
    } else {
      setRegistrosSeleccionados(new Set(registros.map(r => r.id)));
    }
  };

  // Activar edición individual
  const activarEdicion = (id: number) => {
    const nuevosEstados = new Map(estadosEdicion);
    const estado = nuevosEstados.get(id);
    if (estado) {
      estado.editando = true;
      nuevosEstados.set(id, estado);
      setEstadosEdicion(nuevosEstados);
    }
  };

  // Cancelar edición individual
  const cancelarEdicion = (id: number) => {
    const nuevosEstados = new Map(estadosEdicion);
    const estado = nuevosEstados.get(id);
    if (estado) {
      estado.editando = false;
      estado.datosEditados = {};
      estado.errores = [];
      nuevosEstados.set(id, estado);
      setEstadosEdicion(nuevosEstados);
    }
  };

  // Actualizar datos editados
  const actualizarDatosEditados = (id: number, campo: string, valor: string | number | boolean) => {
    const nuevosEstados = new Map(estadosEdicion);
    const estado = nuevosEstados.get(id);
    if (estado) {
      estado.datosEditados = {
        ...estado.datosEditados,
        [campo]: valor
      };
      nuevosEstados.set(id, estado);
      setEstadosEdicion(nuevosEstados);
    }
  };

  // Guardar registro individual
  const guardarRegistro = async (id: number) => {
    const estado = estadosEdicion.get(id);
    if (!estado) return;

    try {
      const nuevosEstados = new Map(estadosEdicion);
      estado.guardando = true;
      nuevosEstados.set(id, estado);
      setEstadosEdicion(nuevosEstados);

      const registro = estado.datosOriginales;
      const datosActualizados: RegistroInputDto = {
        Trabajador_ID: estado.datosEditados.Trabajador_ID || registro.trabajadorId,
        Centro_ID: estado.datosEditados.Centro_ID || registro.centroId.toString(),
        Nombr_Centro: estado.datosEditados.Nombr_Centro || registro.nombreCentro,
        Fecha: estado.datosEditados.Fecha || registro.fecha,
        Hora_Ingreso: estado.datosEditados.Hora_Ingreso || registro.horaIngreso.substring(0, 5),
        Hora_Salida: estado.datosEditados.Hora_Salida || registro.horaSalida.substring(0, 5),
        Tiempo_Almuerzo: estado.datosEditados.Tiempo_Almuerzo || registro.tiempoAlmuerzo,
        desplazamientoIda: estado.datosEditados.desplazamientoIda || registro.desplazamientoIda?.substring(0, 5),
        desplazamientoRegreso: estado.datosEditados.desplazamientoRegreso || registro.desplazamientoRegreso?.substring(0, 5),
        // 🆕 AGREGAR CAMPO CONDUCTOR
        EsConductor: estado.datosEditados.EsConductor !== undefined ? Boolean(estado.datosEditados.EsConductor) : (registro.esConductor || false),
        AnalistaId: estado.datosEditados.AnalistaId || analistas[0]?.id || 0
      };

      await registrosService.actualizar(id, datosActualizados);

      // Actualizar registro en la lista
      const registroActualizado = await registrosService.obtenerPorId(id);
      setRegistros(prev => prev.map(r => r.id === id ? registroActualizado : r));

      // Resetear estado de edición
      estado.editando = false;
      estado.guardando = false;
      estado.datosEditados = {};
      estado.errores = [];
      estado.datosOriginales = registroActualizado;
      nuevosEstados.set(id, estado);
      setEstadosEdicion(nuevosEstados);

    } catch (err: unknown) {
      console.error("Error al guardar:", err);
      const nuevosEstados = new Map(estadosEdicion);
      const estado = nuevosEstados.get(id);
      if (estado) {
        estado.guardando = false;
        // 🔧 Corregir el tipo any
        const errorMessage = err instanceof Error ? err.message : 
                           (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 
                           'Error al guardar';
        estado.errores = [errorMessage];
        nuevosEstados.set(id, estado);
        setEstadosEdicion(nuevosEstados);
      }
    }
  };

  // Aplicar cambios en lote
  const aplicarCambiosLote = async () => {
    if (registrosSeleccionados.size === 0) {
      setError("Debe seleccionar al menos un registro");
      return;
    }

    if (camposLoteSeleccionados.size === 0) {
      setError("Debe seleccionar al menos un campo para editar");
      return;
    }

    try {
      setGuardando(true);
      setError("");

      const registrosParaActualizar: RegistroActualizacionDto[] = [];

      registrosSeleccionados.forEach(id => {
        const registro = registros.find(r => r.id === id);
        if (!registro) return;

        const datosActualizados: RegistroActualizacionDto = {
          Id: id,
          Trabajador_ID: camposLoteSeleccionados.has('Trabajador_ID') ? 
            (valoresLote.Trabajador_ID || registro.trabajadorId) : registro.trabajadorId,
          Centro_ID: camposLoteSeleccionados.has('Centro_ID') ? 
            (valoresLote.Centro_ID || registro.centroId.toString()) : registro.centroId.toString(),
          Nombr_Centro: camposLoteSeleccionados.has('Nombr_Centro') ? 
            (valoresLote.Nombr_Centro || registro.nombreCentro) : registro.nombreCentro,
          Fecha: camposLoteSeleccionados.has('Fecha') ? 
            (valoresLote.Fecha || registro.fecha) : registro.fecha,
          Hora_Ingreso: camposLoteSeleccionados.has('Hora_Ingreso') ? 
            (valoresLote.Hora_Ingreso || registro.horaIngreso.substring(0, 5)) : registro.horaIngreso.substring(0, 5),
          Hora_Salida: camposLoteSeleccionados.has('Hora_Salida') ? 
            (valoresLote.Hora_Salida || registro.horaSalida.substring(0, 5)) : registro.horaSalida.substring(0, 5),
          Tiempo_Almuerzo: camposLoteSeleccionados.has('Tiempo_Almuerzo') ? 
            (valoresLote.Tiempo_Almuerzo || registro.tiempoAlmuerzo) : registro.tiempoAlmuerzo,
          desplazamientoIda: camposLoteSeleccionados.has('desplazamientoIda') ? 
            valoresLote.desplazamientoIda : registro.desplazamientoIda?.substring(0, 5),
          desplazamientoRegreso: camposLoteSeleccionados.has('desplazamientoRegreso') ? 
            valoresLote.desplazamientoRegreso : registro.desplazamientoRegreso?.substring(0, 5),
          // 🆕 AGREGAR CAMPO CONDUCTOR
          EsConductor: camposLoteSeleccionados.has('EsConductor') ? 
            Boolean(valoresLote.EsConductor) : (registro.esConductor || false),
          AnalistaId: camposLoteSeleccionados.has('AnalistaId') ? 
            (valoresLote.AnalistaId || analistas[0]?.id || 0) : analistas[0]?.id || 0
        };

        registrosParaActualizar.push(datosActualizados);
      });

      const respuesta = await registrosService.actualizarLote(registrosParaActualizar);

      // Mostrar resultados
      if (respuesta.errores.length > 0) {
        setError(`Se actualizaron ${respuesta.registrosActualizados} de ${respuesta.totalProcesados} registros. Errores: ${respuesta.errores.join(', ')}`);
      } else {
        // Recargar registros actualizados
        const idsActualizados = Array.from(registrosSeleccionados);
        const registrosActualizados = await registrosService.obtenerPorIds(idsActualizados);
        
        setRegistros(prev => prev.map(r => {
          const actualizado = registrosActualizados.find(ra => ra.id === r.id);
          return actualizado || r;
        }));

        // Limpiar selección y valores
        setRegistrosSeleccionados(new Set());
        setValoresLote({});
        setCamposLoteSeleccionados(new Set());
        setEditandoEnLote(false);

        alert(`✅ Se actualizaron ${respuesta.registrosActualizados} registros correctamente`);
      }

    } catch (err: unknown) {
      console.error("Error al aplicar cambios en lote:", err);
      // 🔧 Corregir el tipo any
      const errorMessage = err instanceof Error ? err.message : 
                         (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 
                         'Error al aplicar cambios en lote';
      setError(errorMessage);
    } finally {
      setGuardando(false);
    }
  };

  // Manejar cambio en campos de lote
  const toggleCampoLote = (campo: string) => {
    const nuevosCampos = new Set(camposLoteSeleccionados);
    if (nuevosCampos.has(campo)) {
      nuevosCampos.delete(campo);
    } else {
      nuevosCampos.add(campo);
    }
    setCamposLoteSeleccionados(nuevosCampos);
  };

  // Renderizar campo editable
  const renderizarCampoEditable = (registro: Registro, campo: string, tipo: 'text' | 'time' | 'date' | 'select' | 'checkbox' = 'text') => {
    const estado = estadosEdicion.get(registro.id);
    if (!estado || !estado.editando) {
      // Modo vista
      let valor = '';
      switch (campo) {
        case 'trabajadorNombre':
          valor = registro.trabajadorNombre;
          break;
        case 'nombreCentro':
          valor = registro.nombreCentro;
          break;
        case 'fecha':
          valor = registro.fecha;
          break;
        case 'horaIngreso':
          valor = registro.horaIngreso.substring(0, 5);
          break;
        case 'horaSalida':
          valor = registro.horaSalida.substring(0, 5);
          break;
        case 'tiempoAlmuerzo':
          valor = registro.tiempoAlmuerzo;
          break;
        case 'desplazamientoIda':
          valor = registro.desplazamientoIda?.substring(0, 5) || '--:--';
          break;
        case 'desplazamientoRegreso':
          valor = registro.desplazamientoRegreso?.substring(0, 5) || '--:--';
          break;
        case 'esConductor':
          valor = registro.esConductor ? '🚛 Conductor' : '👷 No Conductor';
          break;
        default:
          valor = '--';
      }
      return <span>{valor}</span>;
    }

    // Modo edición
    const valorEditado = estado.datosEditados[campo as keyof RegistroActualizacionDto];
    
    if (tipo === 'checkbox') {
      const valorActual = valorEditado !== undefined ? Boolean(valorEditado) : (registro.esConductor || false);
      return (
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            checked={valorActual}
            onChange={(e) => actualizarDatosEditados(registro.id, campo, e.target.checked)}
          />
          <span>{valorActual ? '🚛 Conductor' : '👷 No Conductor'}</span>
        </label>
      );
    }

    const valorActual = valorEditado ?? (() => {
      switch (campo) {
        case 'Trabajador_ID': return registro.trabajadorId;
        case 'Centro_ID': return registro.centroId.toString();
        case 'Fecha': return registro.fecha;
        case 'Hora_Ingreso': return registro.horaIngreso.substring(0, 5);
        case 'Hora_Salida': return registro.horaSalida.substring(0, 5);
        case 'Tiempo_Almuerzo': return registro.tiempoAlmuerzo;
        case 'desplazamientoIda': return registro.desplazamientoIda?.substring(0, 5) || '';
        case 'desplazamientoRegreso': return registro.desplazamientoRegreso?.substring(0, 5) || '';
        default: return '';
      }
    })();

    if (tipo === 'select') {
      if (campo === 'Trabajador_ID') {
        return (
          <select
            value={valorActual.toString()}
            onChange={(e) => actualizarDatosEditados(registro.id, campo, Number(e.target.value))}
            style={{
              width: '100%',
              padding: '6px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '0.9rem'
            }}
          >
            {trabajadores.map(t => (
              <option key={t.id} value={t.id}>{t.nombre}</option>
            ))}
          </select>
        );
      } else if (campo === 'Centro_ID') {
        return (
          <select
            value={valorActual.toString()}
            onChange={(e) => actualizarDatosEditados(registro.id, campo, e.target.value)}
            style={{
              width: '100%',
              padding: '6px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '0.9rem'
            }}
          >
            {centros.map(c => (
              <option key={c.id} value={c.id}>{c.nombreCentro}</option>
            ))}
          </select>
        );
      }
    }

    return (
      <input
        type={tipo}
        value={valorActual.toString()}
        onChange={(e) => actualizarDatosEditados(registro.id, campo, e.target.value)}
        style={{
          width: '100%',
          padding: '6px',
          border: '1px solid #ddd',
          borderRadius: '4px',
          fontSize: '0.9rem'
        }}
      />
    );
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '20px',
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '20px' }}>🔄</div>
          <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>
            Cargando registros...
          </div>
        </div>
      </div>
    );
  }

  const registrosFiltrados = configuracion.mostrarSoloSeleccionados 
    ? registros.filter(r => registrosSeleccionados.has(r.id))
    : registros;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '30px',
          color: 'white'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            marginBottom: '10px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            📊 Editar Registros en Lote
          </h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>
            Selecciona y edita múltiples registros simultáneamente
          </p>
        </div>

        {/* Panel de control */}
        <div style={{
          background: 'white',
          borderRadius: '15px',
          padding: '25px',
          marginBottom: '20px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '15px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ fontWeight: '600', color: '#333' }}>
                📋 {registros.length} registros | {registrosSeleccionados.size} seleccionados
              </span>
              
              <button
                onClick={toggleSeleccionTodos}
                style={{
                  background: registrosSeleccionados.size === registros.length 
                    ? 'linear-gradient(135deg, #ef4444, #dc2626)' 
                    : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.9rem'
                }}
              >
                {registrosSeleccionados.size === registros.length ? '❌ Deseleccionar Todo' : '✅ Seleccionar Todo'}
              </button>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={configuracion.mostrarSoloSeleccionados}
                  onChange={(e) => setConfiguracion(prev => ({
                    ...prev,
                    mostrarSoloSeleccionados: e.target.checked
                  }))}
                />
                <span style={{ fontSize: '0.9rem' }}>Solo seleccionados</span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              {registrosSeleccionados.size > 0 && (
                <button
                  onClick={() => setEditandoEnLote(!editandoEnLote)}
                  style={{
                    background: editandoEnLote 
                      ? 'linear-gradient(135deg, #f59e0b, #d97706)' 
                      : 'linear-gradient(135deg, #22c55e, #15803d)',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  {editandoEnLote ? '📝 Cancelar Edición Lote' : '🛠️ Editar en Lote'}
                </button>
              )}

              <button
                onClick={() => navigate(returnUrl)}
                style={{
                  background: 'linear-gradient(135deg, #6b7280, #4b5563)',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                ← Volver
              </button>
            </div>
          </div>

          {/* Panel de edición en lote */}
          {editandoEnLote && registrosSeleccionados.size > 0 && (
            <div style={{
              marginTop: '20px',
              padding: '20px',
              background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
              border: '2px solid #f59e0b',
              borderRadius: '12px'
            }}>
              <h4 style={{ margin: '0 0 15px 0', color: '#92400e' }}>
                🛠️ Edición en Lote - {registrosSeleccionados.size} registros seleccionados
              </h4>
              
              {error && (
                <div style={{
                  background: '#fee2e2',
                  border: '1px solid #ef4444',
                  color: '#dc2626',
                  padding: '10px',
                  borderRadius: '6px',
                  marginBottom: '15px'
                }}>
                  {error}
                </div>
              )}

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '15px',
                marginBottom: '20px'
              }}>
                {/* Campo Trabajador */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <input
                      type="checkbox"
                      checked={camposLoteSeleccionados.has('Trabajador_ID')}
                      onChange={() => toggleCampoLote('Trabajador_ID')}
                    />
                    <span style={{ fontWeight: '600' }}>👤 Trabajador</span>
                  </label>
                  <select
                    disabled={!camposLoteSeleccionados.has('Trabajador_ID')}
                    value={valoresLote.Trabajador_ID?.toString() || ''}
                    onChange={(e) => setValoresLote(prev => ({ ...prev, Trabajador_ID: Number(e.target.value) }))}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ccc',
                      borderRadius: '6px',
                      opacity: camposLoteSeleccionados.has('Trabajador_ID') ? 1 : 0.5
                    }}
                  >
                    <option value="">Seleccionar...</option>
                    {trabajadores.map(t => (
                      <option key={t.id} value={t.id}>{t.nombre}</option>
                    ))}
                  </select>
                </div>

                {/* Campo Centro */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <input
                      type="checkbox"
                      checked={camposLoteSeleccionados.has('Centro_ID')}
                      onChange={() => toggleCampoLote('Centro_ID')}
                    />
                    <span style={{ fontWeight: '600' }}>🏢 Centro</span>
                  </label>
                  <select
                    disabled={!camposLoteSeleccionados.has('Centro_ID')}
                    value={valoresLote.Centro_ID?.toString() || ''}
                    onChange={(e) => setValoresLote(prev => ({ ...prev, Centro_ID: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ccc',
                      borderRadius: '6px',
                      opacity: camposLoteSeleccionados.has('Centro_ID') ? 1 : 0.5
                    }}
                  >
                    <option value="">Seleccionar...</option>
                    {centros.map(c => (
                      <option key={c.id} value={c.id}>{c.nombreCentro}</option>
                    ))}
                  </select>
                </div>

                {/* Campo Hora Ingreso */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <input
                      type="checkbox"
                      checked={camposLoteSeleccionados.has('Hora_Ingreso')}
                      onChange={() => toggleCampoLote('Hora_Ingreso')}
                    />
                    <span style={{ fontWeight: '600' }}>🕐 Hora Ingreso</span>
                  </label>
                  <input
                    type="time"
                    disabled={!camposLoteSeleccionados.has('Hora_Ingreso')}
                    value={valoresLote.Hora_Ingreso || ''}
                    onChange={(e) => setValoresLote(prev => ({ ...prev, Hora_Ingreso: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ccc',
                      borderRadius: '6px',
                      opacity: camposLoteSeleccionados.has('Hora_Ingreso') ? 1 : 0.5
                    }}
                  />
                </div>

                {/* Campo Hora Salida */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <input
                      type="checkbox"
                      checked={camposLoteSeleccionados.has('Hora_Salida')}
                      onChange={() => toggleCampoLote('Hora_Salida')}
                    />
                    <span style={{ fontWeight: '600' }}>🕐 Hora Salida</span>
                  </label>
                  <input
                    type="time"
                    disabled={!camposLoteSeleccionados.has('Hora_Salida')}
                    value={valoresLote.Hora_Salida || ''}
                    onChange={(e) => setValoresLote(prev => ({ ...prev, Hora_Salida: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ccc',
                      borderRadius: '6px',
                      opacity: camposLoteSeleccionados.has('Hora_Salida') ? 1 : 0.5
                    }}
                  />
                </div>

                {/* 🆕 Campo Conductor */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <input
                      type="checkbox"
                      checked={camposLoteSeleccionados.has('EsConductor')}
                      onChange={() => toggleCampoLote('EsConductor')}
                    />
                    <span style={{ fontWeight: '600' }}>🚛 Es Conductor</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      disabled={!camposLoteSeleccionados.has('EsConductor')}
                      checked={Boolean(valoresLote.EsConductor)}
                      onChange={(e) => setValoresLote(prev => ({ ...prev, EsConductor: e.target.checked }))}
                      style={{ 
                        opacity: camposLoteSeleccionados.has('EsConductor') ? 1 : 0.5,
                        transform: 'scale(1.2)'
                      }}
                    />
                    <span style={{ 
                      fontSize: '0.9rem',
                      opacity: camposLoteSeleccionados.has('EsConductor') ? 1 : 0.5
                    }}>
                      {valoresLote.EsConductor ? '🚛 Conductor' : '👷 No Conductor'}
                    </span>
                  </label>
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <button
                  onClick={aplicarCambiosLote}
                  disabled={guardando || camposLoteSeleccionados.size === 0}
                  style={{
                    background: guardando || camposLoteSeleccionados.size === 0
                      ? 'linear-gradient(135deg, #9ca3af, #6b7280)'
                      : 'linear-gradient(135deg, #22c55e, #15803d)',
                    color: 'white',
                    border: 'none',
                    padding: '12px 30px',
                    borderRadius: '8px',
                    cursor: guardando || camposLoteSeleccionados.size === 0 ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    fontSize: '1rem'
                  }}
                >
                  {guardando ? '🔄 Aplicando Cambios...' : `💾 Aplicar a ${registrosSeleccionados.size} Registros`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tabla de registros */}
        <div style={{
          background: 'white',
          borderRadius: '15px',
          padding: '25px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          overflowX: 'auto'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.9rem'
          }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ padding: '12px 8px', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                  <input
                    type="checkbox"
                    checked={registrosSeleccionados.size === registrosFiltrados.length && registrosFiltrados.length > 0}
                    onChange={toggleSeleccionTodos}
                  />
                </th>
                <th style={{ padding: '12px 8px', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>Trabajador</th>
                <th style={{ padding: '12px 8px', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>Centro</th>
                <th style={{ padding: '12px 8px', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>Fecha</th>
                <th style={{ padding: '12px 8px', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>Ingreso</th>
                <th style={{ padding: '12px 8px', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>Salida</th>
                <th style={{ padding: '12px 8px', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>Conductor</th>
                <th style={{ padding: '12px 8px', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>H. Totales</th>
                <th style={{ padding: '12px 8px', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {registrosFiltrados.map(registro => {
                const estado = estadosEdicion.get(registro.id);
                const seleccionado = registrosSeleccionados.has(registro.id);
                
                return (
                  <tr 
                    key={registro.id}
                    style={{
                      backgroundColor: seleccionado ? '#eff6ff' : 
                                      estado?.editando ? '#fef3c7' : 'white',
                      borderBottom: '1px solid #e2e8f0'
                    }}
                  >
                    <td style={{ padding: '12px 8px' }}>
                      <input
                        type="checkbox"
                        checked={seleccionado}
                        onChange={() => toggleSeleccionRegistro(registro.id)}
                      />
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      {renderizarCampoEditable(registro, 'Trabajador_ID', 'select')}
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      {renderizarCampoEditable(registro, 'Centro_ID', 'select')}
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      {renderizarCampoEditable(registro, 'Fecha', 'date')}
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      {renderizarCampoEditable(registro, 'Hora_Ingreso', 'time')}
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      {renderizarCampoEditable(registro, 'Hora_Salida', 'time')}
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      {renderizarCampoEditable(registro, 'EsConductor', 'checkbox')}
                    </td>
                    <td style={{ padding: '12px 8px', fontWeight: '600' }}>
                      {registro.totalHoras.toFixed(2)}h
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        {!estado?.editando ? (
                          <button
                            onClick={() => activarEdicion(registro.id)}
                            style={{
                              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                              color: 'white',
                              border: 'none',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.8rem'
                            }}
                          >
                            ✏️
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => guardarRegistro(registro.id)}
                              disabled={estado.guardando}
                              style={{
                                background: estado.guardando 
                                  ? 'linear-gradient(135deg, #9ca3af, #6b7280)'
                                  : 'linear-gradient(135deg, #22c55e, #15803d)',
                                color: 'white',
                                border: 'none',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                cursor: estado.guardando ? 'not-allowed' : 'pointer',
                                fontSize: '0.8rem'
                              }}
                            >
                              {estado.guardando ? '⏳' : '💾'}
                            </button>
                            <button
                              onClick={() => cancelarEdicion(registro.id)}
                              disabled={estado.guardando}
                              style={{
                                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                color: 'white',
                                border: 'none',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                cursor: estado.guardando ? 'not-allowed' : 'pointer',
                                fontSize: '0.8rem'
                              }}
                            >
                              ❌
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {registrosFiltrados.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#6b7280'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📝</div>
              <div>No hay registros para mostrar</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditarRegistrosLotePage;