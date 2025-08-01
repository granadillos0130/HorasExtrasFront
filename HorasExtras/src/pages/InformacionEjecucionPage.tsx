import React, { useState, useEffect } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { centrosService } from "../api/centrosService";
import type { 
  MesConActividad, 
  EstadisticasMes, 
  TrabajadoresPorTipoHora, 
  TipoHora 
} from "../types/centros";

interface Props {
  centroId: string;
  centroNombre: string;
  onVolver: () => void;
}

interface ManoObraData {
  centroId: string;
  manoObraTotal: number;
}

interface TrabajadorManoObra {
  centroId: string;
  trabajadorId: number;
  nombreTrabajador: string;
  manoObraTotal: number;
}

interface DetalleDias {
  centroId: string;
  trabajadorId: number;
  nombreTrabajador: string;
  detalleDias: Array<{
    fecha: string;
    horasNormales: number;
    extrasDiurnas: number;
    extrasNocturnas: number;
    dominicalesDiurnas: number;
    dominicalesNocturnas: number;
    totalHoras: number;
  }>;
}

interface TrabajadorInfo {
  trabajadorId: number;
  nombre: string;
  cargo?: string;
}

interface CentroDelMes {
  centroId: string;
  trabajadores: TrabajadorInfo[];
}

// Configuración para los tipos de horas (en caso de que no esté en types)
const TIPOS_HORAS_CONFIG = {
  normales: {
    key: 'normales' as const,
    nombre: 'Horas Normales',
    icono: '🕘',
    color: '#10b981',
    descripcion: 'Horas trabajadas en jornada normal (x1.0)'
  },
  extrasdiurnas: {
    key: 'extrasdiurnas' as const,
    nombre: 'Extras Diurnas',
    icono: '☀️',
    color: '#f59e0b',
    descripcion: 'Horas extras trabajadas de día (x1.25)'
  },
  extrasnocturnas: {
    key: 'extrasnocturnas' as const,
    nombre: 'Extras Nocturnas',
    icono: '🌙',
    color: '#6366f1',
    descripcion: 'Horas extras trabajadas de noche (x1.75)'
  },
  dominicalesdiurnas: {
    key: 'dominicalesdiurnas' as const,
    nombre: 'Dominicales Diurnas',
    icono: '📅',
    color: '#ef4444',
    descripcion: 'Horas trabajadas domingos de día (x2.0)'
  },
  dominicalesnocturnas: {
    key: 'dominicalesnocturnas' as const,
    nombre: 'Dominicales Nocturnas',
    icono: '🌜',
    color: '#8b5cf6',
    descripcion: 'Horas trabajadas domingos de noche (x2.1)'
  }
};

