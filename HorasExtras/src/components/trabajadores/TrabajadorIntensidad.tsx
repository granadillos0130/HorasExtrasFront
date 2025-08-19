import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { registrosService } from "../../api/registrosService";
import { trabajadoresService } from "../../api/trabajadoresService";
import TrabajadorBuscador from "../shared/TrabajadorBuscador";
import type { Registro } from "../../types/registros";
import type { Trabajador } from "../../types/trabajadores";
import "../../styles/components/trabajador/TrabajadorIntensidad.css";

// Funciones helper para fechas
const formatDateForInput = (date: Date) => {
  return date.toISOString().split('T')[0];
};

const getStartOfWeek = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

const getEndOfWeek = (date: Date) => {
  const startOfWeek = getStartOfWeek(date);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  return endOfWeek;
};

const getCurrentWeekRange = () => {
  const today = new Date();
  return {
    inicio: getStartOfWeek(today),
    fin: getEndOfWeek(today)
  };
};

// ✅ NUEVA FUNCIÓN HELPER para fechas seguras
const formatFechaSafe = (fechaStr: string | null | undefined, options?: Intl.DateTimeFormatOptions): string => {
  if (!fechaStr) return 'N/A';
  
  // ✅ Agregar T00:00:00 para evitar problemas de zona horaria
  const fecha = new Date(fechaStr + 'T00:00:00');
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
  };
  
  return fecha.toLocaleDateString('es-CO', options || defaultOptions);
};

