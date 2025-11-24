import { useState } from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { registrosService } from '../api/registrosService';
import type { Registro } from '../types/registros';

export const useExportExcel = () => {
  const [exportando, setExportando] = useState(false);

  const obtenerRegistrosDelMes = async (año: number, mes: number): Promise<Registro[]> => {
    const diasEnMes = new Date(año, mes, 0).getDate();
    const todosLosRegistros: Registro[] = [];

    for (let dia = 1; dia <= diasEnMes; dia++) {
      const fechaString = `${año}-${mes.toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`;
      try {
        const registrosDia = await registrosService.obtenerTodosPorFecha(fechaString);
        todosLosRegistros.push(...registrosDia);
      } catch (error) {
        console.error(`Error al obtener registros del día ${fechaString}:`, error);
      }
    }

    return todosLosRegistros;
  };

  const exportarExcelMes = async (
    año: number,
    mes: number,
    nombreMes: string
  ): Promise<boolean> => {
    setExportando(true);
    try {
      const registrosDelMes = await obtenerRegistrosDelMes(año, mes);

      if (registrosDelMes.length === 0) {
        alert("No hay registros para exportar en este mes");
        return false;
      }

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Registros del Mes");

      // Configurar propiedades del documento
      workbook.creator = "Sistema de Horas Extras";
      workbook.lastModifiedBy = "Sistema de Horas Extras";
      workbook.created = new Date();
      workbook.modified = new Date();

      // Configurar ancho de columnas
      worksheet.columns = [
        { width: 25 }, { width: 20 }, { width: 12 }, { width: 12 },
        { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 },
        { width: 15 }, { width: 15 }, { width: 12 }, { width: 12 },
        { width: 12 }, { width: 12 },
      ];

      // Título principal
      worksheet.mergeCells('A1:N1');
      const titleCell = worksheet.getCell('A1');
      titleCell.value = '📊 REPORTE MENSUAL DE REGISTROS';
      titleCell.font = { size: 18, bold: true, color: { argb: 'FFFFFFFF' } };
      titleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF228B22' },
      };
      titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
      titleCell.border = {
        top: { style: 'thick', color: { argb: 'FF32CD32' } },
        bottom: { style: 'thick', color: { argb: 'FF32CD32' } },
        left: { style: 'thick', color: { argb: 'FF32CD32' } },
        right: { style: 'thick', color: { argb: 'FF32CD32' } },
      };

      // Información del período
      worksheet.mergeCells('A3:N3');
      const periodoCell = worksheet.getCell('A3');
      periodoCell.value = `Período: ${nombreMes} ${año} | Total de registros: ${registrosDelMes.length}`;
      periodoCell.font = { size: 14, bold: true, color: { argb: 'FF228B22' } };
      periodoCell.alignment = { horizontal: 'center' };

      // Estadísticas generales
      const totalHorasNormales = registrosDelMes.reduce((sum, r) => sum + r.horasNormales, 0);
      const totalHorasExtrasDiurnas = registrosDelMes.reduce((sum, r) => sum + r.horasExtrasDiurnas, 0);
      const totalHorasExtrasNocturnas = registrosDelMes.reduce((sum, r) => sum + r.horasExtrasNocturnas, 0);
      const totalHorasExtras = totalHorasExtrasDiurnas + totalHorasExtrasNocturnas;
      const totalHorasGenerales = registrosDelMes.reduce((sum, r) => sum + r.totalHoras, 0);

      worksheet.mergeCells('A4:N4');
      const estadisticasCell = worksheet.getCell('A4');
      estadisticasCell.value = `Total horas: ${totalHorasGenerales.toFixed(2)} | Normales: ${totalHorasNormales.toFixed(2)} | Extras: ${totalHorasExtras.toFixed(2)} | Diurnas: ${totalHorasExtrasDiurnas.toFixed(2)} | Nocturnas: ${totalHorasExtrasNocturnas.toFixed(2)}`;
      estadisticasCell.font = { size: 12, italic: true, color: { argb: 'FF666666' } };
      estadisticasCell.alignment = { horizontal: 'center' };

      // Fecha de generación
      worksheet.mergeCells('A5:N5');
      const fechaCell = worksheet.getCell('A5');
      fechaCell.value = `Generado el: ${new Date().toLocaleDateString('es-ES', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      })}`;
      fechaCell.font = { size: 10, color: { argb: 'FF666666' } };
      fechaCell.alignment = { horizontal: 'center' };

      const startRow = 7;

      // Encabezados
      const headers = [
        "Trabajador", "Centro", "Fecha", "Día Semana", "Hora Ingreso", "Hora Salida",
        "Horas Totales", "Normales", "Extras Diurnas", "Extras Nocturnas",
        "Dom. Diurnas", "Dom. Nocturnas", "Desp. Ida", "Desp. Regreso",
      ];

      worksheet.insertRow(startRow, headers);

      // Estilos de encabezado
      const headerRow = worksheet.getRow(startRow);
      headerRow.height = 25;
      headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF32CD32' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
          top: { style: 'medium', color: { argb: 'FF228B22' } },
          bottom: { style: 'medium', color: { argb: 'FF228B22' } },
          left: { style: 'thin', color: { argb: 'FF228B22' } },
          right: { style: 'thin', color: { argb: 'FF228B22' } },
        };
      });

      // Ordenar registros
      const registrosOrdenados = registrosDelMes.sort((a, b) => {
        const fechaComparison = a.fecha.localeCompare(b.fecha);
        if (fechaComparison !== 0) return fechaComparison;
        return a.trabajadorNombre.localeCompare(b.trabajadorNombre);
      });

      // Helpers
      const formatearHora = (timeString: string) => timeString?.substring(0, 5) || "--:--";
      const formatearFecha = (fecha: string) => new Date(fecha + 'T00:00:00').toLocaleDateString('es-ES');

      // Agregar datos
      registrosOrdenados.forEach((registro, index) => {
        const rowData = [
          registro.trabajadorNombre || `Trabajador ${registro.trabajadorId}`,
          registro.nombreCentro || `Centro ${registro.centroId}`,
          formatearFecha(registro.fecha),
          registro.diaSemana,
          formatearHora(registro.horaIngreso),
          formatearHora(registro.horaSalida),
          registro.totalHoras,
          registro.horasNormales,
          registro.horasExtrasDiurnas,
          registro.horasExtrasNocturnas,
          registro.extrasDominicalesDiurnas,
          registro.extrasDominicalesNocturnas,
          registro.desplazamientoIda ? formatearHora(registro.desplazamientoIda) : "--:--",
          registro.desplazamientoRegreso ? formatearHora(registro.desplazamientoRegreso) : "--:--",
        ];

        const currentRow = startRow + 1 + index;
        worksheet.insertRow(currentRow, rowData);

        const dataRow = worksheet.getRow(currentRow);
        dataRow.height = 20;

        dataRow.eachCell((cell, colNumber) => {
          cell.alignment = {
            horizontal: colNumber <= 4 ? 'left' : 'center',
            vertical: 'middle'
          };
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
            bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
            left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
            right: { style: 'thin', color: { argb: 'FFCCCCCC' } },
          };

          if (index % 2 === 0) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FFF8' } };
          }

          if (colNumber >= 7 && colNumber <= 12) {
            cell.font = { size: 10, color: { argb: 'FF333333' } };
            if (typeof cell.value === 'number' && cell.value > 0) {
              cell.numFmt = '#,##0.00';
            }
          } else {
            cell.font = { size: 10, color: { argb: 'FF333333' } };
          }
        });
      });

      // Fila de totales
      const totalRow = startRow + 1 + registrosOrdenados.length;
      const totales = [
        'TOTALES',
        `${new Set(registrosOrdenados.map(r => r.nombreCentro)).size} Centro(s)`,
        '', '', '', '',
        totalHorasGenerales,
        totalHorasNormales,
        totalHorasExtrasDiurnas,
        totalHorasExtrasNocturnas,
        registrosOrdenados.reduce((sum, r) => sum + r.extrasDominicalesDiurnas, 0),
        registrosOrdenados.reduce((sum, r) => sum + r.extrasDominicalesNocturnas, 0),
        '', '',
      ];

      worksheet.insertRow(totalRow, totales);
      const totalRowObj = worksheet.getRow(totalRow);
      totalRowObj.height = 25;
      totalRowObj.eachCell((cell, colNumber) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF228B22' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
          top: { style: 'medium', color: { argb: 'FF006400' } },
          bottom: { style: 'medium', color: { argb: 'FF006400' } },
          left: { style: 'thin', color: { argb: 'FF006400' } },
          right: { style: 'thin', color: { argb: 'FF006400' } },
        };

        if (colNumber >= 7 && colNumber <= 12 && typeof cell.value === 'number') {
          cell.numFmt = '#,##0.00';
        }
      });

      // Pie de página
      const footerRow = totalRow + 2;
      worksheet.mergeCells(`A${footerRow}:N${footerRow}`);
      const footerCell = worksheet.getCell(`A${footerRow}`);
      footerCell.value = '© Sistema de Gestión de Horas Extras - Reporte mensual generado automáticamente';
      footerCell.font = { size: 9, italic: true, color: { argb: 'FF888888' } };
      footerCell.alignment = { horizontal: 'center' };

      // Configurar impresión
      worksheet.pageSetup = {
        orientation: 'landscape',
        paperSize: 9,
        fitToPage: true,
        fitToHeight: 0,
        fitToWidth: 1,
        margins: { left: 0.5, right: 0.5, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3 },
      };

      worksheet.headerFooter.oddHeader = '&C&16&B📊 REPORTE MENSUAL DE REGISTROS';
      worksheet.headerFooter.oddFooter = '&L&D &T&C&P de &N&R© Sistema de Gestión';

      // Generar y descargar
      const buffer = await workbook.xlsx.writeBuffer();
      const nombreArchivo = `Registros_${nombreMes}_${año}_${new Date().toISOString().split('T')[0]}.xlsx`;
      saveAs(new Blob([buffer]), nombreArchivo);

      alert(`✅ Excel exportado exitosamente: ${nombreArchivo}`);
      return true;

    } catch (error) {
      console.error("Error al exportar Excel:", error);
      alert("❌ Error al exportar el archivo Excel");
      return false;
    } finally {
      setExportando(false);
    }
  };

  return {
    exportando,
    exportarExcelMes
  };
};