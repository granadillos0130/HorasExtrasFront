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
    worksheet.addRow(headers);

    // Estilos de encabezado
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF4F81BD" },
      };
      cell.alignment = { horizontal: "center" };
      cell.border = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // Agregar datos de trabajadores
    data.trabajadores.forEach((t) => {
      worksheet.addRow([
        t.nombreTrabajador,
        t.totalHoras,
        t.horasNormales,
        t.horasExtrasDiurnas,
        t.horasExtrasNocturnas,
        t.extrasDominicalesDiurnas,
        t.extrasDominicalesNocturnas,
      ]);
    });

    // Estilo para filas de datos
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return;
      row.eachCell((cell) => {
        cell.alignment = { horizontal: "center" };
        cell.border = {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });

    // Ajustar tamaño de columnas
    worksheet.columns.forEach((col) => {
      col.width = 20;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Estadisticas_${data.centroNombre}.xlsx`);
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