const InformacionEjecucionPage: React.FC<Props> = ({ centroId, centroNombre, onVolver }) => {
  const [mesSeleccionado, setMesSeleccionado] = useState<number | null>(null);
  const [añoSeleccionado, setAñoSeleccionado] = useState<number>(new Date().getFullYear());
  const [mesesConActividad, setMesesConActividad] = useState<MesConActividad[]>([]);
  
  // Estados existentes
  const [manoObraData, setManoObraData] = useState<ManoObraData | null>(null);
  const [trabajadoresDelMes, setTrabajadoresDelMes] = useState<TrabajadorInfo[]>([]);
  const [trabajadoresManoObra, setTrabajadoresManoObra] = useState<TrabajadorManoObra[]>([]);
  const [detalleActual, setDetalleActual] = useState<DetalleDias | null>(null);
  
  // Nuevos estados para las estadísticas detalladas
  const [estadisticasMes, setEstadisticasMes] = useState<EstadisticasMes | null>(null);
  const [trabajadoresPorTipo, setTrabajadoresPorTipo] = useState<TrabajadoresPorTipoHora | null>(null);
  const [tipoHoraSeleccionado, setTipoHoraSeleccionado] = useState<TipoHora | null>(null);
  
  // Vista actualizada para incluir las nuevas pantallas
  const [vistaActual, setVistaActual] = useState<'meses' | 'trabajadores' | 'estadisticas' | 'trabajadores-tipo' | 'detalle'>('meses');
  const [loading, setLoading] = useState(false);

  // ✅ Cargar meses con actividad al inicio y cuando cambie el año
  useEffect(() => {
    cargarMesesConActividad();
  }, [añoSeleccionado]);

  const cargarMesesConActividad = async () => {
    setLoading(true);
    try {
      const meses = await centrosService.obtenerMesesConActividad(centroId, añoSeleccionado);
      setMesesConActividad(meses);
    } catch (error) {
      console.error("Error al cargar meses con actividad:", error);
      setMesesConActividad([]);
    } finally {
      setLoading(false);
    }
  };

  // Nueva función para cargar estadísticas del mes
  const cargarEstadisticasMes = async (mes: number, año: number) => {
    setLoading(true);
    try {
      const estadisticas = await centrosService.obtenerEstadisticasMes(centroId, mes, año);
      setEstadisticasMes(estadisticas);
    } catch (error) {
      console.error("Error al cargar estadísticas del mes:", error);
      setEstadisticasMes(null);
    } finally {
      setLoading(false);
    }
  };

  // Nueva función para cargar trabajadores por tipo de hora
  const cargarTrabajadoresPorTipo = async (mes: number, año: number, tipoHora: TipoHora) => {
    setLoading(true);
    try {
      const trabajadores = await centrosService.obtenerTrabajadoresPorTipoHora(centroId, mes, año, tipoHora);
      setTrabajadoresPorTipo(trabajadores);
      setTipoHoraSeleccionado(tipoHora);
    } catch (error) {
      console.error("Error al cargar trabajadores por tipo:", error);
      setTrabajadoresPorTipo(null);
    } finally {
      setLoading(false);
    }
  };

  const cargarManoObraTotal = async () => {
    setLoading(true);
    try {
      const data = await centrosService.obtenerManoObraTotal(centroId);
      setManoObraData(data);
    } catch (error) {
      console.error("Error al cargar mano de obra total:", error);
      setManoObraData(null);
    } finally {
      setLoading(false);
    }
  };

  const cargarTrabajadoresDelMes = async (mes: number, año: number) => {
    setLoading(true);
    try {
      const centrosData: CentroDelMes[] = await centrosService.obtenerPorMes(año, mes);
      const centroDelMes = centrosData.find(c => c.centroId === centroId);
      
      if (centroDelMes) {
        setTrabajadoresDelMes(centroDelMes.trabajadores);
        
        const manoObraPromises = centroDelMes.trabajadores.map((trabajador: TrabajadorInfo) =>
          centrosService.obtenerManoObraPorTrabajador(centroId, trabajador.trabajadorId)
        );
        
        const manoObraResults = await Promise.all(manoObraPromises);
        setTrabajadoresManoObra(manoObraResults);
      } else {
        setTrabajadoresDelMes([]);
        setTrabajadoresManoObra([]);
      }
    } catch (error) {
      console.error("Error al cargar trabajadores del mes:", error);
      setTrabajadoresDelMes([]);
      setTrabajadoresManoObra([]);
    } finally {
      setLoading(false);
    }
  };

  const cargarDetalleTrabajador = async (trabajadorId: number) => {
    setLoading(true);
    try {
      const detalle = await centrosService.obtenerDetalleDiasTrabajador(centroId, trabajadorId);
      setDetalleActual(detalle);
    } catch (error) {
      console.error("Error al cargar detalle del trabajador:", error);
      setDetalleActual(null);
    } finally {
      setLoading(false);
    }
  };

  // Handlers actualizados
  const handleSeleccionarMes = (mes: number) => {
    setMesSeleccionado(mes);
    setVistaActual('estadisticas'); // Ahora va primero a estadísticas
    cargarEstadisticasMes(mes, añoSeleccionado);
    cargarManoObraTotal();
  };

  const handleVerTrabajadores = () => {
    if (mesSeleccionado) {
      setVistaActual('trabajadores');
      cargarTrabajadoresDelMes(mesSeleccionado, añoSeleccionado);
    }
  };

  const handleVerTrabajadoresPorTipo = (tipoHora: TipoHora) => {
    if (mesSeleccionado) {
      setVistaActual('trabajadores-tipo');
      cargarTrabajadoresPorTipo(mesSeleccionado, añoSeleccionado, tipoHora);
    }
  };

  const handleVerDetalle = (trabajadorId: number) => {
    setVistaActual('detalle');
    cargarDetalleTrabajador(trabajadorId);
  };

  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(valor);
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatearHoras = (hours: number) => {
    if (hours === 0) return "0:00";
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}:${m.toString().padStart(2, "0")}`;
  };

  const formatearFechaPeriodo = (fechaInicio: string, fechaFin: string) => {
    const inicio = new Date(fechaInicio).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    const fin = new Date(fechaFin).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    return `${inicio} - ${fin}`;
  };

  // Función para obtener el nombre del mes seleccionado
  const getNombreMesSeleccionado = () => {
    if (!mesSeleccionado) return '';
    const mesInfo = mesesConActividad.find(m => m.mes === mesSeleccionado);
    return mesInfo ? mesInfo.nombreMes : '';
  };

  // MANTENER TODAS LAS FUNCIONES DE EXCEL EXISTENTES
  const exportarExcelTrabajadores = async () => {
    if (!mesSeleccionado || trabajadoresDelMes.length === 0) return;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Información Ejecución");

    workbook.creator = "Sistema de Horas Extras";
    workbook.lastModifiedBy = "Sistema de Horas Extras";
    workbook.created = new Date();
    workbook.modified = new Date();

    worksheet.columns = [
      { width: 8 }, { width: 30 }, { width: 20 }, { width: 20 },
    ];

    worksheet.mergeCells('A1:D1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = '📈 INFORMACIÓN DE EJECUCIÓN';
    titleCell.font = { size: 18, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF228B22' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    titleCell.border = {
      top: { style: 'thick', color: { argb: 'FF32CD32' } },
      bottom: { style: 'thick', color: { argb: 'FF32CD32' } },
      left: { style: 'thick', color: { argb: 'FF32CD32' } },
      right: { style: 'thick', color: { argb: 'FF32CD32' } },
    };

    worksheet.mergeCells('A3:D3');
    const centroCell = worksheet.getCell('A3');
    centroCell.value = `Centro: ${centroNombre} | ID: ${centroId}`;
    centroCell.font = { size: 14, bold: true, color: { argb: 'FF228B22' } };
    centroCell.alignment = { horizontal: 'center' };

    worksheet.mergeCells('A4:D4');
    const periodoCell = worksheet.getCell('A4');
    periodoCell.value = `Período: ${getNombreMesSeleccionado()} ${añoSeleccionado} | Total trabajadores: ${trabajadoresDelMes.length}`;
    periodoCell.font = { size: 12, italic: true, color: { argb: 'FF666666' } };
    periodoCell.alignment = { horizontal: 'center' };

    if (manoObraData) {
      worksheet.mergeCells('A5:D5');
      const manoObraCell = worksheet.getCell('A5');
      manoObraCell.value = `Mano de Obra Total del Centro: ${formatearMoneda(manoObraData.manoObraTotal)}`;
      manoObraCell.font = { size: 12, bold: true, color: { argb: 'FF10b981' } };
      manoObraCell.alignment = { horizontal: 'center' };
    }

    worksheet.mergeCells('A6:D6');
    const fechaCell = worksheet.getCell('A6');
    fechaCell.value = `Generado el: ${new Date().toLocaleDateString('es-ES', { 
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    })}`;
    fechaCell.font = { size: 10, color: { argb: 'FF666666' } };
    fechaCell.alignment = { horizontal: 'center' };

    const startRow = 8;
    const headers = ["ID Trabajador", "Nombre del Trabajador", "Cargo", "Mano de Obra"];
    worksheet.insertRow(startRow, headers);

    const headerRow = worksheet.getRow(startRow);
    headerRow.height = 25;
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF32CD32' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'medium', color: { argb: 'FF228B22' } },
        bottom: { style: 'medium', color: { argb: 'FF228B22' } },
        left: { style: 'thin', color: { argb: 'FF228B22' } },
        right: { style: 'thin', color: { argb: 'FF228B22' } },
      };
    });

    trabajadoresDelMes.forEach((trabajador, index) => {
      const manoObra = trabajadoresManoObra.find(mo => mo.trabajadorId === trabajador.trabajadorId);
      const rowData = [
        trabajador.trabajadorId,
        trabajador.nombre,
        trabajador.cargo || 'N/A',
        manoObra ? manoObra.manoObraTotal : 0,
      ];
      
      const currentRow = startRow + 1 + index;
      worksheet.insertRow(currentRow, rowData);
      
      const dataRow = worksheet.getRow(currentRow);
      dataRow.height = 20;
      dataRow.eachCell((cell, colNumber) => {
        cell.alignment = { horizontal: colNumber === 2 ? 'left' : 'center', vertical: 'middle' };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
          bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
          left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
          right: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        };
        
        if (index % 2 === 0) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FFF8' } };
        }
        
        cell.font = { size: 11, color: { argb: 'FF333333' } };
        if (colNumber === 4 && typeof cell.value === 'number') {
          cell.numFmt = '"$"#,##0';
        }
      });
    });

    const totalRow = startRow + 1 + trabajadoresDelMes.length;
    const totalManoObra = trabajadoresManoObra.reduce((sum, mo) => sum + mo.manoObraTotal, 0);
    const totales = ['', 'TOTAL', '', totalManoObra];
    
    worksheet.insertRow(totalRow, totales);
    const totalRowObj = worksheet.getRow(totalRow);
    totalRowObj.height = 25;
    totalRowObj.eachCell((cell, colNumber) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF228B22' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'medium', color: { argb: 'FF006400' } },
        bottom: { style: 'medium', color: { argb: 'FF006400' } },
        left: { style: 'thin', color: { argb: 'FF006400' } },
        right: { style: 'thin', color: { argb: 'FF006400' } },
      };
      if (colNumber === 4 && typeof cell.value === 'number') {
        cell.numFmt = '"$"#,##0';
      }
    });

    const footerRow = totalRow + 2;
    worksheet.mergeCells(`A${footerRow}:D${footerRow}`);
    const footerCell = worksheet.getCell(`A${footerRow}`);
    footerCell.value = '© Sistema de Gestión de Horas Extras - Información de Ejecución';
    footerCell.font = { size: 9, italic: true, color: { argb: 'FF888888' } };
    footerCell.alignment = { horizontal: 'center' };

    worksheet.pageSetup = {
      orientation: 'portrait', paperSize: 9, fitToPage: true, fitToHeight: 1, fitToWidth: 1,
      margins: { left: 0.7, right: 0.7, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3 },
    };

    worksheet.headerFooter.oddHeader = '&C&16&B📈 INFORMACIÓN DE EJECUCIÓN';
    worksheet.headerFooter.oddFooter = '&L&D &T&C&P de &N&R© Sistema de Gestión';

    const buffer = await workbook.xlsx.writeBuffer();
    const fecha = new Date().toISOString().split('T')[0];
    const nombreArchivo = `Ejecucion_${centroNombre.replace(/\s+/g, '_')}_${getNombreMesSeleccionado()}_${añoSeleccionado}_${fecha}.xlsx`;
    saveAs(new Blob([buffer]), nombreArchivo);
  };

  // Nueva función para exportar Excel de trabajadores por tipo de hora
  const exportarExcelTrabajadoresPorTipo = async () => {
    if (!trabajadoresPorTipo || !tipoHoraSeleccionado) return;

    const config = TIPOS_HORAS_CONFIG[tipoHoraSeleccionado];
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`${config.nombre}`);

    workbook.creator = "Sistema de Horas Extras";
    workbook.lastModifiedBy = "Sistema de Horas Extras";
    workbook.created = new Date();
    workbook.modified = new Date();

    worksheet.columns = [
      { width: 8 }, { width: 25 }, { width: 20 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 20 }
    ];

    // Título
    worksheet.mergeCells('A1:G1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = `${config.icono} ${config.nombre.toUpperCase()}`;
    titleCell.font = { size: 18, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: config.color.replace('#', 'FF') } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Información del centro
    worksheet.mergeCells('A3:G3');
    const centroCell = worksheet.getCell('A3');
    centroCell.value = `Centro: ${centroNombre} | ${getNombreMesSeleccionado()} ${añoSeleccionado}`;
    centroCell.font = { size: 14, bold: true, color: { argb: config.color.replace('#', 'FF') } };
    centroCell.alignment = { horizontal: 'center' };

    // Resumen
    worksheet.mergeCells('A4:G4');
    const resumenCell = worksheet.getCell('A4');
    resumenCell.value = `Total trabajadores: ${trabajadoresPorTipo.totalTrabajadores} | Total horas: ${formatearHoras(trabajadoresPorTipo.totalHoras)} | Mano de obra: ${formatearMoneda(trabajadoresPorTipo.totalManoObra)}`;
    resumenCell.font = { size: 12, italic: true, color: { argb: 'FF666666' } };
    resumenCell.alignment = { horizontal: 'center' };

    const startRow = 6;
    const headers = ["ID", "Trabajador", "Cargo", "Valor Hora", "Total Horas", "Días", "Mano de Obra"];
    worksheet.insertRow(startRow, headers);

    const headerRow = worksheet.getRow(startRow);
    headerRow.height = 25;
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: config.color.replace('#', 'FF') } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    // Datos de trabajadores
    trabajadoresPorTipo.trabajadores.forEach((trabajador, index) => {
      const rowData = [
        trabajador.trabajadorId,
        trabajador.nombreTrabajador,
        trabajador.cargo || 'N/A',
        trabajador.valorHora,
        trabajador.totalHoras,
        trabajador.totalDias,
        trabajador.manoObra
      ];
      
      const currentRow = startRow + 1 + index;
      worksheet.insertRow(currentRow, rowData);
      
      const dataRow = worksheet.getRow(currentRow);
      dataRow.height = 20;
      dataRow.eachCell((cell, colNumber) => {
        cell.alignment = { horizontal: colNumber === 2 ? 'left' : 'center', vertical: 'middle' };
        
        if (index % 2 === 0) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FFF8' } };
        }
        
        cell.font = { size: 11, color: { argb: 'FF333333' } };
        
        // Formato para moneda y números
        if (colNumber === 4 || colNumber === 7) {
          cell.numFmt = '"$"#,##0';
        }
        if (colNumber === 5) {
          cell.numFmt = '0.00';
        }
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const fecha = new Date().toISOString().split('T')[0];
    const nombreArchivo = `${config.nombre.replace(/\s+/g, '_')}_${centroNombre.replace(/\s+/g, '_')}_${getNombreMesSeleccionado()}_${añoSeleccionado}_${fecha}.xlsx`;
    saveAs(new Blob([buffer]), nombreArchivo);
  };

  // Nueva función para exportar Excel de detalle
  const exportarExcelDetalle = async () => {
    if (!detalleActual || detalleActual.detalleDias.length === 0) return;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Detalle Días Trabajados");

    workbook.creator = "Sistema de Horas Extras";
    workbook.lastModifiedBy = "Sistema de Horas Extras";
    workbook.created = new Date();
    workbook.modified = new Date();

    worksheet.columns = [
      { width: 12 }, { width: 12 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }
    ];

    // Título
    worksheet.mergeCells('A1:G1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = '📅 DETALLE DE DÍAS TRABAJADOS';
    titleCell.font = { size: 18, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3b82f6' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Información del trabajador
    worksheet.mergeCells('A3:G3');
    const trabajadorCell = worksheet.getCell('A3');
    trabajadorCell.value = `Trabajador: ${detalleActual.nombreTrabajador} | ID: ${detalleActual.trabajadorId}`;
    trabajadorCell.font = { size: 14, bold: true, color: { argb: 'FF3b82f6' } };
    trabajadorCell.alignment = { horizontal: 'center' };

    worksheet.mergeCells('A4:G4');
    const centroCell = worksheet.getCell('A4');
    centroCell.value = `Centro: ${centroNombre} | ${getNombreMesSeleccionado()} ${añoSeleccionado}`;
    centroCell.font = { size: 12, italic: true, color: { argb: 'FF666666' } };
    centroCell.alignment = { horizontal: 'center' };

    const startRow = 6;
    const headers = ["Fecha", "H. Normales", "Extras Diurnas", "Extras Nocturnas", "Dom. Diurnas", "Dom. Nocturnas", "Total Horas"];
    worksheet.insertRow(startRow, headers);

    const headerRow = worksheet.getRow(startRow);
    headerRow.height = 25;
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3b82f6' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    // Datos de los días
    detalleActual.detalleDias.forEach((dia, index) => {
      const rowData = [
        formatearFecha(dia.fecha),
        dia.horasNormales,
        dia.extrasDiurnas,
        dia.extrasNocturnas,
        dia.dominicalesDiurnas,
        dia.dominicalesNocturnas,
        dia.totalHoras
      ];
      
      const currentRow = startRow + 1 + index;
      worksheet.insertRow(currentRow, rowData);
      
      const dataRow = worksheet.getRow(currentRow);
      dataRow.height = 20;
      dataRow.eachCell((cell, colNumber) => {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        
        if (index % 2 === 0) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8F9FF' } };
        }
        
        cell.font = { size: 11, color: { argb: 'FF333333' } };
        
        // Formato para horas
        if (colNumber > 1) {
          cell.numFmt = '0.00';
        }
      });
    });

    // Fila de totales
    const totalRow = startRow + 1 + detalleActual.detalleDias.length;
    const totales = [
      'TOTALES',
      detalleActual.detalleDias.reduce((sum, d) => sum + d.horasNormales, 0),
      detalleActual.detalleDias.reduce((sum, d) => sum + d.extrasDiurnas, 0),
      detalleActual.detalleDias.reduce((sum, d) => sum + d.extrasNocturnas, 0),
      detalleActual.detalleDias.reduce((sum, d) => sum + d.dominicalesDiurnas, 0),
      detalleActual.detalleDias.reduce((sum, d) => sum + d.dominicalesNocturnas, 0),
      detalleActual.detalleDias.reduce((sum, d) => sum + d.totalHoras, 0)
    ];
    
    worksheet.insertRow(totalRow, totales);
    const totalRowObj = worksheet.getRow(totalRow);
    totalRowObj.height = 25;
    totalRowObj.eachCell((cell, colNumber) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3b82f6' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      
      if (colNumber > 1) {
        cell.numFmt = '0.00';
      }
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const fecha = new Date().toISOString().split('T')[0];
    const nombreArchivo = `Detalle_${detalleActual.nombreTrabajador.replace(/\s+/g, '_')}_${centroNombre.replace(/\s+/g, '_')}_${getNombreMesSeleccionado()}_${añoSeleccionado}_${fecha}.xlsx`;
    saveAs(new Blob([buffer]), nombreArchivo);
  };

  // VISTA: Meses (sin cambios)
  if (vistaActual === 'meses') {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', padding: '20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '30px' }}>
            <button 
              onClick={onVolver} 
              style={{ 
                marginBottom: '20px', 
                padding: '12px 24px', 
                border: 'none', 
                borderRadius: '10px', 
                background: 'rgba(255,255,255,0.2)', 
                color: 'white', 
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            >
              ← Volver a Centros
            </button>
            <h1 style={{ 
              fontSize: '2.5rem', 
              color: 'white', 
              marginBottom: '10px', 
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              fontWeight: '700'
            }}>
              📈 Información de Ejecución
            </h1>
            <h2 style={{ fontSize: '1.3rem', color: 'rgba(255,255,255,0.9)', margin: 0 }}>
              Centro: {centroNombre}
            </h2>
          </div>

          <div style={{ 
            background: 'rgba(255,255,255,0.95)', 
            borderRadius: '20px', 
            padding: '30px', 
            marginBottom: '30px', 
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            backdropFilter: 'blur(10px)'
          }}>
            <h3 style={{ marginBottom: '20px', color: '#333', fontSize: '1.3rem', fontWeight: '600' }}>
              📅 Seleccionar Año
            </h3>
            <select
              value={añoSeleccionado}
              onChange={(e) => setAñoSeleccionado(Number(e.target.value))}
              style={{ 
                padding: '12px 20px', 
                borderRadius: '10px', 
                border: '2px solid #e5e7eb', 
                fontSize: '1.1rem', 
                marginBottom: '20px',
                background: 'white',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              {[2023, 2024, 2025, 2026].map(año => (
                <option key={año} value={año}>{año}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div style={{ 
              background: 'rgba(255,255,255,0.95)', 
              borderRadius: '20px', 
              padding: '60px', 
              textAlign: 'center', 
              fontSize: '1.2rem', 
              color: '#666',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ marginBottom: '20px' }}>🔄</div>
              Cargando meses con actividad...
            </div>
          ) : (
            <div style={{ 
              background: 'rgba(255,255,255,0.95)', 
              borderRadius: '20px', 
              padding: '30px', 
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              backdropFilter: 'blur(10px)'
            }}>
              <h3 style={{ 
                marginBottom: '30px', 
                color: '#333', 
                textAlign: 'center', 
                fontSize: '1.4rem',
                fontWeight: '600'
              }}>
                📊 Meses con Actividad - {añoSeleccionado}
              </h3>

              {mesesConActividad.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                  {mesesConActividad.map((mes) => (
                    <div
                      key={mes.mes}
                      onClick={() => handleSeleccionarMes(mes.mes)}
                      style={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                        color: 'white',
                        border: 'none',
                        padding: '25px',
                        borderRadius: '15px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        position: 'relative' as const,
                        overflow: 'hidden'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-5px)';
                        e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(59, 130, 246, 0.3), 0 10px 10px -5px rgba(59, 130, 246, 0.1)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                      }}
                    >
                      <div style={{ position: 'absolute', top: '10px', right: '15px', fontSize: '2rem', opacity: 0.3 }}>
                        📊
                      </div>
                      
                      <h4 style={{ 
                        margin: '0 0 15px 0', 
                        fontSize: '1.4rem', 
                        fontWeight: '700',
                        textShadow: '1px 1px 2px rgba(0,0,0,0.2)'
                      }}>
                        {mes.nombreMes}
                      </h4>
                      
                      <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '15px' }}>
                        📅 {formatearFechaPeriodo(mes.fechaPrimerRegistro, mes.fechaUltimoRegistro)}
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.85rem' }}>
                        <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '8px' }}>
                          <div style={{ fontWeight: '600' }}>👥 Trabajadores</div>
                          <div style={{ fontSize: '1.1rem', fontWeight: '700' }}>{mes.totalTrabajadores}</div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '8px' }}>
                          <div style={{ fontWeight: '600' }}>⏱️ Total Horas</div>
                          <div style={{ fontSize: '1.1rem', fontWeight: '700' }}>{formatearHoras(mes.totalHoras)}</div>
                        </div>
                        <div style={{ 
                          background: 'rgba(255,255,255,0.2)', 
                          padding: '8px', 
                          borderRadius: '8px',
                          gridColumn: '1 / -1'  
                        }}>
                          <div style={{ fontWeight: '600' }}>💰 Mano de Obra</div>
                          <div style={{ fontSize: '1.1rem', fontWeight: '700' }}>{formatearMoneda(mes.manoObraTotal)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '60px 20px', 
                  color: '#666',
                  background: '#f9fafb',
                  borderRadius: '15px',
                  border: '2px dashed #d1d5db'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '20px', opacity: 0.5 }}>📅</div>
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '10px', color: '#374151' }}>
                    No hay actividad registrada
                  </h3>
                  <p style={{ fontSize: '1rem', lineHeight: 1.6, maxWidth: '400px', margin: '0 auto' }}>
                    No se encontró actividad laboral para el año {añoSeleccionado} en este centro de trabajo.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // NUEVA VISTA: Estadísticas del mes
  if (vistaActual === 'estadisticas') {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f7fa', padding: '20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '30px' }}>
            <button 
              onClick={() => setVistaActual('meses')} 
              style={{ marginBottom: '20px', padding: '10px 20px', border: 'none', borderRadius: '8px', background: '#6b7280', color: 'white', cursor: 'pointer' }}
            >
              ← Volver a Meses
            </button>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h1 style={{ fontSize: '2rem', color: '#333', marginBottom: '10px' }}>
                  📊 Estadísticas Detalladas - {getNombreMesSeleccionado()} {añoSeleccionado}
                </h1>
                <h2 style={{ fontSize: '1.3rem', color: '#666', margin: 0 }}>
                  Centro: {centroNombre}
                </h2>
              </div>
              <button 
                onClick={handleVerTrabajadores}
                style={{
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 'bold'
                }}
              >
                👥 Ver Todos los Trabajadores
              </button>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', fontSize: '1.5rem', color: '#666' }}>
              Cargando estadísticas...
            </div>
          ) : estadisticasMes ? (
            <>
              {/* Resumen General */}
              <div style={{ 
                background: 'white', 
                borderRadius: '12px', 
                padding: '30px', 
                marginBottom: '30px', 
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                textAlign: 'center'
              }}>
                <h3 style={{ color: '#333', marginBottom: '20px', fontSize: '1.4rem' }}>
                  📈 Resumen General del Mes
                </h3>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                  gap: '20px',
                  marginBottom: '20px'
                }}>
                  <div style={{ background: '#f0fdf4', padding: '20px', borderRadius: '10px', border: '2px solid #10b981' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⏱️</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
                      {formatearHoras(estadisticasMes.totalHorasHombre)}
                    </div>
                    <div style={{ color: '#666', fontWeight: '600' }}>Total Horas Hombre</div>
                  </div>
                  <div style={{ background: '#f0f9ff', padding: '20px', borderRadius: '10px', border: '2px solid #3b82f6' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '10px' }}>👥</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
                      {estadisticasMes.totalTrabajadoresUnicos}
                    </div>
                    <div style={{ color: '#666', fontWeight: '600' }}>Trabajadores Únicos</div>
                  </div>
                  <div style={{ background: '#f0fdf4', padding: '20px', borderRadius: '10px', border: '2px solid #10b981' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '10px' }}>💰</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#10b981' }}>
                      {formatearMoneda(estadisticasMes.manoObraTotal)}
                    </div>
                    <div style={{ color: '#666', fontWeight: '600' }}>Mano de Obra Total</div>
                  </div>
                </div>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>
                  📅 Período: {formatearFecha(estadisticasMes.periodoActividad.fechaInicio)} - {formatearFecha(estadisticasMes.periodoActividad.fechaFin)}
                </div>
              </div>

              {/* Estadísticas por Tipo de Hora */}
              <div style={{ 
                background: 'white', 
                borderRadius: '12px', 
                padding: '30px', 
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{ color: '#333', marginBottom: '30px', fontSize: '1.4rem', textAlign: 'center' }}>
                  🎯 Estadísticas por Tipo de Hora
                </h3>
                <div style={{ display: 'grid', gap: '20px' }}>
                  {Object.entries(estadisticasMes.estadisticasPorTipo).map(([key, stats]) => {
                    // Mapear las claves del backend a nuestros tipos
                    const tipoKey = key === 'horasNormales' ? 'normales' : 
                                   key === 'extrasDiurnas' ? 'extrasdiurnas' :
                                   key === 'extrasNocturnas' ? 'extrasnocturnas' :
                                   key === 'dominicalesDiurnas' ? 'dominicalesdiurnas' :
                                   key === 'dominicalesNocturnas' ? 'dominicalesnocturnas' : 'normales';
                    
                    const config = TIPOS_HORAS_CONFIG[tipoKey as TipoHora];
                    
                    return (
                      <div
                        key={key}
                        onClick={() => stats.totalHoras > 0 && handleVerTrabajadoresPorTipo(tipoKey as TipoHora)}
                        style={{
                          border: `2px solid ${config.color}`,
                          borderRadius: '12px',
                          padding: '25px',
                          background: stats.totalHoras > 0 ? `${config.color}08` : '#f9fafb',
                          cursor: stats.totalHoras > 0 ? 'pointer' : 'default',
                          transition: 'all 0.3s ease',
                          opacity: stats.totalHoras > 0 ? 1 : 0.6
                        }}
                        onMouseOver={(e) => {
                          if (stats.totalHoras > 0) {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = `0 8px 25px -5px ${config.color}40`;
                          }
                        }}
                        onMouseOut={(e) => {
                          if (stats.totalHoras > 0) {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                          }
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ fontSize: '2.5rem' }}>{config.icono}</div>
                            <div>
                              <h4 style={{ margin: '0 0 5px 0', color: config.color, fontSize: '1.3rem', fontWeight: '700' }}>
                                {config.nombre}
                              </h4>
                              <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                                {config.descripcion}
                              </p>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            {stats.totalHoras > 0 && (
                              <div style={{ color: '#10b981', fontSize: '0.9rem', fontWeight: '600', marginBottom: '5px' }}>
                                👆 Click para ver trabajadores
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                          gap: '15px',
                          marginTop: '20px'
                        }}>
                          <div style={{ background: 'rgba(255,255,255,0.8)', padding: '15px', borderRadius: '8px' }}>
                            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: config.color }}>
                              {formatearHoras(stats.totalHoras)}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#666' }}>Total Horas</div>
                          </div>
                          <div style={{ background: 'rgba(255,255,255,0.8)', padding: '15px', borderRadius: '8px' }}>
                            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: config.color }}>
                              {stats.totalTrabajadores}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#666' }}>Trabajadores</div>
                          </div>
                          <div style={{ background: 'rgba(255,255,255,0.8)', padding: '15px', borderRadius: '8px' }}>
                            <div style={{ fontSize: '1rem', fontWeight: 'bold', color: config.color }}>
                              {formatearMoneda(stats.manoObra)}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#666' }}>Mano de Obra</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>
              No se pudieron cargar las estadísticas del mes
            </div>
          )}
        </div>
      </div>
    );
  }

  // NUEVA VISTA: Trabajadores por tipo de hora
  if (vistaActual === 'trabajadores-tipo' && trabajadoresPorTipo && tipoHoraSeleccionado) {
    const config = TIPOS_HORAS_CONFIG[tipoHoraSeleccionado];
    
    return (
      <div style={{ minHeight: '100vh', background: '#f5f7fa', padding: '20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '30px' }}>
            <button 
              onClick={() => setVistaActual('estadisticas')} 
              style={{ marginBottom: '20px', padding: '10px 20px', border: 'none', borderRadius: '8px', background: '#6b7280', color: 'white', cursor: 'pointer' }}
            >
              ← Volver a Estadísticas
            </button>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h1 style={{ fontSize: '2rem', color: '#333', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {config.icono} {config.nombre}
                </h1>
                <h2 style={{ fontSize: '1.3rem', color: '#666', margin: 0 }}>
                  {centroNombre} - {getNombreMesSeleccionado()} {añoSeleccionado}
                </h2>
              </div>
              <button 
                onClick={exportarExcelTrabajadoresPorTipo}
                style={{
                  background: config.color,
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                📤 Exportar Excel
              </button>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', fontSize: '1.5rem', color: '#666' }}>
              Cargando trabajadores...
            </div>
          ) : (
            <>
              {/* Resumen del Tipo de Hora */}
              <div style={{ 
                background: 'white', 
                borderRadius: '12px', 
                padding: '30px', 
                marginBottom: '30px', 
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                border: `3px solid ${config.color}`
              }}>
                <h3 style={{ color: config.color, marginBottom: '20px', fontSize: '1.4rem', textAlign: 'center' }}>
                  📊 Resumen - {config.nombre}
                </h3>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                  gap: '20px'
                }}>
                  <div style={{ background: `${config.color}10`, padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: config.color }}>
                      {trabajadoresPorTipo.totalTrabajadores}
                    </div>
                    <div style={{ color: '#666', fontWeight: '600' }}>Trabajadores</div>
                  </div>
                  <div style={{ background: `${config.color}10`, padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: config.color }}>
                      {formatearHoras(trabajadoresPorTipo.totalHoras)}
                    </div>
                    <div style={{ color: '#666', fontWeight: '600' }}>Total Horas</div>
                  </div>
                  <div style={{ background: `${config.color}10`, padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: config.color }}>
                      {formatearMoneda(trabajadoresPorTipo.totalManoObra)}
                    </div>
                    <div style={{ color: '#666', fontWeight: '600' }}>Mano de Obra</div>
                  </div>
                </div>
                <div style={{ textAlign: 'center', marginTop: '15px', fontSize: '0.9rem', color: '#666' }}>
                  {config.descripcion}
                </div>
              </div>

              {/* Lista de Trabajadores */}
              <div style={{ background: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <h3 style={{ color: '#333', marginBottom: '20px' }}>
                  👥 Trabajadores que trabajaron {config.nombre}
                </h3>

                {trabajadoresPorTipo.trabajadores.length > 0 ? (
                  <div style={{ display: 'grid', gap: '15px' }}>
                    {trabajadoresPorTipo.trabajadores.map((trabajador) => (
                      <div key={trabajador.trabajadorId} style={{
                        border: `2px solid ${config.color}20`,
                        borderRadius: '12px',
                        padding: '20px',
                        background: `${config.color}08`,
                        transition: 'all 0.3s ease'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                          <div>
                            <h4 style={{ margin: '0 0 5px 0', color: '#333', fontSize: '1.2rem' }}>
                              {trabajador.nombreTrabajador}
                            </h4>
                            <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: '0.9rem' }}>
                              ID: {trabajador.trabajadorId}
                              {trabajador.cargo && ` | Cargo: ${trabajador.cargo}`}
                            </p>
                            <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                              Valor Hora: {formatearMoneda(trabajador.valorHora)} × {trabajador.multiplicador}
                            </p>
                          </div>
                          <button
                            onClick={() => handleVerDetalle(trabajador.trabajadorId)}
                            style={{
                              background: config.color,
                              color: 'white',
                              border: 'none',
                              padding: '10px 20px',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontSize: '0.9rem'
                            }}
                          >
                            Ver Detalle Completo
                          </button>
                        </div>
                        
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                          gap: '15px',
                          marginBottom: '15px'
                        }}>
                          <div style={{ background: 'rgba(255,255,255,0.8)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: config.color }}>
                              {formatearHoras(trabajador.totalHoras)}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#666' }}>Total Horas</div>
                          </div>
                          <div style={{ background: 'rgba(255,255,255,0.8)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: config.color }}>
                              {trabajador.totalDias}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#666' }}>Días Trabajados</div>
                          </div>
                          <div style={{ background: 'rgba(255,255,255,0.8)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                            <div style={{ fontSize: '1rem', fontWeight: 'bold', color: config.color }}>
                              {formatearMoneda(trabajador.manoObra)}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#666' }}>Mano de Obra</div>
                          </div>
                        </div>

                        {/* Detalle por fechas (colapsible) */}
                        <details style={{ marginTop: '15px' }}>
                          <summary style={{ 
                            cursor: 'pointer', 
                            color: config.color, 
                            fontWeight: '600',
                            fontSize: '0.9rem',
                            padding: '5px 0'
                          }}>
                            📅 Ver detalle por fechas ({trabajador.detalles.length} registros)
                          </summary>
                          <div style={{ 
                            marginTop: '10px', 
                            background: 'rgba(255,255,255,0.9)', 
                            borderRadius: '8px', 
                            padding: '15px',
                            maxHeight: '200px',
                            overflowY: 'auto'
                          }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.85rem' }}>
                              {trabajador.detalles.map((detalle, index) => (
                                <div key={index} style={{ 
                                  display: 'flex', 
                                  justifyContent: 'space-between',
                                  padding: '5px 0',
                                  borderBottom: index < trabajador.detalles.length - 1 ? '1px solid #e5e7eb' : 'none'
                                }}>
                                  <span>{formatearFecha(detalle.fecha)}</span>
                                  <span style={{ fontWeight: '600', color: config.color }}>
                                    {formatearHoras(detalle.horas)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </details>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                    No hay trabajadores registrados para este tipo de hora
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // VISTA: Trabajadores (mantenida con Excel)
  if (vistaActual === 'trabajadores') {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f7fa', padding: '20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '30px' }}>
            <button 
              onClick={() => setVistaActual('estadisticas')} 
              style={{ marginBottom: '20px', padding: '10px 20px', border: 'none', borderRadius: '8px', background: '#6b7280', color: 'white', cursor: 'pointer' }}
            >
              ← Volver a Estadísticas
            </button>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h1 style={{ fontSize: '2rem', color: '#333', marginBottom: '10px' }}>
                  📊 {centroNombre} - {getNombreMesSeleccionado()} {añoSeleccionado}
                </h1>
              </div>
              {trabajadoresDelMes.length > 0 && (
                <button 
                  onClick={exportarExcelTrabajadores}
                  style={{
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  📤 Exportar Excel
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', fontSize: '1.5rem', color: '#666' }}>
              Cargando información...
            </div>
          ) : (
            <>
              {manoObraData && (
                <div style={{ background: 'white', borderRadius: '12px', padding: '30px', marginBottom: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                  <h3 style={{ color: '#333', marginBottom: '15px' }}>💰 Mano de Obra Total del Centro</h3>
                  <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981', margin: 0 }}>
                    {formatearMoneda(manoObraData.manoObraTotal)}
                  </p>
                </div>
              )}

              <div style={{ background: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ color: '#333', margin: 0 }}>👥 Trabajadores del Mes</h3>
                  <span style={{ color: '#666' }}>
                    Total: {trabajadoresDelMes.length} trabajadores
                  </span>
                </div>

                {trabajadoresDelMes.length > 0 ? (
                  <div style={{ display: 'grid', gap: '15px' }}>
                    {trabajadoresDelMes.map((trabajador) => {
                      const manoObra = trabajadoresManoObra.find(mo => mo.trabajadorId === trabajador.trabajadorId);
                      return (
                        <div key={trabajador.trabajadorId} style={{
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          padding: '20px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div>
                            <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>
                              {trabajador.nombre}
                            </h4>
                            <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                              ID: {trabajador.trabajadorId}
                              {trabajador.cargo && ` | Cargo: ${trabajador.cargo}`}
                            </p>
                            {manoObra && (
                              <p style={{ margin: '10px 0 0 0', color: '#10b981', fontWeight: 'bold' }}>
                                Mano de Obra: {formatearMoneda(manoObra.manoObraTotal)}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => handleVerDetalle(trabajador.trabajadorId)}
                            style={{
                              background: '#3b82f6',
                              color: 'white',
                              border: 'none',
                              padding: '10px 20px',
                              borderRadius: '8px',
                              cursor: 'pointer'
                            }}
                          >
                            Ver Detalles
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                    No hay trabajadores registrados para este mes
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // VISTA: Detalle (mantenida con Excel)
  if (vistaActual === 'detalle' && detalleActual) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f7fa', padding: '20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '30px' }}>
            <button 
              onClick={() => setVistaActual('trabajadores')} 
              style={{ marginBottom: '20px', padding: '10px 20px', border: 'none', borderRadius: '8px', background: '#6b7280', color: 'white', cursor: 'pointer' }}
            >
              ← Volver a Trabajadores
            </button>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h1 style={{ fontSize: '2rem', color: '#333', marginBottom: '10px' }}>
                  📅 Detalle de Días Trabajados
                </h1>
                <h2 style={{ fontSize: '1.5rem', color: '#666', margin: 0 }}>
                  Trabajador: {detalleActual.nombreTrabajador}
                </h2>
              </div>
              {detalleActual.detalleDias.length > 0 && (
                <button 
                  onClick={exportarExcelDetalle}
                  style={{
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  📤 Exportar Excel
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', fontSize: '1.5rem', color: '#666' }}>
              Cargando detalle...
            </div>
          ) : (
            <div style={{ background: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <h3 style={{ marginBottom: '20px', color: '#333' }}>
                📊 Registro Diario de Horas
              </h3>

              {detalleActual.detalleDias.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ background: '#f9fafb' }}>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Fecha</th>
                        <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e5e7eb' }}>H. Normales</th>
                        <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e5e7eb' }}>Extras Diurnas</th>
                        <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e5e7eb' }}>Extras Nocturnas</th>
                        <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e5e7eb' }}>Dom. Diurnas</th>
                        <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e5e7eb' }}>Dom. Nocturnas</th>
                        <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e5e7eb' }}>Total Horas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detalleActual.detalleDias.map((dia, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '12px' }}>{formatearFecha(dia.fecha)}</td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>{formatearHoras(dia.horasNormales)}</td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>{formatearHoras(dia.extrasDiurnas)}</td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>{formatearHoras(dia.extrasNocturnas)}</td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>{formatearHoras(dia.dominicalesDiurnas)}</td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>{formatearHoras(dia.dominicalesNocturnas)}</td>
                          <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>{formatearHoras(dia.totalHoras)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div style={{ marginTop: '20px', padding: '15px', background: '#f0f9ff', borderRadius: '8px' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>📈 Resumen Total</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
                      <div><strong>Total Días:</strong> {detalleActual.detalleDias.length}</div>
                      <div><strong>H. Normales:</strong> {formatearHoras(detalleActual.detalleDias.reduce((sum, d) => sum + d.horasNormales, 0))}</div>
                      <div><strong>Extras Diurnas:</strong> {formatearHoras(detalleActual.detalleDias.reduce((sum, d) => sum + d.extrasDiurnas, 0))}</div>
                      <div><strong>Extras Nocturnas:</strong> {formatearHoras(detalleActual.detalleDias.reduce((sum, d) => sum + d.extrasNocturnas, 0))}</div>
                      <div><strong>Dom. Diurnas:</strong> {formatearHoras(detalleActual.detalleDias.reduce((sum, d) => sum + d.dominicalesDiurnas, 0))}</div>
                      <div><strong>Dom. Nocturnas:</strong> {formatearHoras(detalleActual.detalleDias.reduce((sum, d) => sum + d.dominicalesNocturnas, 0))}</div>
                      <div><strong>TOTAL HORAS:</strong> {formatearHoras(detalleActual.detalleDias.reduce((sum, d) => sum + d.totalHoras, 0))}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  No hay registros de días trabajados para este trabajador
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default InformacionEjecucionPage;