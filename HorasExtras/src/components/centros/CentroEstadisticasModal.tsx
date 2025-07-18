import React from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import type { CentroEstadisticas } from "../../types/centros";
import "../../styles/components/CentroEstadisticasModal.css";

interface Props {
  visible: boolean;
  onClose: () => void;
  data: CentroEstadisticas | null;
}

const CentroEstadisticasModal: React.FC<Props> = ({ visible, onClose, data }) => {
  if (!visible || !data) return null;

  const exportarExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Estadísticas");

    // Configurar propiedades del documento
    workbook.creator = "Sistema de Horas Extras";
    workbook.lastModifiedBy = "Sistema de Horas Extras";
    workbook.created = new Date();
    workbook.modified = new Date();


    try {
      // Si tienes el logo como archivo, puedes cargarlo así:
      const logoBuffer = await fetch('/path/to/your/logo.png').then(res => res.arrayBuffer());
      const logoId = workbook.addImage({
        buffer: logoBuffer,
        extension: 'png',
      });
      
      // Por ahora, crearemos un diseño sin imagen física pero con colores corporativos
    } catch (error) {
      console.warn('No se pudo cargar el logo');
    }

    // Configurar ancho de columnas
    worksheet.columns = [
      { width: 25 }, // Nombre del Trabajador
      { width: 15 }, // Horas Totales
      { width: 12 }, // Normales
      { width: 15 }, // Extras Diurnas
      { width: 15 }, // Extras Nocturnas
      { width: 12 }, // Dom. Día
      { width: 12 }, // Dom. Noche
    ];

    // Agregar título principal con estilo corporativo
    worksheet.mergeCells('A1:G1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = '📊 ESTADÍSTICAS DE HORAS EXTRAS';
    titleCell.font = { 
      size: 18, 
      bold: true, 
      color: { argb: 'FFFFFFFF' } 
    };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF228B22' }, // Verde corporativo
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

    // Información del centro
    worksheet.mergeCells('A3:G3');
    const centroCell = worksheet.getCell('A3');
    centroCell.value = `Centro: ${data.centroNombre} | ID: ${data.centroId}`;
    centroCell.font = { 
      size: 14, 
      bold: true, 
      color: { argb: 'FF228B22' } 
    };
    centroCell.alignment = { horizontal: 'center' };

    worksheet.mergeCells('A4:G4');
    const horarioCell = worksheet.getCell('A4');
    horarioCell.value = `Horario: ${data.horaInicio} - ${data.horaFinal} | Total trabajadores: ${data.totalTrabajadores} | Mano de obra total: ${data.manoDeObraTotal} horas`;
    horarioCell.font = { 
      size: 12, 
      italic: true, 
      color: { argb: 'FF666666' } 
    };
    horarioCell.alignment = { horizontal: 'center' };

    // Agregar fecha de generación
    worksheet.mergeCells('A5:G5');
    const fechaCell = worksheet.getCell('A5');
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
    const startRow = 7;

    // Encabezados de la tabla
    const headers = [
      "Nombre del Trabajador",
      "Horas Totales",
      "Normales",
      "Extras Diurnas",
      "Extras Nocturnas",
      "Dom. Día",
      "Dom. Noche",
    ];

    // Agregar encabezados
    worksheet.insertRow(startRow, headers);

    // Estilos de encabezado con gradiente
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
        fgColor: { argb: 'FF32CD32' }, // Verde más claro
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
    data.trabajadores.forEach((t, index) => {
      const rowData = [
        t.nombreTrabajador,
        t.totalHoras,
        t.horasNormales,
        t.horasExtrasDiurnas,
        t.horasExtrasNocturnas,
        t.extrasDominicalesDiurnas,
        t.extrasDominicalesNocturnas,
      ];
      
      const currentRow = startRow + 1 + index;
      worksheet.insertRow(currentRow, rowData);
      
      // Estilo para filas de datos con colores alternos
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
        
        // Colores alternos para las filas
        if (index % 2 === 0) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF8FFF8' }, // Verde muy claro
          };
        }
        
        // Formato para números
        if (colNumber > 1) {
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
            bold: true,
            color: { argb: 'FF333333' }
          };
        }
      });
    });

    // Agregar fila de totales
    const totalRow = startRow + 1 + data.trabajadores.length;
    const totales = [
      'TOTALES',
      data.trabajadores.reduce((sum, t) => sum + t.totalHoras, 0),
      data.trabajadores.reduce((sum, t) => sum + t.horasNormales, 0),
      data.trabajadores.reduce((sum, t) => sum + t.horasExtrasDiurnas, 0),
      data.trabajadores.reduce((sum, t) => sum + t.horasExtrasNocturnas, 0),
      data.trabajadores.reduce((sum, t) => sum + t.extrasDominicalesDiurnas, 0),
      data.trabajadores.reduce((sum, t) => sum + t.extrasDominicalesNocturnas, 0),
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
      
      if (colNumber > 1 && typeof cell.value === 'number') {
        cell.numFmt = '#,##0.00';
      }
    });

    // Agregar pie de página
    const footerRow = totalRow + 2;
    worksheet.mergeCells(`A${footerRow}:G${footerRow}`);
    const footerCell = worksheet.getCell(`A${footerRow}`);
    footerCell.value = '© Sistema de Gestión de Horas Extras - Reporte generado automáticamente';
    footerCell.font = { 
      size: 9, 
      italic: true, 
      color: { argb: 'FF888888' } 
    };
    footerCell.alignment = { horizontal: 'center' };

    // Configurar vista de impresión
    worksheet.pageSetup = {
      orientation: 'landscape',
      paperSize: 9, // A4
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
    worksheet.headerFooter.oddHeader = '&C&16&B📊 ESTADÍSTICAS DE HORAS EXTRAS';
    worksheet.headerFooter.oddFooter = '&L&D &T&C&P de &N&R© Sistema de Gestión';

    // Generar y descargar el archivo
    const buffer = await workbook.xlsx.writeBuffer();
    const fecha = new Date().toISOString().split('T')[0];
    saveAs(new Blob([buffer]), `Estadisticas_${data.centroNombre}_${fecha}.xlsx`);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>📊 Estadísticas - {data.centroNombre}</h2>
        <p><strong>ID:</strong> {data.centroId}</p>
        <p><strong>Horario:</strong> {data.horaInicio} - {data.horaFinal}</p>
        <p><strong>Total trabajadores:</strong> {data.totalTrabajadores}</p>
        <p><strong>Mano de obra total:</strong> {data.manoDeObraTotal} horas</p>

        <h3>🧍‍♂️ Detalle por trabajador:</h3>
        <table className="estadisticas-tabla">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Horas Totales</th>
              <th>Normales</th>
              <th>ED</th>
              <th>EN</th>
              <th>Dom. Día</th>
              <th>Dom. Noche</th>
            </tr>
          </thead>
          <tbody>
            {data.trabajadores.map(t => (
              <tr key={t.trabajadorId}>
                <td>{t.nombreTrabajador}</td>
                <td>{t.totalHoras}</td>
                <td>{t.horasNormales}</td>
                <td>{t.horasExtrasDiurnas}</td>
                <td>{t.horasExtrasNocturnas}</td>
                <td>{t.extrasDominicalesDiurnas}</td>
                <td>{t.extrasDominicalesNocturnas}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="modal-buttons">
          <button className="btn-exportar" onClick={exportarExcel}>📤 Exportar Excel</button>
          <button className="btn-cerrar" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
};

export default CentroEstadisticasModal;