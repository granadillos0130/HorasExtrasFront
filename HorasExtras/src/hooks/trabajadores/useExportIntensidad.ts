import { useState } from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import type { Registro } from '../../types/registros';
import type { Trabajador } from '../../types/trabajadores';
import { formatFechaSafe, formatFechaLegible } from '../../utils/trabajadores/fechaUtils';

export const useExportExcelIntensidad = () => {
  const [exportando, setExportando] = useState(false);

  const exportarExcel = async (
    trabajador: Trabajador,
    registros: Registro[],
    fechaInicio: string,
    fechaFin: string,
    centrosVisitados: string[],
    resumen: {
      normales: number;
      extrasDiurnas: number;
      extrasNocturnas: number;
      domDiurnas: number;
      domNocturnas: number;
      total: number;
    }
  ): Promise<void> => {
    if (!trabajador || registros.length === 0) return;

    setExportando(true);

    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Intensidad Horaria");

      // Configurar propiedades del documento
      workbook.creator = "Sistema de Horas Extras";
      workbook.lastModifiedBy = "Sistema de Horas Extras";
      workbook.created = new Date();
      workbook.modified = new Date();

      // Configurar ancho de columnas
      worksheet.columns = [
        { width: 12 }, { width: 10 }, { width: 25 }, { width: 10 }, { width: 10 },
        { width: 10 }, { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 },
        { width: 12 }, { width: 12 },
      ];

      // Agregar título principal
      worksheet.mergeCells('A1:L1');
      const titleCell = worksheet.getCell('A1');
      titleCell.value = 'INTENSIDAD HORARIA DEL TRABAJADOR';
      titleCell.font = { size: 18, bold: true, color: { argb: 'FFFFFFFF' } };
      titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF228B22' } };
      titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
      titleCell.border = {
        top: { style: 'thick', color: { argb: 'FF32CD32' } },
        bottom: { style: 'thick', color: { argb: 'FF32CD32' } },
        left: { style: 'thick', color: { argb: 'FF32CD32' } },
        right: { style: 'thick', color: { argb: 'FF32CD32' } },
      };

      // Información del trabajador
      worksheet.mergeCells('A3:L3');
      const trabajadorCell = worksheet.getCell('A3');
      trabajadorCell.value = `Trabajador: ${trabajador.nombre} | CC: ${trabajador.cedula} | ID: ${trabajador.id}`;
      trabajadorCell.font = { size: 14, bold: true, color: { argb: 'FF228B22' } };
      trabajadorCell.alignment = { horizontal: 'center' };

      worksheet.mergeCells('A4:L4');
      const periodoCell = worksheet.getCell('A4');
      periodoCell.value = `Período: ${formatFechaLegible(fechaInicio)} - ${formatFechaLegible(fechaFin)} | Total registros: ${registros.length}`;
      periodoCell.font = { size: 12, italic: true, color: { argb: 'FF666666' } };
      periodoCell.alignment = { horizontal: 'center' };

      // Agregar centros visitados
      if (centrosVisitados.length > 0) {
        worksheet.mergeCells('A5:L5');
        const centrosCell = worksheet.getCell('A5');
        centrosCell.value = `Centros visitados: ${centrosVisitados.join(', ')}`;
        centrosCell.font = { size: 11, color: { argb: 'FF4A5568' } };
        centrosCell.alignment = { horizontal: 'center' };
      }

      // Agregar fecha de generación
      worksheet.mergeCells('A6:L6');
      const fechaCell = worksheet.getCell('A6');
      fechaCell.value = `Generado el: ${new Date().toLocaleDateString('es-ES', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
      })}`;
      fechaCell.font = { size: 10, color: { argb: 'FF666666' } };
      fechaCell.alignment = { horizontal: 'center' };

      // Espacio antes de la tabla
      const startRow = 8;

      // Encabezados de la tabla
      const headers = [
        "Fecha", "Día", "Centro", "Ingreso", "Salida", "Almuerzo",
        "H. Normales", "Ex. Diurnas", "Ex. Nocturnas",
        "Dom. Diurnas", "Dom. Nocturnas", "Total Horas",
      ];

      // Agregar encabezados
      worksheet.insertRow(startRow, headers);

      // Estilos de encabezado
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

      // Agregar datos de registros
      registros.forEach((registro, index) => {
        const rowData = [
          formatFechaSafe(registro.fecha, { day: '2-digit', month: '2-digit', year: 'numeric' }),
          registro.diaSemana?.substring(0, 3) || 'N/A',
          registro.nombreCentro || 'Sin centro',
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
          cell.alignment = { horizontal: colNumber <= 3 ? 'left' : 'center', vertical: 'middle' };
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
            bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
            left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
            right: { style: 'thin', color: { argb: 'FFCCCCCC' } },
          };

          // Colores alternos para las filas
          if (index % 2 === 0) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FFF8' } };
          }

          // Formato para números (horas)
          if (colNumber > 6) {
            cell.font = { size: 11, color: { argb: 'FF333333' } };
            if (typeof cell.value === 'number' && cell.value > 0) {
              cell.numFmt = '#,##0.00';
            }
          } else {
            cell.font = { size: 11, color: { argb: 'FF333333' } };
          }
        });
      });

      // Agregar fila de totales
      const totalRow = startRow + 1 + registros.length;
      const totales = [
        'TOTALES', '', '', '', '', '',
        resumen.normales, resumen.extrasDiurnas, resumen.extrasNocturnas,
        resumen.domDiurnas, resumen.domNocturnas, resumen.total,
      ];

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

        if (colNumber > 6 && typeof cell.value === 'number') {
          cell.numFmt = '#,##0.00';
        }
      });

      // Agregar pie de página
      const footerRow = totalRow + 2;
      worksheet.mergeCells(`A${footerRow}:L${footerRow}`);
      const footerCell = worksheet.getCell(`A${footerRow}`);
      footerCell.value = 'Sistema de Gestión de Horas Extras - Reporte de Intensidad Horaria';
      footerCell.font = { size: 9, italic: true, color: { argb: 'FF888888' } };
      footerCell.alignment = { horizontal: 'center' };

      // Configurar vista de impresión
      worksheet.pageSetup = {
        orientation: 'landscape',
        paperSize: 9,
        fitToPage: true,
        fitToHeight: 1,
        fitToWidth: 1,
        margins: { left: 0.7, right: 0.7, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3 },
      };

      // Configurar encabezado y pie de página de impresión
      worksheet.headerFooter.oddHeader = '&C&16&BINTENSIDAD HORARIA';
      worksheet.headerFooter.oddFooter = '&L&D &T&C&P de &N&RSistema de Gestión';

      // Generar y descargar el archivo
      const buffer = await workbook.xlsx.writeBuffer();
      const fecha = new Date().toISOString().split('T')[0];
      const nombreArchivo = `Intensidad_${trabajador.nombre.replace(/\s+/g, '_')}_${fecha}.xlsx`;
      saveAs(new Blob([buffer]), nombreArchivo);

      alert(`✅ Excel exportado exitosamente: ${nombreArchivo}`);
    } catch (error) {
      console.error("Error al exportar Excel:", error);
      alert("❌ Error al exportar el archivo Excel");
    } finally {
      setExportando(false);
    }
  };

  return {
    exportando,
    exportarExcel
  };
};