/* eslint-disable @typescript-eslint/no-explicit-any */
// pages/IntensidadConsolidadaPage.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIntensidadConsolidada } from '../hooks/trabajadores/useIntensidadConsolidada';
import { FiltrosConsolidada } from '../components/intensidad-consolidada/FiltrosConsolidada';
import { TablaConsolidada } from '../components/intensidad-consolidada/TablaConsolidada';
import { PaginacionConsolidada } from '../components/intensidad-consolidada/PaginacionConsolidada';
import { TotalesGenerales } from '../components/intensidad-consolidada/TotalesGenerales';
import { formatDateForInput, getCurrentWeekRange } from '../utils/trabajadores/fechaUtils';
import * as XLSX from 'xlsx';

const IntensidadConsolidadaPage: React.FC = () => {
  const navigate = useNavigate();

  // ===== ESTADOS DE FILTROS =====
  const currentWeek = getCurrentWeekRange();
  const [fechaInicio, setFechaInicio] = useState<string>(formatDateForInput(currentWeek.inicio));
  const [fechaFin, setFechaFin] = useState<string>(formatDateForInput(currentWeek.fin));
  const [rangoPreseleccionado, setRangoPreseleccionado] = useState<string>('semana_actual');
  const [busqueda, setBusqueda] = useState<string>('');
  const [estadoFiltro, setEstadoFiltro] = useState<string>('todos');

  // ===== ESTADOS DE PAGINACIÓN =====
  const [paginaActual, setPaginaActual] = useState<number>(1);
  const [itemsPorPagina, setItemsPorPagina] = useState<number>(25);

  // ===== HOOK DE DATOS =====
  const {
    trabajadores,
    totalesGenerales,
    loading,
    error,
    diasEnRango,
  } = useIntensidadConsolidada(
    fechaInicio,
    fechaFin,
    estadoFiltro,
    busqueda
  );

  // ===== HANDLERS DE FILTROS =====
  const handleRangoPreseleccionado = (rango: string) => {
    setRangoPreseleccionado(rango);
    const today = new Date();

    switch (rango) {
      case 'hoy': {
        setFechaInicio(formatDateForInput(today));
        setFechaFin(formatDateForInput(today));
        break;
      }
      case 'ayer': {
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        setFechaInicio(formatDateForInput(yesterday));
        setFechaFin(formatDateForInput(yesterday));
        break;
      }
      case 'semana_actual': {
        const thisWeek = getCurrentWeekRange();
        setFechaInicio(formatDateForInput(thisWeek.inicio));
        setFechaFin(formatDateForInput(thisWeek.fin));
        break;
      }
      case 'semana_pasada': {
        const lastWeekEnd = new Date(today);
        lastWeekEnd.setDate(today.getDate() - today.getDay() - 1);
        const lastWeekStart = new Date(lastWeekEnd);
        lastWeekStart.setDate(lastWeekEnd.getDate() - 6);
        setFechaInicio(formatDateForInput(lastWeekStart));
        setFechaFin(formatDateForInput(lastWeekEnd));
        break;
      }
      case 'mes_actual': {
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        setFechaInicio(formatDateForInput(firstDayOfMonth));
        setFechaFin(formatDateForInput(lastDayOfMonth));
        break;
      }
      case 'mes_pasado': {
        const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        setFechaInicio(formatDateForInput(firstDayLastMonth));
        setFechaFin(formatDateForInput(lastDayLastMonth));
        break;
      }
      case 'personalizado':
        break;
      default:
        break;
    }
  };

  const handleExportarExcel = () => {
    if (trabajadores.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    try {
      // Preparar datos para Excel
      const datosExcel = trabajadores.map(t => ({
        'TRABAJADOR': t.nombre,
        'CÉDULA': t.cedula,
        'ESTADO': t.estado,
        'DÍAS REGISTRADOS': t.diasRegistrados,
        'CENTROS ÚNICOS': t.centrosUnicos,
        'HORAS NORMALES': t.totales.horasNormales.toFixed(2),
        'EXTRAS DIURNAS': t.totales.horasExtrasDiurnas.toFixed(2),
        'EXTRAS NOCTURNAS': t.totales.horasExtrasNocturnas.toFixed(2),
        'DOM. DIURNAS': t.totales.extrasDominicalesDiurnas.toFixed(2),
        'DOM. NOCTURNAS': t.totales.extrasDominicalesNocturnas.toFixed(2),
        'TOTAL HORAS': t.totales.totalHoras.toFixed(2),
      }));

      // Agregar fila de totales
      if (totalesGenerales) {
        datosExcel.push({
          'TRABAJADOR': 'TOTALES GENERALES',
          'CÉDULA': '',
          'ESTADO': '',
          'DÍAS REGISTRADOS': '' as any,
          'CENTROS ÚNICOS': '' as any,
          'HORAS NORMALES': totalesGenerales.horasNormales.toFixed(2),
          'EXTRAS DIURNAS': totalesGenerales.horasExtrasDiurnas.toFixed(2),
          'EXTRAS NOCTURNAS': totalesGenerales.horasExtrasNocturnas.toFixed(2),
          'DOM. DIURNAS': totalesGenerales.extrasDominicalesDiurnas.toFixed(2),
          'DOM. NOCTURNAS': totalesGenerales.extrasDominicalesNocturnas.toFixed(2),
          'TOTAL HORAS': totalesGenerales.totalHoras.toFixed(2),
        });
      }

      // Crear workbook y worksheet
      const ws = XLSX.utils.json_to_sheet(datosExcel);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Intensidad Consolidada');

      // Configurar anchos de columna
      const columnWidths = [
        { wch: 30 }, // TRABAJADOR
        { wch: 15 }, // CÉDULA
        { wch: 12 }, // ESTADO
        { wch: 12 }, // DÍAS REG.
        { wch: 12 }, // CENTROS
        { wch: 15 }, // H. NORMALES
        { wch: 15 }, // EX. DIURNAS
        { wch: 15 }, // EX. NOCTURNAS
        { wch: 15 }, // DOM. DIURNAS
        { wch: 15 }, // DOM. NOCTURNAS
        { wch: 15 }, // TOTAL
      ];
      ws['!cols'] = columnWidths;

      // Descargar archivo
      const nombreArchivo = `Intensidad_Consolidada_${fechaInicio}_${fechaFin}.xlsx`;
      XLSX.writeFile(wb, nombreArchivo);
    } catch (error) {
      console.error('Error al exportar Excel:', error);
      alert('Error al generar el archivo Excel');
    }
  };

  const handleVerDetalle = (trabajadorId: number) => {
    navigate(`/trabajadores/${trabajadorId}/intensidad`);
  };

  // ===== FILTRADO LOCAL (ya viene filtrado del backend, pero por si acaso) =====
  const trabajadoresFiltrados = useMemo(() => {
    return trabajadores; // Ya viene filtrado del backend
  }, [trabajadores]);

  // ===== PAGINACIÓN =====
  const totalPaginas = Math.ceil(trabajadoresFiltrados.length / itemsPorPagina);
  const trabajadoresPaginados = trabajadoresFiltrados.slice(
    (paginaActual - 1) * itemsPorPagina,
    paginaActual * itemsPorPagina
  );

  // ===== EFFECTS =====
  // Reset página cuando cambian filtros
  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, estadoFiltro, fechaInicio, fechaFin]);

  // ===== RENDER =====
  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          marginBottom: '30px'
        }}>
          <button
            onClick={() => navigate('/trabajadores')}
            style={{
              background: 'white',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              padding: '8px 16px',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#475569',
              cursor: 'pointer',
              marginBottom: '15px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f8fafc';
              e.currentTarget.style.borderColor = '#94a3b8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.borderColor = '#cbd5e1';
            }}
          >
            ← Volver a Trabajadores
          </button>

          <h1 style={{
            fontSize: '1.8rem',
            color: '#1e293b',
            marginBottom: '8px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            INTENSIDAD HORARIA CONSOLIDADA
          </h1>
          <p style={{
            fontSize: '1.1rem',
            color: '#64748b',
            margin: 0,
            fontWeight: '500'
          }}>
            Reporte consolidado de horas trabajadas por todos los trabajadores
          </p>
        </div>

        {/* Filtros */}
        <FiltrosConsolidada
          fechaInicio={fechaInicio}
          fechaFin={fechaFin}
          onFechaInicioChange={(fecha) => {
            setFechaInicio(fecha);
            setRangoPreseleccionado('personalizado');
          }}
          onFechaFinChange={(fecha) => {
            setFechaFin(fecha);
            setRangoPreseleccionado('personalizado');
          }}
          rangoPreseleccionado={rangoPreseleccionado}
          onRangoPreseleccionado={handleRangoPreseleccionado}
          busqueda={busqueda}
          onBusquedaChange={setBusqueda}
          estadoFiltro={estadoFiltro}
          onEstadoChange={setEstadoFiltro}
          onExportarExcel={handleExportarExcel}
          deshabilitarExportar={trabajadores.length === 0 || loading}
        />

        {/* Error */}
        {error && (
          <div style={{
            background: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: '8px',
            padding: '15px 20px',
            marginBottom: '25px',
            color: '#991b1b',
            fontSize: '0.95rem',
            fontWeight: '500'
          }}>
            Error: {error}
          </div>
        )}

        {/* Tabla */}
        <TablaConsolidada
          trabajadores={trabajadoresPaginados}
          loading={loading}
          onVerDetalle={handleVerDetalle}
        />

        {/* Paginación */}
        {!loading && trabajadoresFiltrados.length > 0 && (
          <PaginacionConsolidada
            paginaActual={paginaActual}
            totalPaginas={totalPaginas}
            itemsPorPagina={itemsPorPagina}
            totalItems={trabajadoresFiltrados.length}
            onCambioPagina={setPaginaActual}
            onCambioItemsPorPagina={(items) => {
              setItemsPorPagina(items);
              setPaginaActual(1);
            }}
          />
        )}

        {/* Totales Generales */}
        {!loading && totalesGenerales && trabajadoresFiltrados.length > 0 && (
          <TotalesGenerales
            totales={totalesGenerales}
            diasEnRango={diasEnRango}
          />
        )}
      </div>
    </div>
  );
};

export default IntensidadConsolidadaPage;