/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { registrosService } from "../api/registrosService";
import { trabajadoresService } from "../api/trabajadoresService";
import type { Registro, RegistroConTipo, FiltroTipoRegistro, EstadisticasDia } from "../types/registros";
import type { Trabajador } from "../types/trabajadores";
import { huelleroService } from "../api/huelleroService";
import { ModalDia } from "../components/registros/ModalDia/ModalDia";
import { CalendarioMensual } from "../components/registros/CalendarioMensual/CalendarioMensual";
import { useExportExcel } from "../hooks/useExportExcel";

interface EstadisticaDia {
  fecha: string;
  totalTrabajadores: number;
  trabajadoresConRegistro: number;
  porcentaje: number;
  registros: Registro[];
}

const RegistrosPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [añoSeleccionado, setAñoSeleccionado] = useState<number>(new Date().getFullYear());
  const [mesSeleccionado, setMesSeleccionado] = useState<number | null>(null);
  const [diaSeleccionado, setDiaSeleccionado] = useState<string | null>(null);
  const [registrosDelDia, setRegistrosDelDia] = useState<RegistroConTipo[]>([]);
  const [loading, setLoading] = useState(false);
  const [trabajadoresActivos, setTrabajadoresActivos] = useState<Trabajador[]>([]);
  const [estadisticasMes, setEstadisticasMes] = useState<Map<string, EstadisticaDia>>(new Map());
  const [cargandoEstadisticas, setCargandoEstadisticas] = useState(false);
  const [registrosDelMesCompleto, setRegistrosDelMesCompleto] = useState<Map<string, Registro[]>>(new Map());


  // 🆕 Estados para ausencias integradas
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipoRegistro>('TODOS');
  const [mostrarEstadisticas, setMostrarEstadisticas] = useState(false);
  const [estadisticasDia, setEstadisticasDia] = useState<EstadisticasDia | null>(null);

  // 🆕 Estados para festivos
  const [creandoFestivos, setCreandoFestivos] = useState(false);
  const [sincronizandoHuellero, setSincronizandoHuellero] = useState(false);
  // Estados para mensajes de éxito
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successType, setSuccessType] = useState<string>('');

  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];


  // 🆕 FUNCIÓN para procesar registros y detectar ausencias
  const procesarRegistrosConTipo = useCallback((registros: Registro[]): RegistroConTipo[] => {
    return registros.map(registro => {
      const esAusencia = registro.tipoRegistro === 'AUSENCIA' ||
        registro.centroId === 'AUSENCIA' ||
        registro.nombreCentro?.includes('AUSENCIA');

      return {
        ...registro,
        tipoRegistro: esAusencia ? 'AUSENCIA' as const : 'TRABAJO' as const,
        ausenciaInfo: esAusencia ? {
          id: Math.abs(registro.id),
          tipoAusencia: registro.tipoAusencia || 'No especificado',
          descripcion: registro.nombreCentro || '',
          remunerado: registro.esRemunerada || false,
          horasAusente: registro.horasAusente || registro.totalHoras
        } : undefined
      } as RegistroConTipo;
    });
  }, []);

  // 🆕 FUNCIÓN para calcular estadísticas del día
  const calcularEstadisticasDia = useCallback((registros: RegistroConTipo[]): EstadisticasDia => {
    const registrosTrabajo = registros.filter(r => r.tipoRegistro === 'TRABAJO');
    const registrosAusencia = registros.filter(r => r.tipoRegistro === 'AUSENCIA');

    return {
      fecha: diaSeleccionado || '',
      totalRegistros: registros.length,
      registrosTrabajo: registrosTrabajo.length,
      registrosAusencia: registrosAusencia.length,
      trabajadoresUnicos: new Set(registros.map(r => r.trabajadorId)).size,
      horasTotales: registros.reduce((sum, r) => sum + r.totalHoras, 0),
      horasNormales: registros.reduce((sum, r) => sum + r.horasNormales, 0),
      horasExtras: registros.reduce((sum, r) =>
        sum + r.horasExtrasDiurnas + r.horasExtrasNocturnas +
        r.extrasDominicalesDiurnas + r.extrasDominicalesNocturnas, 0),
      horasAusenciasRemuneradas: registrosAusencia
        .filter(r => r.ausenciaInfo?.remunerado)
        .reduce((sum, r) => sum + r.totalHoras, 0),
      horasAusenciasNoRemuneradas: registrosAusencia
        .filter(r => !r.ausenciaInfo?.remunerado)
        .reduce((sum, r) => sum + r.totalHoras, 0)
    };
  }, [diaSeleccionado]);

  const sincronizarDesdeHuellero = async () => {
    if (!diaSeleccionado) return;

    if (!confirm(`¿Sincronizar registros desde el huellero para ${formatearFecha(diaSeleccionado + 'T00:00:00')}?`)) return;

    setSincronizandoHuellero(true);
    try {
      const resultado = await huelleroService.sincronizarAsistencia(diaSeleccionado, true);

      alert(`✅ Sincronización completada!\n\n` +
        `Completos: ${resultado.registrosCreados}\n` +
        `Con estimación: ${resultado.registrosConFallback}\n` +
        `Omitidos: ${resultado.registrosOmitidos}\n` +
        `Total: ${resultado.resumen.total}`);

      await obtenerRegistrosDelDia(diaSeleccionado);
      if (mesSeleccionado !== null) {
        await cargarEstadisticasDelMes();
      }
    } catch (error: any) {
      alert(`❌ Error: ${error?.response?.data?.error || error?.message || "Error desconocido"}`);
    } finally {
      setSincronizandoHuellero(false);
    }
  };

  // 🆕 NUEVA FUNCIÓN: Crear registros festivos
  const crearRegistrosFestivos = async () => {
    if (mesSeleccionado === null) return;

    // Primero mostrar información sobre lo que se va a crear
    const mesNombre = meses[mesSeleccionado - 1];
    const confirmMessage = `¿Crear registros festivos para TODOS los trabajadores activos en ${mesNombre} ${añoSeleccionado}?\n\nEsto creará registros automáticos para los días festivos del mes según el calendario oficial.\n\nTrabajadores activos: ${trabajadoresActivos.length}`;

    if (!confirm(confirmMessage)) return;

    setCreandoFestivos(true);
    try {
      // Primero hacer una consulta de prueba sin confirmar
      const preview = await registrosService.crearRegistrosFestivosTodosTrabajadores(
        añoSeleccionado,
        mesSeleccionado,
        false
      );

      // Mostrar la información del preview
      const previewMessage = `Se encontraron ${preview.diasFestivos?.length || 0} día(s) festivo(s) en ${mesNombre}:\n\n${preview.diasFestivos?.map((dia: any) => `• ${dia.fecha} - ${dia.nombre}`).join('\n') || 'No se encontraron días festivos'}\n\nSe crearán aproximadamente ${preview.registrosACrear || 0} registros.\n\n¿Confirmar creación?`;

      if (!confirm(previewMessage)) {
        setCreandoFestivos(false);
        return;
      }

      // Ahora sí crear los registros confirmando
      const result = await registrosService.crearRegistrosFestivosTodosTrabajadores(
        añoSeleccionado,
        mesSeleccionado,
        true
      );

      // Mostrar resultado
      alert(`✅ Registros festivos creados exitosamente!\n\nResumen:\n• Días festivos: ${result.diasFestivos?.length || 0}\n• Registros creados: ${result.registrosCreados || 0}\n• Trabajadores afectados: ${result.trabajadoresAfectados || 0}`);

      // Recargar estadísticas y datos
      if (mesSeleccionado !== null) {
        await cargarEstadisticasDelMes();
      }
      if (diaSeleccionado) {
        await obtenerRegistrosDelDia(diaSeleccionado);
      }

    } catch (error: any) {
      console.error("Error al crear registros festivos:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Error desconocido";
      alert(`❌ Error al crear registros festivos:\n\n${errorMessage}`);
    } finally {
      setCreandoFestivos(false);
    }
  };

  // ✅ FIX: Wrap in useCallback to avoid dependency issues + Added missing dependency
  const cargarEstadisticasDelMes = useCallback(async () => {
    if (mesSeleccionado === null) return;


    setCargandoEstadisticas(true);
    try {
      // UNA SOLA PETICIÓN para todo el mes
      const response = await registrosService.obtenerRegistrosMesCompleto(añoSeleccionado, mesSeleccionado);

      // Agrupar registros por fecha en el frontend
      const registrosPorFecha = new Map<string, Registro[]>();
      const estadisticas = new Map<string, EstadisticaDia>();

      // Inicializar todos los días del mes
      const diasEnMes = new Date(añoSeleccionado, mesSeleccionado, 0).getDate();
      for (let dia = 1; dia <= diasEnMes; dia++) {
        const fechaString = `${añoSeleccionado}-${mesSeleccionado.toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`;
        registrosPorFecha.set(fechaString, []);
      }

      // Agrupar registros por fecha
      response.registros.forEach(registro => {
        const fecha = registro.fecha;
        const registrosDelDia = registrosPorFecha.get(fecha) || [];
        registrosDelDia.push(registro);
        registrosPorFecha.set(fecha, registrosDelDia);
      });

      // Calcular estadísticas localmente
      registrosPorFecha.forEach((registros, fecha) => {
        // Obtener IDs únicos de trabajadores que tienen registro ese día
        const trabajadoresConRegistro = new Set(registros.map(r => r.trabajadorId));
        const cantidadConRegistro = trabajadoresConRegistro.size;
        const totalTrabajadores = trabajadoresActivos.length;
        const porcentaje = totalTrabajadores > 0 ? (cantidadConRegistro / totalTrabajadores) * 100 : 0;

        estadisticas.set(fecha, {
          fecha,
          totalTrabajadores,
          trabajadoresConRegistro: cantidadConRegistro,
          porcentaje,
          registros // Ya tenemos los registros aquí
        });
      });

      // Guardar tanto las estadísticas como los registros agrupados
      setEstadisticasMes(estadisticas);
      setRegistrosDelMesCompleto(registrosPorFecha);

    } catch (error) {
      console.error("Error al cargar estadísticas del mes:", error);
    } finally {
      setCargandoEstadisticas(false);
    }
  }, [mesSeleccionado, añoSeleccionado, trabajadoresActivos]);


  // 🆕 ACTUALIZAR la función obtenerRegistrosDelDia
  const obtenerRegistrosDelDia = useCallback(async (fecha: string) => {
    try {
      setLoading(true);

      // Usar los datos ya cargados en lugar de hacer otra petición
      const registros = registrosDelMesCompleto.get(fecha) || [];
      const registrosConTipo = procesarRegistrosConTipo(registros);
      setRegistrosDelDia(registrosConTipo);

      // Calcular estadísticas
      const estadisticas = calcularEstadisticasDia(registrosConTipo);
      setEstadisticasDia(estadisticas);
    } catch (error) {
      console.error("Error al obtener registros:", error);
      setRegistrosDelDia([]);
      setEstadisticasDia(null);
    } finally {
      setLoading(false);
    }
  }, [registrosDelMesCompleto, procesarRegistrosConTipo, calcularEstadisticasDia]);
  // 🆕 NUEVAS: Funciones para navegación de edición
  const navigateToEdit = (id: number) => {
    const searchParams = new URLSearchParams();
    searchParams.set('return', '/registros');
    if (diaSeleccionado) {
      searchParams.set('fecha', diaSeleccionado);
    }
    navigate(`/registros/editar/${id}?${searchParams.toString()}`);
  };

  const navigateToEditLote = () => {
    const searchParams = new URLSearchParams();
    searchParams.set('return', '/registros');
    if (diaSeleccionado) {
      searchParams.set('fecha', diaSeleccionado);
    }
    navigate(`/registros/editar-lote?${searchParams.toString()}`);
  };

  const navigateToEditLoteConFiltros = (trabajadorId?: number, fechaInicio?: string, fechaFin?: string) => {
    const searchParams = new URLSearchParams();
    searchParams.set('return', '/registros');

    if (trabajadorId) {
      searchParams.set('trabajadorId', trabajadorId.toString());
    }
    if (fechaInicio) {
      searchParams.set('fechaInicio', fechaInicio);
    }
    if (fechaFin) {
      searchParams.set('fechaFin', fechaFin);
    }

    navigate(`/registros/editar-lote?${searchParams.toString()}`);
  };

  // Manejar mensajes de éxito al regresar de crear registros
  useEffect(() => {
    const success = searchParams.get('success');
    if (success) {
      setSuccessType(success);
      setShowSuccessMessage(true);

      // Limpiar el parámetro de la URL
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('success');
      setSearchParams(newSearchParams, { replace: true });

      // Ocultar mensaje después de 4 segundos
      setTimeout(() => setShowSuccessMessage(false), 4000);

      // Recargar estadísticas y datos
      if (mesSeleccionado !== null) {
        cargarEstadisticasDelMes();
      }
      if (diaSeleccionado) {
        obtenerRegistrosDelDia(diaSeleccionado);
      }
    }
  }, [searchParams, mesSeleccionado, diaSeleccionado, setSearchParams, cargarEstadisticasDelMes, obtenerRegistrosDelDia]);

  // Cargar trabajadores activos al iniciar
  useEffect(() => {
    const cargarTrabajadoresActivos = async () => {
      try {
        const todos = await trabajadoresService.getAll();
        const activos = todos.filter(t => t.estado === "Vigente");
        setTrabajadoresActivos(activos);
      } catch (error) {
        console.error("Error al cargar trabajadores activos:", error);
      }
    };

    cargarTrabajadoresActivos();
  }, []);

  // Cargar estadísticas cuando se selecciona un mes
  useEffect(() => {
    if (mesSeleccionado !== null && trabajadoresActivos.length > 0) {
      cargarEstadisticasDelMes();
    }
  }, [mesSeleccionado, añoSeleccionado, trabajadoresActivos, cargarEstadisticasDelMes]);

  // Función para navegar a los formularios
  const navigateToForm = (tipo: 'individual' | 'lote') => {
    const searchParams = new URLSearchParams();

    if (diaSeleccionado) {
      searchParams.set('fecha', diaSeleccionado);
    }
    searchParams.set('return', '/registros');

    const targetPath = tipo === 'individual'
      ? `/registros/nuevo?${searchParams.toString()}`
      : `/registros/lote?${searchParams.toString()}`;

    navigate(targetPath);
  };

 const { exportando: exportandoExcel, exportarExcelMes: exportarExcel } = useExportExcel();

const exportarExcelMes = async () => {
  if (mesSeleccionado === null) return;
  await exportarExcel(añoSeleccionado, mesSeleccionado, meses[mesSeleccionado - 1]);
};

  const seleccionarDia = async (dia: number) => {
    if (mesSeleccionado === null) return;

    const fechaString = `${añoSeleccionado}-${mesSeleccionado.toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`;
    setDiaSeleccionado(fechaString);
    await obtenerRegistrosDelDia(fechaString);
  };

  const cerrarModal = () => {
    setDiaSeleccionado(null);
    setRegistrosDelDia([]);
    setFiltroTipo('TODOS');
    setEstadisticasDia(null);
  };

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    const opciones: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return date.toLocaleDateString('es-ES', opciones);
  };

  const eliminarRegistro = async (id: number) => {
    if (id > 0) {
      // Es un registro normal
      if (confirm("¿Estás seguro de eliminar este registro?")) {
        try {
          await registrosService.eliminar(id);
          if (diaSeleccionado) {
            await obtenerRegistrosDelDia(diaSeleccionado);
          }
          // Recargar estadísticas
          if (mesSeleccionado !== null) {
            cargarEstadisticasDelMes();
          }
          alert("Registro eliminado correctamente");
        } catch (error) {
          console.error("Error al eliminar registro:", error);
          alert("Error al eliminar el registro");
        }
      }
    } else {
      // Es una ausencia (ID negativo)
      if (confirm('¿Estás seguro de eliminar esta ausencia? Esto también eliminará el registro asociado.')) {
        try {
          const ausenciaId = Math.abs(id);
          // Llamar al endpoint de eliminar ausencia
          const response = await fetch(`/api/ausencias/${ausenciaId}`, { method: 'DELETE' });
          if (!response.ok) {
            throw new Error('Error al eliminar ausencia');
          }
          // Recargar datos
          if (diaSeleccionado) {
            await obtenerRegistrosDelDia(diaSeleccionado);
          }
          if (mesSeleccionado !== null) {
            cargarEstadisticasDelMes();
          }
          alert('Ausencia eliminada correctamente');
        } catch (error) {
          console.error('Error al eliminar ausencia:', error);
          alert('Error al eliminar la ausencia');
        }
      }
    }
  };
  const getSuccessMessage = (type: string) => {
    switch (type) {
      case 'registro-creado':
        return '✅ Registro individual creado exitosamente';
      case 'lote-creado':
        return '✅ Registros en lote creados exitosamente';
      case 'registro-actualizado':
        return '✅ Registro actualizado exitosamente';
      case 'lote-actualizado':
        return '✅ Registros actualizados en lote exitosamente';
      default:
        return '✅ Operación completada exitosamente';
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Mensaje de éxito flotante */}
        {showSuccessMessage && (
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'linear-gradient(135deg, #22c55e, #15803d)',
            color: 'white',
            padding: '15px 25px',
            borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(34, 197, 94, 0.4)',
            zIndex: 2000,
            fontSize: '1rem',
            fontWeight: '600',
            animation: 'slideInRight 0.5s ease-out',
            border: '2px solid rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)'
          }}>
            {getSuccessMessage(successType)}
          </div>
        )}

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
            📊 Dashboard Global de Registros
          </h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>
            Visualiza todos los registros de todos los trabajadores por día (incluye ausencias)
          </p>
          <div style={{
            fontSize: '0.95rem',
            opacity: 0.8,
            marginTop: '10px',
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            flexWrap: 'wrap'
          }}>
            <span>🔴 Sin registros (0%)</span>
            <span>🟠 Parcial (1-99%)</span>
            <span>🟢 Completo (100%)</span>
            <span>👥 {trabajadoresActivos.length} trabajadores activos</span>
          </div>
        </div>

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
                setDiaSeleccionado(null);
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

        {/* Vista de días del mes */}
        {mesSeleccionado !== null && (
          <CalendarioMensual
            año={añoSeleccionado}
            mes={mesSeleccionado}
            estadisticasMes={estadisticasMes}
            cargandoEstadisticas={cargandoEstadisticas}
            trabajadoresActivos={trabajadoresActivos.length}
            exportandoExcel={exportandoExcel}
            creandoFestivos={creandoFestivos}
            onSeleccionarDia={seleccionarDia}
            onExportarExcel={exportarExcelMes}
            onCrearFestivos={crearRegistrosFestivos}
            onEditarMes={() => {
              const fechaInicio = `${añoSeleccionado}-${mesSeleccionado.toString().padStart(2, '0')}-01`;
              const diasEnMes = new Date(añoSeleccionado, mesSeleccionado, 0).getDate();
              const fechaFin = `${añoSeleccionado}-${mesSeleccionado.toString().padStart(2, '0')}-${diasEnMes.toString().padStart(2, '0')}`;
              navigateToEditLoteConFiltros(undefined, fechaInicio, fechaFin);
            }}
            onVolverMeses={() => setMesSeleccionado(null)}
          />
        )}

        {/* Modal del día seleccionado */}
        {diaSeleccionado && (
          <ModalDia
            diaSeleccionado={diaSeleccionado}
            registrosDelDia={registrosDelDia}
            loading={loading}
            estadisticasDia={estadisticasDia}
            trabajadoresConRegistro={(() => {
              const estadistica = estadisticasMes.get(diaSeleccionado);
              return estadistica?.trabajadoresConRegistro || 0;
            })()}
            totalTrabajadores={trabajadoresActivos.length}
            porcentaje={(() => {
              const estadistica = estadisticasMes.get(diaSeleccionado);
              return estadistica?.porcentaje || 0;
            })()}
            filtroTipo={filtroTipo}
            mostrarEstadisticas={mostrarEstadisticas}
            sincronizandoHuellero={sincronizandoHuellero}
            onClose={cerrarModal}
            onNavigateToForm={navigateToForm}
            onNavigateToEditLote={navigateToEditLote}
            onSincronizarHuellero={sincronizarDesdeHuellero}
            onSetFiltroTipo={setFiltroTipo}
            onSetMostrarEstadisticas={setMostrarEstadisticas}
            onEditRegistro={(id) => {
              if (id > 0) {
                navigateToEdit(id);
              } else {
                alert('Para editar ausencias, ve a la sección de Ausencias');
              }
            }}
            onDeleteRegistro={eliminarRegistro}
          />
        )}
      </div>

      {/* CSS para animaciones */}
      <style>
        {`
          @keyframes slideInRight {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
};

export default RegistrosPage;