// pages/RegistrosPage.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { registrosService } from "../api/registrosService";
import { trabajadoresService } from "../api/trabajadoresService";
import type { Registro, RegistroConTipo } from "../types/registros";
import type { Trabajador } from "../types/trabajadores";
import { FiltrosRegistros } from "../components/registros/TablaRegistros/FiltrosRegistros";
import { TablaRegistros } from "../components/registros/TablaRegistros/TablaRegistros";
import { Paginacion } from "../components/registros/TablaRegistros/Paginacion";
import { TotalesRegistros } from "../components/registros/TablaRegistros/TotalesRegistros";
import { useExportExcel } from "../hooks/useExportExcel";

const RegistrosPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Estados de filtros
  const [añoSeleccionado, setAñoSeleccionado] = useState<number>(new Date().getFullYear());
  const [mesSeleccionado, setMesSeleccionado] = useState<number | null>(new Date().getMonth() + 1);
  const [diaSeleccionado, setDiaSeleccionado] = useState<number | null>(null);
  const [trabajadorSeleccionado, setTrabajadorSeleccionado] = useState<number | null>(null);

  // Estados de datos
  const [registros, setRegistros] = useState<RegistroConTipo[]>([]);
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [loading, setLoading] = useState(false);

  // Estados de paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 20;

  // Estados para mensajes de éxito
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successType, setSuccessType] = useState<string>('');

  const { exportando: exportandoExcel, exportarExcelMes } = useExportExcel();

  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  // Procesar registros y detectar ausencias
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

  // Cargar trabajadores activos
  useEffect(() => {
    const cargarTrabajadores = async () => {
      try {
        const todos = await trabajadoresService.getAll();
        const activos = todos.filter(t => t.estado === "Vigente");
        setTrabajadores(activos);
      } catch (error) {
        console.error("Error al cargar trabajadores:", error);
      }
    };

    cargarTrabajadores();
  }, []);

  // Cargar registros según filtros
  const cargarRegistros = useCallback(async () => {
  setLoading(true);
  try {
    let registrosCargados: Registro[] = [];

    if (mesSeleccionado) {
      // ✅ SIEMPRE cargar mes completo (trae extras calculadas)
      const response = await registrosService.obtenerRegistrosMesCompleto(añoSeleccionado, mesSeleccionado);
      registrosCargados = response.registros;
      
      // Filtrar por día en frontend si está seleccionado
      if (diaSeleccionado) {
        const fechaString = `${añoSeleccionado}-${mesSeleccionado.toString().padStart(2, '0')}-${diaSeleccionado.toString().padStart(2, '0')}`;
        registrosCargados = registrosCargados.filter(r => r.fecha === fechaString);
      }
    } else {
      // Año completo - 12 peticiones
      const mesesPromises = Array.from({ length: 12 }, (_, i) => 
        registrosService.obtenerRegistrosMesCompleto(añoSeleccionado, i + 1)
      );
      const mesesData = await Promise.all(mesesPromises);
      registrosCargados = mesesData.flatMap(m => m.registros);
    }

    // Filtrar por trabajador si está seleccionado
    if (trabajadorSeleccionado) {
      registrosCargados = registrosCargados.filter(r => r.trabajadorId === trabajadorSeleccionado);
    }

    // Procesar y ordenar
    const registrosConTipo = procesarRegistrosConTipo(registrosCargados);
    registrosConTipo.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

    setRegistros(registrosConTipo);
    setPaginaActual(1);
  } catch (error) {
    console.error("Error al cargar registros:", error);
    setRegistros([]);
  } finally {
    setLoading(false);
  }
}, [añoSeleccionado, mesSeleccionado, diaSeleccionado, trabajadorSeleccionado, procesarRegistrosConTipo]);

  // Cargar registros cuando cambian los filtros
  useEffect(() => {
    cargarRegistros();
  }, [cargarRegistros]);

  // Manejar mensajes de éxito
  useEffect(() => {
    const success = searchParams.get('success');
    if (success) {
      setSuccessType(success);
      setShowSuccessMessage(true);

      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('success');
      setSearchParams(newSearchParams, { replace: true });

      setTimeout(() => setShowSuccessMessage(false), 4000);

      // Recargar registros
      cargarRegistros();
    }
  }, [searchParams, setSearchParams, cargarRegistros]);

  // Handlers de navegación
  const handleNuevoRegistro = () => {
    const params = new URLSearchParams();
    if (diaSeleccionado && mesSeleccionado) {
      const fechaString = `${añoSeleccionado}-${mesSeleccionado.toString().padStart(2, '0')}-${diaSeleccionado.toString().padStart(2, '0')}`;
      params.set('fecha', fechaString);
    }
    params.set('return', '/registros');
    navigate(`/registros/nuevo?${params.toString()}`);
  };

  const handleRegistroLote = () => {
    const params = new URLSearchParams();
    if (diaSeleccionado && mesSeleccionado) {
      const fechaString = `${añoSeleccionado}-${mesSeleccionado.toString().padStart(2, '0')}-${diaSeleccionado.toString().padStart(2, '0')}`;
      params.set('fecha', fechaString);
    }
    params.set('return', '/registros');
    navigate(`/registros/lote?${params.toString()}`);
  };

  const handleExportarExcel = async () => {
    if (mesSeleccionado === null) {
      alert('Por favor selecciona un mes para exportar');
      return;
    }
    await exportarExcelMes(añoSeleccionado, mesSeleccionado, meses[mesSeleccionado - 1]);
  };

  const handleEditarRegistro = (id: number) => {
    if (id > 0) {
      const params = new URLSearchParams();
      params.set('return', '/registros');
      navigate(`/registros/editar/${id}?${params.toString()}`);
    } else {
      alert('Para editar ausencias, ve a la sección de Ausencias');
    }
  };

  const handleEliminarRegistro = async (id: number) => {
    if (id > 0) {
      // Es un registro normal
      if (confirm("¿Estás seguro de eliminar este registro?")) {
        try {
          await registrosService.eliminar(id);
          await cargarRegistros();
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
          const response = await fetch(`/api/ausencias/${ausenciaId}`, { method: 'DELETE' });
          if (!response.ok) {
            throw new Error('Error al eliminar ausencia');
          }
          await cargarRegistros();
          alert('Ausencia eliminada correctamente');
        } catch (error) {
          console.error('Error al eliminar ausencia:', error);
          alert('Error al eliminar la ausencia');
        }
      }
    }
  };

  // Calcular paginación
  const indiceInicio = (paginaActual - 1) * registrosPorPagina;
  const indiceFin = indiceInicio + registrosPorPagina;
  const registrosPaginados = registros.slice(indiceInicio, indiceFin);
  const totalPaginas = Math.ceil(registros.length / registrosPorPagina);

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
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
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
          marginBottom: '30px',
          color: 'white'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            marginBottom: '10px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            📊 Gestión Ejecutiva de Registros
          </h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>
            Vista profesional de todos los registros de trabajo y ausencias
          </p>
        </div>

        {/* Filtros */}
        <FiltrosRegistros
          añoSeleccionado={añoSeleccionado}
          mesSeleccionado={mesSeleccionado}
          diaSeleccionado={diaSeleccionado}
          trabajadorSeleccionado={trabajadorSeleccionado}
          trabajadores={trabajadores.map(t => ({
            id: t.id,
            nombreCompleto: t.nombre
          }))}
          onChangeAño={(año) => {
            setAñoSeleccionado(año);
            setDiaSeleccionado(null);
          }}
          onChangeMes={(mes) => {
            setMesSeleccionado(mes);
            setDiaSeleccionado(null);
          }}
          onChangeDia={setDiaSeleccionado}
          onChangeTrabajador={setTrabajadorSeleccionado}
          onNuevoRegistro={handleNuevoRegistro}
          onRegistroLote={handleRegistroLote}
          onExportarExcel={handleExportarExcel}
          exportandoExcel={exportandoExcel}
        />

        {/* Tabla de Registros */}
        <TablaRegistros
          registros={registrosPaginados}
          loading={loading}
          onEditarRegistro={handleEditarRegistro}
          onEliminarRegistro={handleEliminarRegistro}
        />

        {/* Paginación */}
        {!loading && registros.length > 0 && (
          <Paginacion
            paginaActual={paginaActual}
            totalPaginas={totalPaginas}
            registrosPorPagina={registrosPorPagina}
            totalRegistros={registros.length}
            onCambioPagina={setPaginaActual}
          />
        )}

        {/* Totales */}
        {!loading && registros.length > 0 && (
          <TotalesRegistros registros={registros} />
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