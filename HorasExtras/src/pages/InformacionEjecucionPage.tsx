import React, { useState } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { centrosService } from "../api/centrosService";

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

// ✅ ADD: Interface for the API response structure
interface CentroDelMes {
  centroId: string;
  trabajadores: TrabajadorInfo[];
}

const InformacionEjecucionPage: React.FC<Props> = ({ centroId, centroNombre, onVolver }) => {
  const [mesSeleccionado, setMesSeleccionado] = useState<number | null>(null);
  const [añoSeleccionado, setAñoSeleccionado] = useState<number>(new Date().getFullYear());
  const [manoObraData, setManoObraData] = useState<ManoObraData | null>(null);
  const [trabajadoresDelMes, setTrabajadoresDelMes] = useState<TrabajadorInfo[]>([]);
  const [trabajadoresManoObra, setTrabajadoresManoObra] = useState<TrabajadorManoObra[]>([]);
  const [detalleActual, setDetalleActual] = useState<DetalleDias | null>(null);
  const [vistaActual, setVistaActual] = useState<'meses' | 'trabajadores' | 'detalle'>('meses');
  const [loading, setLoading] = useState(false);

  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

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
      // ✅ FIX: Type the API response properly
      const centrosData: CentroDelMes[] = await centrosService.obtenerPorMes(año, mes);
      const centroDelMes = centrosData.find(c => c.centroId === centroId);
      
      if (centroDelMes) {
        setTrabajadoresDelMes(centroDelMes.trabajadores);
        
        // ✅ FIX: Now trabajador has proper type TrabajadorInfo
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

  // Exportar Excel para vista de trabajadores del mes
  const exportarExcelTrabajadores = async () => {
    if (!mesSeleccionado || trabajadoresDelMes.length === 0) return;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Información Ejecución");

    // Configurar propiedades del documento
    workbook.creator = "Sistema de Horas Extras";
    workbook.lastModifiedBy = "Sistema de Horas Extras";
    workbook.created = new Date();
    workbook.modified = new Date();

    // Configurar ancho de columnas
    worksheet.columns = [
      { width: 8 }, // ID
      { width: 30 }, // Nombre
      { width: 20 }, // Cargo
      { width: 20 }, // Mano de Obra
    ];

    // Agregar título principal
    worksheet.mergeCells('A1:D1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = '📈 INFORMACIÓN DE EJECUCIÓN';
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

    // Información del centro y período
    worksheet.mergeCells('A3:D3');
    const centroCell = worksheet.getCell('A3');
    centroCell.value = `Centro: ${centroNombre} | ID: ${centroId}`;
    centroCell.font = { 
      size: 14, 
      bold: true, 
      color: { argb: 'FF228B22' } 
    };
    centroCell.alignment = { horizontal: 'center' };

    worksheet.mergeCells('A4:D4');
    const periodoCell = worksheet.getCell('A4');
    periodoCell.value = `Período: ${meses[mesSeleccionado - 1]} ${añoSeleccionado} | Total trabajadores: ${trabajadoresDelMes.length}`;
    periodoCell.font = { 
      size: 12, 
      italic: true, 
      color: { argb: 'FF666666' } 
    };
    periodoCell.alignment = { horizontal: 'center' };

    // Mano de obra total del centro
    if (manoObraData) {
      worksheet.mergeCells('A5:D5');
      const manoObraCell = worksheet.getCell('A5');
      manoObraCell.value = `Mano de Obra Total del Centro: ${formatearMoneda(manoObraData.manoObraTotal)}`;
      manoObraCell.font = { 
        size: 12, 
        bold: true, 
        color: { argb: 'FF10b981' } 
      };
      manoObraCell.alignment = { horizontal: 'center' };
    }

    // Fecha de generación
    worksheet.mergeCells('A6:D6');
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

    const startRow = 8;

    // Encabezados
    const headers = [
      "ID Trabajador",
      "Nombre del Trabajador",
      "Cargo",
      "Mano de Obra",
    ];

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

    // Agregar datos de trabajadores
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
        cell.alignment = { 
          horizontal: colNumber === 2 ? 'left' : 'center', 
          vertical: 'middle' 
        };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
          bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
          left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
          right: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        };
        
        if (index % 2 === 0) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF8FFF8' },
          };
        }
        
        cell.font = { 
          size: 11,
          color: { argb: 'FF333333' }
        };

        // Formato para mano de obra
        if (colNumber === 4 && typeof cell.value === 'number') {
          cell.numFmt = '"$"#,##0';
        }
      });
    });

    // Agregar fila de totales
    const totalRow = startRow + 1 + trabajadoresDelMes.length;
    const totalManoObra = trabajadoresManoObra.reduce((sum, mo) => sum + mo.manoObraTotal, 0);
    
    const totales = [
      '',
      'TOTAL',
      '',
      totalManoObra,
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
      
      if (colNumber === 4 && typeof cell.value === 'number') {
        cell.numFmt = '"$"#,##0';
      }
    });

    // Pie de página
    const footerRow = totalRow + 2;
    worksheet.mergeCells(`A${footerRow}:D${footerRow}`);
    const footerCell = worksheet.getCell(`A${footerRow}`);
    footerCell.value = '© Sistema de Gestión de Horas Extras - Información de Ejecución';
    footerCell.font = { 
      size: 9, 
      italic: true, 
      color: { argb: 'FF888888' } 
    };
    footerCell.alignment = { horizontal: 'center' };

    // Configurar vista de impresión
    worksheet.pageSetup = {
      orientation: 'portrait',
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

    worksheet.headerFooter.oddHeader = '&C&16&B📈 INFORMACIÓN DE EJECUCIÓN';
    worksheet.headerFooter.oddFooter = '&L&D &T&C&P de &N&R© Sistema de Gestión';

    // Generar y descargar el archivo
    const buffer = await workbook.xlsx.writeBuffer();
    const fecha = new Date().toISOString().split('T')[0];
    const nombreArchivo = `Ejecucion_${centroNombre.replace(/\s+/g, '_')}_${meses[mesSeleccionado - 1]}_${añoSeleccionado}_${fecha}.xlsx`;
    saveAs(new Blob([buffer]), nombreArchivo);
  };

  // Exportar Excel para detalle de trabajador
  const exportarExcelDetalle = async () => {
    if (!detalleActual || detalleActual.detalleDias.length === 0) return;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Detalle Días Trabajados");

    workbook.creator = "Sistema de Horas Extras";
    workbook.lastModifiedBy = "Sistema de Horas Extras";
    workbook.created = new Date();
    workbook.modified = new Date();

    // Configurar ancho de columnas
    worksheet.columns = [
      { width: 12 }, // Fecha
      { width: 12 }, // H. Normales
      { width: 12 }, // Extras Diurnas
      { width: 12 }, // Extras Nocturnas
      { width: 12 }, // Dom. Diurnas
      { width: 12 }, // Dom. Nocturnas
      { width: 12 }, // Total Horas
    ];

    // Título principal
    worksheet.mergeCells('A1:G1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = '📅 DETALLE DE DÍAS TRABAJADOS';
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
    worksheet.mergeCells('A3:G3');
    const trabajadorCell = worksheet.getCell('A3');
    trabajadorCell.value = `Trabajador: ${detalleActual.nombreTrabajador} | ID: ${detalleActual.trabajadorId}`;
    trabajadorCell.font = { 
      size: 14, 
      bold: true, 
      color: { argb: 'FF228B22' } 
    };
    trabajadorCell.alignment = { horizontal: 'center' };

    worksheet.mergeCells('A4:G4');
    const centroDetalleCell = worksheet.getCell('A4');
    centroDetalleCell.value = `Centro: ${centroNombre} | Mes: ${mesSeleccionado ? meses[mesSeleccionado - 1] : ''} ${añoSeleccionado}`;
    centroDetalleCell.font = { 
      size: 12, 
      italic: true, 
      color: { argb: 'FF666666' } 
    };
    centroDetalleCell.alignment = { horizontal: 'center' };

    // Fecha de generación
    worksheet.mergeCells('A5:G5');
    const fechaDetalleCell = worksheet.getCell('A5');
    fechaDetalleCell.value = `Generado el: ${new Date().toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`;
    fechaDetalleCell.font = { 
      size: 10, 
      color: { argb: 'FF666666' } 
    };
    fechaDetalleCell.alignment = { horizontal: 'center' };

    const startRow = 7;

    // Encabezados
    const headers = [
      "Fecha",
      "H. Normales",
      "Extras Diurnas",
      "Extras Nocturnas",
      "Dom. Diurnas",
      "Dom. Nocturnas",
      "Total Horas",
    ];

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

    // Agregar datos de días trabajados
    detalleActual.detalleDias.forEach((dia, index) => {
      const rowData = [
        new Date(dia.fecha).toLocaleDateString('es-CO'),
        dia.horasNormales,
        dia.extrasDiurnas,
        dia.extrasNocturnas,
        dia.dominicalesDiurnas,
        dia.dominicalesNocturnas,
        dia.totalHoras,
      ];
      
      const currentRow = startRow + 1 + index;
      worksheet.insertRow(currentRow, rowData);
      
      const dataRow = worksheet.getRow(currentRow);
      dataRow.height = 20;
      
      dataRow.eachCell((cell, colNumber) => {
        cell.alignment = { 
          horizontal: colNumber === 1 ? 'left' : 'center', 
          vertical: 'middle' 
        };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
          bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
          left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
          right: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        };
        
        if (index % 2 === 0) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF8FFF8' },
          };
        }
        
        cell.font = { 
          size: 11,
          color: { argb: 'FF333333' }
        };

        // Formato para horas
        if (colNumber > 1 && typeof cell.value === 'number') {
          cell.numFmt = '#,##0.00';
        }
      });
    });

    // Calcular totales
    const totales = detalleActual.detalleDias.reduce((acc, dia) => ({
      horasNormales: acc.horasNormales + dia.horasNormales,
      extrasDiurnas: acc.extrasDiurnas + dia.extrasDiurnas,
      extrasNocturnas: acc.extrasNocturnas + dia.extrasNocturnas,
      dominicalesDiurnas: acc.dominicalesDiurnas + dia.dominicalesDiurnas,
      dominicalesNocturnas: acc.dominicalesNocturnas + dia.dominicalesNocturnas,
      totalHoras: acc.totalHoras + dia.totalHoras,
    }), {
      horasNormales: 0,
      extrasDiurnas: 0,
      extrasNocturnas: 0,
      dominicalesDiurnas: 0,
      dominicalesNocturnas: 0,
      totalHoras: 0,
    });

    // Agregar fila de totales
    const totalRow = startRow + 1 + detalleActual.detalleDias.length;
    const totalesArray = [
      'TOTALES',
      totales.horasNormales,
      totales.extrasDiurnas,
      totales.extrasNocturnas,
      totales.dominicalesDiurnas,
      totales.dominicalesNocturnas,
      totales.totalHoras,
    ];
    
    worksheet.insertRow(totalRow, totalesArray);
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
      
      if (colNumber > 1 && typeof cell.value === 'number') {
        cell.numFmt = '#,##0.00';
      }
    });

    // Pie de página
    const footerRow = totalRow + 2;
    worksheet.mergeCells(`A${footerRow}:G${footerRow}`);
    const footerCell = worksheet.getCell(`A${footerRow}`);
    footerCell.value = '© Sistema de Gestión de Horas Extras - Detalle de Días Trabajados';
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

    worksheet.headerFooter.oddHeader = '&C&16&B📅 DETALLE DE DÍAS TRABAJADOS';
    worksheet.headerFooter.oddFooter = '&L&D &T&C&P de &N&R© Sistema de Gestión';

    // Generar y descargar el archivo
    const buffer = await workbook.xlsx.writeBuffer();
    const fecha = new Date().toISOString().split('T')[0];
    const nombreArchivo = `Detalle_${detalleActual.nombreTrabajador.replace(/\s+/g, '_')}_${fecha}.xlsx`;
    saveAs(new Blob([buffer]), nombreArchivo);
  };

  const handleSeleccionarMes = (mes: number) => {
    setMesSeleccionado(mes);
    setVistaActual('trabajadores');
    cargarTrabajadoresDelMes(mes, añoSeleccionado);
    cargarManoObraTotal();
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

  if (vistaActual === 'meses') {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f7fa', padding: '20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '30px' }}>
            <button onClick={onVolver} style={{ marginBottom: '20px', padding: '10px 20px', border: 'none', borderRadius: '8px', background: '#6b7280', color: 'white', cursor: 'pointer' }}>
              ← Volver a Centros
            </button>
            <h1 style={{ fontSize: '2rem', color: '#333', marginBottom: '10px' }}>
              📈 Información de Ejecución
            </h1>
            <h2 style={{ fontSize: '1.5rem', color: '#666', margin: 0 }}>
              Centro: {centroNombre}
            </h2>
          </div>

          <div style={{ background: 'white', borderRadius: '12px', padding: '30px', marginBottom: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginBottom: '20px', color: '#333' }}>Seleccionar Año</h3>
            <select
              value={añoSeleccionado}
              onChange={(e) => setAñoSeleccionado(Number(e.target.value))}
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1.1rem', marginBottom: '20px' }}
            >
              {[2023, 2024, 2025, 2026].map(año => (
                <option key={año} value={año}>{año}</option>
              ))}
            </select>
          </div>

          <div style={{ background: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginBottom: '30px', color: '#333', textAlign: 'center' }}>
              Selecciona el Mes - {añoSeleccionado}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              {meses.map((mes, index) => (
                <button
                  key={index}
                  onClick={() => handleSeleccionarMes(index + 1)}
                  style={{
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    padding: '20px',
                    borderRadius: '10px',
                    fontSize: '1.1rem',
                    cursor: 'pointer',
                    transition: 'background 0.3s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#2563eb'}
                  onMouseOut={(e) => e.currentTarget.style.background = '#3b82f6'}
                >
                  {mes}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (vistaActual === 'trabajadores') {
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
                  📊 {centroNombre} - {meses[mesSeleccionado! - 1]} {añoSeleccionado}
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
                      <div>
                        <strong>Total Días:</strong> {detalleActual.detalleDias.length}
                      </div>
                      <div>
                        <strong>H. Normales:</strong> {formatearHoras(detalleActual.detalleDias.reduce((sum, d) => sum + d.horasNormales, 0))}
                      </div>
                      <div>
                        <strong>Extras Diurnas:</strong> {formatearHoras(detalleActual.detalleDias.reduce((sum, d) => sum + d.extrasDiurnas, 0))}
                      </div>
                      <div>
                        <strong>Extras Nocturnas:</strong> {formatearHoras(detalleActual.detalleDias.reduce((sum, d) => sum + d.extrasNocturnas, 0))}
                      </div>
                      <div>
                        <strong>Dom. Diurnas:</strong> {formatearHoras(detalleActual.detalleDias.reduce((sum, d) => sum + d.dominicalesDiurnas, 0))}
                      </div>
                      <div>
                        <strong>Dom. Nocturnas:</strong> {formatearHoras(detalleActual.detalleDias.reduce((sum, d) => sum + d.dominicalesNocturnas, 0))}
                      </div>
                      <div>
                        <strong>TOTAL HORAS:</strong> {formatearHoras(detalleActual.detalleDias.reduce((sum, d) => sum + d.totalHoras, 0))}
                      </div>
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