const TrabajadorIntensidad: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Estados
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [trabajadorSeleccionado, setTrabajadorSeleccionado] = useState<number>(0);
  const [trabajadorActual, setTrabajadorActual] = useState<Trabajador | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingRegistros, setLoadingRegistros] = useState(false);
  const [error, setError] = useState("");

  // Filtros de fecha
  const currentWeek = getCurrentWeekRange();
  const [fechaInicio, setFechaInicio] = useState<string>(formatDateForInput(currentWeek.inicio));
  const [fechaFin, setFechaFin] = useState<string>(formatDateForInput(currentWeek.fin));
  const [rangoPreseleccionado, setRangoPreseleccionado] = useState<string>("semana_actual");

  // Cargar trabajadores al inicio
  useEffect(() => {
    const cargarTrabajadores = async () => {
      try {
        setLoading(true);
        const data = await trabajadoresService.getAll();
        setTrabajadores(data);
        
        if (id) {
          const trabajadorId = Number(id);
          setTrabajadorSeleccionado(trabajadorId);
          const trabajador = data.find(t => t.id === trabajadorId);
          if (trabajador) {
            setTrabajadorActual(trabajador);
            await cargarRegistros(trabajadorId, fechaInicio, fechaFin);
          }
        }
      } catch (error) {
        setError("Error cargando trabajadores.");
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarTrabajadores();
  }, [id, fechaInicio, fechaFin]);

  // Cargar registros cuando cambien las fechas
  useEffect(() => {
    if (trabajadorSeleccionado > 0) {
      cargarRegistros(trabajadorSeleccionado, fechaInicio, fechaFin);
    }
  }, [fechaInicio, fechaFin, trabajadorSeleccionado]);

  const cargarRegistros = async (trabajadorId: number, inicio: string, fin: string) => {
    try {
      setLoadingRegistros(true);
      setError("");
      const data = await registrosService.buscarPorTrabajadorRangoFechas(
        trabajadorId,
        inicio,
        fin
      );
      setRegistros(data);
    } catch (error) {
      setError("Error cargando la intensidad horaria.");
      setRegistros([]);
    } finally {
      setLoadingRegistros(false);
    }
  };

  const exportarExcel = async () => {
    if (!trabajadorActual || registros.length === 0) return;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Intensidad Horaria");

    // Configurar propiedades del documento
    workbook.creator = "Sistema de Horas Extras";
    workbook.lastModifiedBy = "Sistema de Horas Extras";
    workbook.created = new Date();
    workbook.modified = new Date();

    // Configurar ancho de columnas
    worksheet.columns = [
      { width: 12 }, // Fecha
      { width: 10 }, // Día
      { width: 25 }, // Centro (aumentado para nombres completos)
      { width: 10 }, // Ingreso
      { width: 10 }, // Salida
      { width: 10 }, // Almuerzo
      { width: 12 }, // H. Normales
      { width: 12 }, // Ex. Diurnas
      { width: 12 }, // Ex. Nocturnas
      { width: 12 }, // Dom. Diurnas
      { width: 12 }, // Dom. Nocturnas
      { width: 12 }, // Total
    ];

    // Agregar título principal
    worksheet.mergeCells('A1:L1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = '⏰ INTENSIDAD HORARIA DEL TRABAJADOR';
    titleCell.font = { 
      size: 18, 
      bold: true, 
      color: { argb: 'FFFFFFFF' } 
    };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF228B22' },
    };
    titleCell.alignment = { 
      horizontal: 'center', 
      vertical: 'middle' 
    };
    titleCell.border = {
      top: { style: 'thick', color: { argb: 'FF32CD32' } },
      bottom: { style: 'thick', color: { argb: 'FF32CD32' } },
      left: { style: 'thick', color: { argb: 'FF32CD32' } },
      right: { style: 'thick', color: { argb: 'FF32CD32' } },
    };

    // Información del trabajador
    worksheet.mergeCells('A3:L3');
    const trabajadorCell = worksheet.getCell('A3');
    trabajadorCell.value = `Trabajador: ${trabajadorActual.nombre} | CC: ${trabajadorActual.cedula} | ID: ${trabajadorActual.id}`;
    trabajadorCell.font = { 
      size: 14, 
      bold: true, 
      color: { argb: 'FF228B22' } 
    };
    trabajadorCell.alignment = { horizontal: 'center' };

    worksheet.mergeCells('A4:L4');
    const periodoCell = worksheet.getCell('A4');
    periodoCell.value = `Período: ${formatFechaLegible(fechaInicio)} - ${formatFechaLegible(fechaFin)} | Total registros: ${registros.length}`;
    periodoCell.font = { 
      size: 12, 
      italic: true, 
      color: { argb: 'FF666666' } 
    };
    periodoCell.alignment = { horizontal: 'center' };

    // Agregar centros visitados
    const centrosVisitados = getCentrosVisitados();
    if (centrosVisitados.length > 0) {
      worksheet.mergeCells('A5:L5');
      const centrosCell = worksheet.getCell('A5');
      centrosCell.value = `Centros visitados: ${centrosVisitados.join(', ')}`;
      centrosCell.font = { 
        size: 11, 
        color: { argb: 'FF4A5568' } 
      };
      centrosCell.alignment = { horizontal: 'center' };
    }

    // Agregar fecha de generación
    worksheet.mergeCells('A6:L6');
    const fechaCell = worksheet.getCell('A6');
    fechaCell.value = `Generado el: ${new Date().toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`;
    fechaCell.font = { 
      size: 10, 
      color: { argb: 'FF666666' } 
    };
    fechaCell.alignment = { horizontal: 'center' };

    // Espacio antes de la tabla
    const startRow = 8;

    // Encabezados de la tabla
    const headers = [
      "Fecha",
      "Día",
      "Centro",
      "Ingreso",
      "Salida",
      "Almuerzo",
      "H. Normales",
      "Ex. Diurnas",
      "Ex. Nocturnas",
      "Dom. Diurnas",
      "Dom. Nocturnas",
      "Total Horas",
    ];

    // Agregar encabezados
    worksheet.insertRow(startRow, headers);

    // Estilos de encabezado
    const headerRow = worksheet.getRow(startRow);
    headerRow.height = 25;
    headerRow.eachCell((cell) => {
      cell.font = { 
        bold: true, 
        color: { argb: 'FFFFFFFF' },
        size: 12
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF32CD32' },
      };
      cell.alignment = { 
        horizontal: 'center', 
        vertical: 'middle' 
      };
      cell.border = {
        top: { style: 'medium', color: { argb: 'FF228B22' } },
        bottom: { style: 'medium', color: { argb: 'FF228B22' } },
        left: { style: 'thin', color: { argb: 'FF228B22' } },
        right: { style: 'thin', color: { argb: 'FF228B22' } },
      };
    });

    // Agregar datos de registros
    registros.forEach((registro, index) => {
      const rowData = [
        formatFechaSafe(registro.fecha, { day: '2-digit', month: '2-digit', year: 'numeric' }),
        registro.diaSemana?.substring(0, 3) || 'N/A',
        registro.nombreCentro || 'Sin centro', // Nombre completo del centro
        registro.horaIngreso || 'N/A',
        registro.horaSalida || 'N/A',
        registro.tiempoAlmuerzo || 'N/A',
        registro.horasNormales || 0,
        registro.horasExtrasDiurnas || 0,
        registro.horasExtrasNocturnas || 0,
        registro.extrasDominicalesDiurnas || 0,
        registro.extrasDominicalesNocturnas || 0,
        registro.totalHoras || 0,
      ];
      
      const currentRow = startRow + 1 + index;
      worksheet.insertRow(currentRow, rowData);
      
      // Estilo para filas de datos
      const dataRow = worksheet.getRow(currentRow);
      dataRow.height = 20;
      
      dataRow.eachCell((cell, colNumber) => {
        cell.alignment = { 
          horizontal: colNumber <= 3 ? 'left' : 'center', 
          vertical: 'middle' 
        };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
          bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
          left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
          right: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        };
        
        // Colores alternos para las filas
        if (index % 2 === 0) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF8FFF8' },
          };
        }
        
        // Formato para números (horas)
        if (colNumber > 6) {
          cell.font = { 
            size: 11,
            color: { argb: 'FF333333' }
          };
          if (typeof cell.value === 'number' && cell.value > 0) {
            cell.numFmt = '#,##0.00';
          }
        } else {
          cell.font = { 
            size: 11,
            color: { argb: 'FF333333' }
          };
        }
      });
    });

    // Calcular totales
    const resumen = getResumenHoras();

    // Agregar fila de totales
    const totalRow = startRow + 1 + registros.length;
    const totales = [
      'TOTALES',
      '',
      '',
      '',
      '',
      '',
      resumen.normales,
      resumen.extrasDiurnas,
      resumen.extrasNocturnas,
      resumen.domDiurnas,
      resumen.domNocturnas,
      resumen.total,
    ];
    
    worksheet.insertRow(totalRow, totales);
    const totalRowObj = worksheet.getRow(totalRow);
    totalRowObj.height = 25;
    totalRowObj.eachCell((cell, colNumber) => {
      cell.font = { 
        bold: true, 
        color: { argb: 'FFFFFFFF' },
        size: 12
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF228B22' },
      };
      cell.alignment = { 
        horizontal: 'center', 
        vertical: 'middle' 
      };
      cell.border = {
        top: { style: 'medium', color: { argb: 'FF006400' } },
        bottom: { style: 'medium', color: { argb: 'FF006400' } },
        left: { style: 'thin', color: { argb: 'FF006400' } },
        right: { style: 'thin', color: { argb: 'FF006400' } },
      };
      
      if (colNumber > 6 && typeof cell.value === 'number') {
        cell.numFmt = '#,##0.00';
      }
    });

    // Agregar pie de página
    const footerRow = totalRow + 2;
    worksheet.mergeCells(`A${footerRow}:L${footerRow}`);
    const footerCell = worksheet.getCell(`A${footerRow}`);
    footerCell.value = '© Sistema de Gestión de Horas Extras - Reporte de Intensidad Horaria';
    footerCell.font = { 
      size: 9, 
      italic: true, 
      color: { argb: 'FF888888' } 
    };
    footerCell.alignment = { horizontal: 'center' };

    // Configurar vista de impresión
    worksheet.pageSetup = {
      orientation: 'landscape',
      paperSize: 9,
      fitToPage: true,
      fitToHeight: 1,
      fitToWidth: 1,
      margins: {
        left: 0.7,
        right: 0.7,
        top: 0.75,
        bottom: 0.75,
        header: 0.3,
        footer: 0.3,
      },
    };

    // Configurar encabezado y pie de página de impresión
    worksheet.headerFooter.oddHeader = '&C&16&B⏰ INTENSIDAD HORARIA';
    worksheet.headerFooter.oddFooter = '&L&D &T&C&P de &N&R© Sistema de Gestión';

    // Generar y descargar el archivo
    const buffer = await workbook.xlsx.writeBuffer();
    const fecha = new Date().toISOString().split('T')[0];
    const nombreArchivo = `Intensidad_${trabajadorActual.nombre.replace(/\s+/g, '_')}_${fecha}.xlsx`;
    saveAs(new Blob([buffer]), nombreArchivo);
  };

  const handleTrabajadorChange = (trabajadorId: number, trabajador?: Trabajador) => {
    setTrabajadorSeleccionado(trabajadorId);
    setTrabajadorActual(trabajador || null);
    
    if (trabajadorId > 0) {
      navigate(`/trabajadores/${trabajadorId}/intensidad`, { replace: true });
    } else {
      setRegistros([]);
    }
  };

  const handleRangoPreseleccionado = (rango: string) => {
    setRangoPreseleccionado(rango);
    const today = new Date();
    
    switch (rango) {
      case "hoy": {
        setFechaInicio(formatDateForInput(today));
        setFechaFin(formatDateForInput(today));
        break;
      }
      case "ayer": {
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        setFechaInicio(formatDateForInput(yesterday));
        setFechaFin(formatDateForInput(yesterday));
        break;
      }
      case "semana_actual": {
        const thisWeek = getCurrentWeekRange();
        setFechaInicio(formatDateForInput(thisWeek.inicio));
        setFechaFin(formatDateForInput(thisWeek.fin));
        break;
      }
      case "semana_pasada": {
        const lastWeekEnd = new Date(getStartOfWeek(today));
        lastWeekEnd.setDate(lastWeekEnd.getDate() - 1);
        const lastWeekStart = getStartOfWeek(lastWeekEnd);
        setFechaInicio(formatDateForInput(lastWeekStart));
        setFechaFin(formatDateForInput(lastWeekEnd));
        break;
      }
      case "mes_actual": {
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        setFechaInicio(formatDateForInput(firstDayOfMonth));
        setFechaFin(formatDateForInput(lastDayOfMonth));
        break;
      }
      case "mes_pasado": {
        const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        setFechaInicio(formatDateForInput(firstDayLastMonth));
        setFechaFin(formatDateForInput(lastDayLastMonth));
        break;
      }
      case "personalizado":
        break;
      default:
        break;
    }
  };

  const formatHours = (hours: number) => {
    if (hours === 0) return "0:00";
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}:${m.toString().padStart(2, "0")}`;
  };

  const getResumenHoras = () => {
    const totales = registros.reduce(
      (acc, registro) => ({
        normales: acc.normales + (registro.horasNormales || 0),
        extrasDiurnas: acc.extrasDiurnas + (registro.horasExtrasDiurnas || 0),
        extrasNocturnas: acc.extrasNocturnas + (registro.horasExtrasNocturnas || 0),
        domDiurnas: acc.domDiurnas + (registro.extrasDominicalesDiurnas || 0),
        domNocturnas: acc.domNocturnas + (registro.extrasDominicalesNocturnas || 0),
        total: acc.total + (registro.totalHoras || 0),
      }),
      { normales: 0, extrasDiurnas: 0, extrasNocturnas: 0, domDiurnas: 0, domNocturnas: 0, total: 0 }
    );
    return totales;
  };

  const formatFechaLegible = (fechaStr: string) => {
    const fecha = new Date(fechaStr + 'T00:00:00');
    return fecha.toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRangoFechasTexto = () => {
    if (fechaInicio === fechaFin) {
      return formatFechaLegible(fechaInicio);
    }
    return `${formatFechaLegible(fechaInicio)} - ${formatFechaLegible(fechaFin)}`;
  };

  const safeSubstring = (str: string | null | undefined, start: number, end?: number): string => {
    if (!str) return '';
    return str.substring(start, end);
  };

  // ✅ FUNCIÓN MEJORADA PARA MOSTRAR NOMBRES COMPLETOS DE CENTROS
  const formatCentroName = (nombreCentro: string | null | undefined): string => {
    const nombre = nombreCentro || 'Sin centro';
    return nombre; // Mostrar nombre completo sin limitaciones
  };

  // ✅ NUEVA FUNCIÓN PARA OBTENER CENTROS VISITADOS
  const getCentrosVisitados = () => {
    const centrosUnicos = [...new Set(
      registros
        .filter(r => r.nombreCentro && r.nombreCentro !== 'Sin centro')
        .map(r => r.nombreCentro)
    )];
    return centrosUnicos;
  };

  const getDiasEnRango = () => {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const diffTime = Math.abs(fin.getTime() - inicio.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const resumen = getResumenHoras();

  if (loading) {
    return (
      <div className="trabajador-intensidad-page">
        <div className="page-container">
          <div className="loading-state">
            <div className="loading-spinner-large"></div>
            <h3>Cargando información...</h3>
            <p>Por favor espere un momento</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="trabajador-intensidad-page">
      <div className="page-container">
        <div className="page-header">
          <button 
            className="btn-back"
            onClick={() => navigate("/trabajadores")}
          >
            ← Volver a Trabajadores
          </button>
          <h1>Intensidad Horaria por Trabajador</h1>
          <p className="page-subtitle">
            Consulta detallada de las horas trabajadas por período
          </p>
        </div>

        <div className="filters-card">
          <div className="filters-header">
            <div className="filters-icon">📊</div>
            <h2>Filtros de Búsqueda</h2>
          </div>

          <div className="filters-form">
            <TrabajadorBuscador
              trabajadores={trabajadores}
              value={trabajadorSeleccionado}
              onChange={handleTrabajadorChange}
              placeholder="Buscar trabajador por nombre o cédula..."
              label="Seleccionar Trabajador"
              required
              showSelectedInfo={true}
            />

            {/* Selector de rango rápido */}
            <div className="form-group">
              <label className="form-label">Período de Consulta</label>
              <div className="range-selector">
                <div className="range-buttons">
                  <button
                    className={`range-btn ${rangoPreseleccionado === 'hoy' ? 'active' : ''}`}
                    onClick={() => handleRangoPreseleccionado('hoy')}
                  >
                    📅 Hoy
                  </button>
                  <button
                    className={`range-btn ${rangoPreseleccionado === 'ayer' ? 'active' : ''}`}
                    onClick={() => handleRangoPreseleccionado('ayer')}
                  >
                    ⏮️ Ayer
                  </button>
                  <button
                    className={`range-btn ${rangoPreseleccionado === 'semana_actual' ? 'active' : ''}`}
                    onClick={() => handleRangoPreseleccionado('semana_actual')}
                  >
                    📝 Esta Semana
                  </button>
                  <button
                    className={`range-btn ${rangoPreseleccionado === 'semana_pasada' ? 'active' : ''}`}
                    onClick={() => handleRangoPreseleccionado('semana_pasada')}
                  >
                    📄 Semana Pasada
                  </button>
                  <button
                    className={`range-btn ${rangoPreseleccionado === 'mes_actual' ? 'active' : ''}`}
                    onClick={() => handleRangoPreseleccionado('mes_actual')}
                  >
                    📊 Este Mes
                  </button>
                  <button
                    className={`range-btn ${rangoPreseleccionado === 'mes_pasado' ? 'active' : ''}`}
                    onClick={() => handleRangoPreseleccionado('mes_pasado')}
                  >
                    📈 Mes Pasado
                  </button>
                  <button
                    className={`range-btn ${rangoPreseleccionado === 'personalizado' ? 'active' : ''}`}
                    onClick={() => handleRangoPreseleccionado('personalizado')}
                  >
                    🎯 Personalizado
                  </button>
                </div>
              </div>
            </div>

            {/* Selectores de fecha personalizados */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Fecha de Inicio</label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => {
                    setFechaInicio(e.target.value);
                    setRangoPreseleccionado('personalizado');
                  }}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Fecha de Fin</label>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => {
                    setFechaFin(e.target.value);
                    setRangoPreseleccionado('personalizado');
                  }}
                  className="form-input"
                  min={fechaInicio}
                />
              </div>
            </div>

            {/* Información del rango seleccionado */}
            <div className="range-info">
              <div className="range-info-item">
                <span className="range-info-icon">📅</span>
                <span className="range-info-text">
                  <strong>Período:</strong> {getRangoFechasTexto()}
                </span>
              </div>
              <div className="range-info-item">
                <span className="range-info-icon">📊</span>
                <span className="range-info-text">
                  <strong>Días en rango:</strong> {getDiasEnRango()} día{getDiasEnRango() !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        </div>

        {trabajadorActual && (
          <div className="worker-info-card">
            <div className="worker-avatar-large">
              {trabajadorActual.nombre
                ?.split(' ')
                .map(word => word?.[0] || '')
                .join('')
                .toUpperCase()
                .substring(0, 2) || 'N/A'}
            </div>
            <div className="worker-details">
              <h3>{trabajadorActual.nombre}</h3>
              <div className="worker-meta">
                <span>CC: {trabajadorActual.cedula}</span>
                <span>ID: {trabajadorActual.id}</span>
                <span>{getRangoFechasTexto()}</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}

        {loadingRegistros && (
          <div className="loading-message">
            🔄 Cargando registros de intensidad horaria...
          </div>
        )}

        {trabajadorSeleccionado > 0 && !loadingRegistros && (
          <>
            {registros.length > 0 ? (
              <>
                {/* Resumen de horas */}
                <div className="resumen-card">
                  <div className="resumen-header">
                    <h3>Resumen de Horas</h3>
                    <div className="resumen-actions">
                      <div className="total-badge">
                        Total: {formatHours(resumen.total)}
                      </div>
                      <button 
                        className="btn-exportar" 
                        onClick={exportarExcel}
                        title="Exportar a Excel"
                      >
                        📤 Exportar Excel
                      </button>
                    </div>
                  </div>
                  
                  <div className="resumen-grid">
                    <div className="resumen-item normal">
                      <div className="resumen-icon">⏰</div>
                      <div className="resumen-content">
                        <div className="resumen-number">{formatHours(resumen.normales)}</div>
                        <div className="resumen-label">Horas Normales</div>
                      </div>
                    </div>
                    
                    <div className="resumen-item extra-diurna">
                      <div className="resumen-icon">☀️</div>
                      <div className="resumen-content">
                        <div className="resumen-number">{formatHours(resumen.extrasDiurnas)}</div>
                        <div className="resumen-label">Extras Diurnas</div>
                      </div>
                    </div>
                    
                    <div className="resumen-item extra-nocturna">
                      <div className="resumen-icon">🌙</div>
                      <div className="resumen-content">
                        <div className="resumen-number">{formatHours(resumen.extrasNocturnas)}</div>
                        <div className="resumen-label">Extras Nocturnas</div>
                      </div>
                    </div>
                    
                    <div className="resumen-item dom-diurna">
                      <div className="resumen-icon">🌅</div>
                      <div className="resumen-content">
                        <div className="resumen-number">{formatHours(resumen.domDiurnas)}</div>
                        <div className="resumen-label">Dom. Diurnas</div>
                      </div>
                    </div>
                    
                    <div className="resumen-item dom-nocturna">
                      <div className="resumen-icon">🌃</div>
                      <div className="resumen-content">
                        <div className="resumen-number">{formatHours(resumen.domNocturnas)}</div>
                        <div className="resumen-label">Dom. Nocturnas</div>
                      </div>
                    </div>
                  </div>

                  {/* Información adicional del período */}
                  <div className="period-summary">
                    <div className="period-item">
                      <span className="period-icon">📊</span>
                      <span>Promedio diario: {formatHours(resumen.total / getDiasEnRango())}</span>
                    </div>
                    <div className="period-item">
                      <span className="period-icon">📈</span>
                      <span>{registros.length} día{registros.length !== 1 ? 's' : ''} con registro</span>
                    </div>
                  </div>
                </div>

                {/* ✅ NUEVA SECCIÓN: Centros visitados */}
                {getCentrosVisitados().length > 0 && (
                  <div className="centros-visitados-card">
                    <div className="centros-header">
                      <div className="centros-icon">🏢</div>
                      <h3>Centros visitados en este período</h3>
                    </div>
                    <div className="centros-lista">
                      {getCentrosVisitados().map((centro, index) => (
                        <span key={index} className="centro-badge">
                          {centro}
                        </span>
                      ))}
                    </div>
                    <div className="centros-stats">
                      <span className="centros-count">
                        {getCentrosVisitados().length} centro{getCentrosVisitados().length !== 1 ? 's' : ''} diferente{getCentrosVisitados().length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                )}

                {/* Tabla de registros detallados */}
                <div className="registros-card">
                  <div className="registros-header">
                    <div className="registros-title">
                      <div className="registros-icon">📋</div>
                      <h3>Registros Detallados</h3>
                    </div>
                    <div className="registros-count">
                      {registros.length} registro{registros.length !== 1 ? 's' : ''}
                    </div>
                  </div>

                  <div className="table-container">
                    <div className="table-wrapper">
                      <table className="intensidad-table">
                        <thead>
                          <tr>
                            <th>Fecha</th>
                            <th>Día</th>
                            <th>Centro</th>
                            <th>Ingreso</th>
                            <th>Salida</th>
                            <th>Almuerzo</th>
                            <th>H. Normales</th>
                            <th>Ex. Diurnas</th>
                            <th>Ex. Nocturnas</th>
                            <th>Dom. Diurnas</th>
                            <th>Dom. Nocturnas</th>
                            <th>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {registros.map((registro, index) => (
                            <tr key={registro.id} style={{ animationDelay: `${index * 0.05}s` }}>
                              <td className="col-fecha">
                                {formatFechaSafe(registro.fecha)}
                              </td>
                              <td className="col-dia">
                                {safeSubstring(registro.diaSemana, 0, 3) || 'N/A'}
                              </td>
                              <td className="col-centro" title={registro.nombreCentro || 'Sin centro'}>
                                {formatCentroName(registro.nombreCentro)}
                              </td>
                              <td className="col-hora">
                                {safeSubstring(registro.horaIngreso, 0, 5) || 'N/A'}
                              </td>
                              <td className="col-hora">
                                {safeSubstring(registro.horaSalida, 0, 5) || 'N/A'}
                              </td>
                              <td className="col-hora">
                                {safeSubstring(registro.tiempoAlmuerzo, 0, 5) || 'N/A'}
                              </td>
                              <td className="col-horas normal">
                                <span className="hours-badge normal">
                                  {formatHours(registro.horasNormales || 0)}
                                </span>
                              </td>
                              <td className="col-horas extra-diurna">
                                <span className="hours-badge extra-diurna">
                                  {formatHours(registro.horasExtrasDiurnas || 0)}
                                </span>
                              </td>
                              <td className="col-horas extra-nocturna">
                                <span className="hours-badge extra-nocturna">
                                  {formatHours(registro.horasExtrasNocturnas || 0)}
                                </span>
                              </td>
                              <td className="col-horas dom-diurna">
                                <span className="hours-badge dom-diurna">
                                  {formatHours(registro.extrasDominicalesDiurnas || 0)}
                                </span>
                              </td>
                              <td className="col-horas dom-nocturna">
                                <span className="hours-badge dom-nocturna">
                                  {formatHours(registro.extrasDominicalesNocturnas || 0)}
                                </span>
                              </td>
                              <td className="col-horas total">
                                <span className="hours-badge total">
                                  {formatHours(registro.totalHoras || 0)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="scroll-indicator">
                      💡 Desliza horizontalmente para ver todas las columnas
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">📊</div>
                <h3>No hay registros</h3>
                <p>
                  No se encontraron registros para {trabajadorActual?.nombre || 'este trabajador'} 
                  en el período seleccionado.
                </p>
                <div className="empty-state-suggestions">
                  <p>Prueba con:</p>
                  <ul>
                    <li>Un rango de fechas diferente</li>
                    <li>Verificar períodos anteriores</li>
                    <li>Asegurarte de que existan registros para este trabajador</li>
                  </ul>
                </div>
              </div>
            )}
          </>
        )}

        {trabajadorSeleccionado === 0 && !loading && (
          <div className="empty-state">
            <div className="empty-state-icon">👤</div>
            <h3>Selecciona un trabajador</h3>
            <p>
              Utiliza el buscador de arriba para seleccionar un trabajador y ver 
              su intensidad horaria en el período deseado.
            </p>
            <div className="empty-state-features">
              <div className="feature-item">
                <span className="feature-icon">🔍</span>
                <span>Busca por nombre o cédula</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📅</span>
                <span>Selecciona período personalizado</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📊</span>
                <span>Ve resumen y detalle de horas</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">⚡</span>
                <span>Rangos rápidos disponibles</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrabajadorIntensidad;