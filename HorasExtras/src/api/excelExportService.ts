import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { formatearMoneda, formatearHoras, formatearFecha } from '../utils/formatters';
import type { TrabajadorInfo, TrabajadorManoObra, DetalleDias } from '../types/ejecucion';
import type { TrabajadoresPorTipoHora, TipoHora } from '../types/centros';
import { TIPOS_HORAS_CONFIG } from '../constants/tiposHoras';

export class ExcelExportService {
  static async exportarTrabajadores(
    trabajadores: TrabajadorInfo[],
    trabajadoresManoObra: TrabajadorManoObra[],
    centroNombre: string,
    centroId: string,
    mes: string,
    año: number,
    manoObraTotal?: number
  ) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Información Ejecución");

    workbook.creator = "Sistema de Horas Extras";
    workbook.lastModifiedBy = "Sistema de Horas Extras";
    workbook.created = new Date();
    workbook.modified = new Date();

    worksheet.columns = [
      { width: 8 }, { width: 30 }, { width: 20 }, { width: 20 },
    ];

    // Título
    worksheet.mergeCells('A1:D1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = '📈 INFORMACIÓN DE EJECUCIÓN';
    titleCell.font = { size: 18, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF228B22' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Info del centro
    worksheet.mergeCells('A3:D3');
    const centroCell = worksheet.getCell('A3');
    centroCell.value = `Centro: ${centroNombre} | ID: ${centroId}`;
    centroCell.font = { size: 14, bold: true, color: { argb: 'FF228B22' } };
    centroCell.alignment = { horizontal: 'center' };

    // Período
    worksheet.mergeCells('A4:D4');
    const periodoCell = worksheet.getCell('A4');
    periodoCell.value = `Período: ${mes} ${año} | Total trabajadores: ${trabajadores.length}`;
    periodoCell.font = { size: 12, italic: true, color: { argb: 'FF666666' } };
    periodoCell.alignment = { horizontal: 'center' };

    if (manoObraTotal) {
      worksheet.mergeCells('A5:D5');
      const manoObraCell = worksheet.getCell('A5');
      manoObraCell.value = `Mano de Obra Total del Centro: ${formatearMoneda(manoObraTotal)}`;
      manoObraCell.font = { size: 12, bold: true, color: { argb: 'FF10b981' } };
      manoObraCell.alignment = { horizontal: 'center' };
    }

    const startRow = 8;
    const headers = ["ID Trabajador", "Nombre del Trabajador", "Cargo", "Mano de Obra"];
    worksheet.insertRow(startRow, headers);

    const headerRow = worksheet.getRow(startRow);
    headerRow.height = 25;
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF32CD32' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    // Datos
    trabajadores.forEach((trabajador, index) => {
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
        
        if (index % 2 === 0) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FFF8' } };
        }
        
        cell.font = { size: 11, color: { argb: 'FF333333' } };
        if (colNumber === 4 && typeof cell.value === 'number') {
          cell.numFmt = '"$"#,##0';
        }
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const fecha = new Date().toISOString().split('T')[0];
    const nombreArchivo = `Ejecucion_${centroNombre.replace(/\s+/g, '_')}_${mes}_${año}_${fecha}.xlsx`;
    saveAs(new Blob([buffer]), nombreArchivo);
  }

  static async exportarTrabajadoresPorTipo(
    trabajadoresPorTipo: TrabajadoresPorTipoHora,
    tipoHora: TipoHora,
    centroNombre: string,
    mes: string,
    año: number
  ) {
    const config = TIPOS_HORAS_CONFIG[tipoHora];
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
    centroCell.value = `Centro: ${centroNombre} | ${mes} ${año}`;
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
    const nombreArchivo = `${config.nombre.replace(/\s+/g, '_')}_${centroNombre.replace(/\s+/g, '_')}_${mes}_${año}_${fecha}.xlsx`;
    saveAs(new Blob([buffer]), nombreArchivo);
  }

  static async exportarDetalle(
    detalle: DetalleDias,
    centroNombre: string,
    mes: string,
    año: number
  ) {
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
    trabajadorCell.value = `Trabajador: ${detalle.nombreTrabajador} | ID: ${detalle.trabajadorId}`;
    trabajadorCell.font = { size: 14, bold: true, color: { argb: 'FF3b82f6' } };
    trabajadorCell.alignment = { horizontal: 'center' };

    worksheet.mergeCells('A4:G4');
    const centroCell = worksheet.getCell('A4');
    centroCell.value = `Centro: ${centroNombre} | ${mes} ${año}`;
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
    detalle.detalleDias.forEach((dia, index) => {
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
        
        if (colNumber > 1) {
          cell.numFmt = '0.00';
        }
      });
    });

    // Fila de totales
    const totalRow = startRow + 1 + detalle.detalleDias.length;
    const totales = [
      'TOTALES',
      detalle.detalleDias.reduce((sum, d) => sum + d.horasNormales, 0),
      detalle.detalleDias.reduce((sum, d) => sum + d.extrasDiurnas, 0),
      detalle.detalleDias.reduce((sum, d) => sum + d.extrasNocturnas, 0),
      detalle.detalleDias.reduce((sum, d) => sum + d.dominicalesDiurnas, 0),
      detalle.detalleDias.reduce((sum, d) => sum + d.dominicalesNocturnas, 0),
      detalle.detalleDias.reduce((sum, d) => sum + d.totalHoras, 0)
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
    const nombreArchivo = `Detalle_${detalle.nombreTrabajador.replace(/\s+/g, '_')}_${centroNombre.replace(/\s+/g, '_')}_${mes}_${año}_${fecha}.xlsx`;
    saveAs(new Blob([buffer]), nombreArchivo);
  }
}