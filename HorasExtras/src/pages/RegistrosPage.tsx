import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { registrosService } from "../api/registrosService";
import { trabajadoresService } from "../api/trabajadoresService";
import type { Registro } from "../types/registros";
import type  { Trabajador } from "../types/trabajadores";

interface EstadisticaDia {
  fecha: string;
  totalTrabajadores: number;
  trabajadoresConRegistro: number;
  porcentaje: number;
  registros: Registro[];
}

const RegistrosPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [añoSeleccionado, setAñoSeleccionado] = useState<number>(new Date().getFullYear());
  const [mesSeleccionado, setMesSeleccionado] = useState<number | null>(null);
  const [diaSeleccionado, setDiaSeleccionado] = useState<string | null>(null);
  const [registrosDelDia, setRegistrosDelDia] = useState<Registro[]>([]);
  const [loading, setLoading] = useState(false);
  const [exportandoExcel, setExportandoExcel] = useState(false);
  const [trabajadoresActivos, setTrabajadoresActivos] = useState<Trabajador[]>([]);
  const [estadisticasMes, setEstadisticasMes] = useState<Map<string, EstadisticaDia>>(new Map());
  const [cargandoEstadisticas, setCargandoEstadisticas] = useState(false);
  const [centroSeleccionado, setCentroSeleccionado] = useState<string | null>(null);
  
  // Estados para mensajes de éxito
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successType, setSuccessType] = useState<string>('');

  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  // ✅ FIX: Wrap in useCallback to avoid dependency issues
  const cargarEstadisticasDelMes = useCallback(async () => {
    if (mesSeleccionado === null) return;

    setCargandoEstadisticas(true);
    try {
      const diasEnMes = new Date(añoSeleccionado, mesSeleccionado, 0).getDate();
      const estadisticas = new Map<string, EstadisticaDia>();
      
      for (let dia = 1; dia <= diasEnMes; dia++) {
        const fechaString = `${añoSeleccionado}-${mesSeleccionado.toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`;
        
        try {
          const registrosDia = await registrosService.obtenerTodosPorFecha(fechaString);
          
          // Obtener IDs únicos de trabajadores que tienen registro ese día
          const trabajadoresConRegistro = new Set(registrosDia.map(r => r.trabajadorId));
          const cantidadConRegistro = trabajadoresConRegistro.size;
          const totalTrabajadores = trabajadoresActivos.length;
          const porcentaje = totalTrabajadores > 0 ? (cantidadConRegistro / totalTrabajadores) * 100 : 0;

          estadisticas.set(fechaString, {
            fecha: fechaString,
            totalTrabajadores,
            trabajadoresConRegistro: cantidadConRegistro,
            porcentaje,
            registros: registrosDia
          });
        } catch {
          // ✅ FIX: Use underscore prefix to indicate intentionally unused
          // Si no hay registros para ese día, porcentaje = 0
          estadisticas.set(fechaString, {
            fecha: fechaString,
            totalTrabajadores: trabajadoresActivos.length,
            trabajadoresConRegistro: 0,
            porcentaje: 0,
            registros: []
          });
        }
      }
      
      setEstadisticasMes(estadisticas);
    } catch (error) {
      console.error("Error al cargar estadísticas del mes:", error);
    } finally {
      setCargandoEstadisticas(false);
    }
  }, [mesSeleccionado, añoSeleccionado, trabajadoresActivos]);

  // ✅ FIX: Wrap in useCallback for consistent reference
  const obtenerRegistrosDelDia = useCallback(async (fecha: string) => {
    try {
      setLoading(true);
      const registros = await registrosService.obtenerTodosPorFecha(fecha);
      setRegistrosDelDia(registros);
    } catch (error) {
      console.error("Error al obtener registros:", error);
      setRegistrosDelDia([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Manejar mensajes de éxito al regresar de crear registros
  useEffect(() => {
    const success = searchParams.get('success');
    if (success) {
      setSuccessType(success);
      setShowSuccessMessage(true);
      
      // Limpiar el parámetro de la URL
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('success');
      setSearchParams(newSearchParams, { replace: true });
      
      // Ocultar mensaje después de 4 segundos
      setTimeout(() => setShowSuccessMessage(false), 4000);

      // Recargar estadísticas y datos
      if (mesSeleccionado !== null) {
        cargarEstadisticasDelMes();
      }
      if (diaSeleccionado) {
        obtenerRegistrosDelDia(diaSeleccionado);
      }
    }
  }, [searchParams, mesSeleccionado, diaSeleccionado, setSearchParams, cargarEstadisticasDelMes, obtenerRegistrosDelDia]); // ✅ FIX: Added missing dependencies

  // Cargar trabajadores activos al iniciar
  useEffect(() => {
    const cargarTrabajadoresActivos = async () => {
      try {
        const todos = await trabajadoresService.getAll();
        const activos = todos.filter(t => t.estado === "Vigente");
        setTrabajadoresActivos(activos);
      } catch (error) {
        console.error("Error al cargar trabajadores activos:", error);
      }
    };

    cargarTrabajadoresActivos();
  }, []);

  // Cargar estadísticas cuando se selecciona un mes
  useEffect(() => {
    if (mesSeleccionado !== null && trabajadoresActivos.length > 0) {
      cargarEstadisticasDelMes();
    }
  }, [mesSeleccionado, añoSeleccionado, trabajadoresActivos, cargarEstadisticasDelMes]); // ✅ FIX: Added missing dependency

  // Función para navegar a los formularios
  const navigateToForm = (tipo: 'individual' | 'lote') => {
    const searchParams = new URLSearchParams();
    
    if (diaSeleccionado) {
      searchParams.set('fecha', diaSeleccionado);
    }
    searchParams.set('return', '/registros');
    
    const targetPath = tipo === 'individual' 
      ? `/registros/nuevo?${searchParams.toString()}`
      : `/registros/lote?${searchParams.toString()}`;
      
    navigate(targetPath);
  };

  // Función para agrupar registros por centro
  const agruparRegistrosPorCentro = (registros: Registro[]) => {
    const centrosMap = new Map<string, { 
      nombreCentro: string; 
      centroId: string; 
      trabajadores: Registro[] 
    }>();

    registros.forEach(registro => {
      // Manejar centroId null o undefined
      const centroKey = registro.centroId?.toString() || 'sin-centro';
      
      if (!centrosMap.has(centroKey)) {
        centrosMap.set(centroKey, {
          nombreCentro: registro.nombreCentro || (registro.centroId ? `Centro ${registro.centroId}` : 'Sin Centro Asignado'),
          centroId: registro.centroId?.toString() || 'sin-centro',
          trabajadores: []
        });
      }
      centrosMap.get(centroKey)?.trabajadores.push(registro);
    });

    return Array.from(centrosMap.values());
  };

  const obtenerColorDia = (dia: number): { background: string, color: string, border: string } => {
    if (mesSeleccionado === null) {
      return {
        background: 'linear-gradient(135deg, #f8fafb, #ffffff)',
        color: '#333',
        border: '#e1e8ed'
      };
    }

    const fechaString = `${añoSeleccionado}-${mesSeleccionado.toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`;
    const estadistica = estadisticasMes.get(fechaString);

    if (!estadistica) {
      return {
        background: 'linear-gradient(135deg, #f8fafb, #ffffff)',
        color: '#333',
        border: '#e1e8ed'
      };
    }

    const { porcentaje } = estadistica;

    if (porcentaje === 0) {
      // Rojo - Sin registros
      return {
        background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
        color: '#dc2626',
        border: '#fca5a5'
      };
    } else if (porcentaje < 100) {
      // Naranja - Registros parciales
      return {
        background: 'linear-gradient(135deg, #fed7aa, #fdba74)',
        color: '#ea580c',
        border: '#fb923c'
      };
    } else {
      // Verde - Registros completos
      return {
        background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
        color: '#16a34a',
        border: '#86efac'
      };
    }
  };

  const obtenerDiasDelMes = (año: number, mes: number) => {
    const diasEnMes = new Date(año, mes, 0).getDate();
    const primerDia = new Date(año, mes - 1, 1).getDay();
    
    const dias = [];
    
    // Espacios en blanco para días anteriores al primer día del mes
    for (let i = 0; i < primerDia; i++) {
      dias.push(null);
    }
    
    // Días del mes
    for (let dia = 1; dia <= diasEnMes; dia++) {
      dias.push(dia);
    }
    
    return dias;
  };

  // Función para obtener todos los registros del mes
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

  // Función para exportar Excel del mes
  const exportarExcelMes = async () => {
    if (mesSeleccionado === null) return;

    setExportandoExcel(true);
    try {
      const registrosDelMes = await obtenerRegistrosDelMes(añoSeleccionado, mesSeleccionado);
      
      if (registrosDelMes.length === 0) {
        alert("No hay registros para exportar en este mes");
        return;
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
        { width: 25 }, // Nombre del Trabajador
        { width: 20 }, // Centro
        { width: 12 }, // Fecha
        { width: 12 }, // Día Semana
        { width: 12 }, // Hora Ingreso
        { width: 12 }, // Hora Salida
        { width: 12 }, // Horas Totales
        { width: 12 }, // Normales
        { width: 15 }, // Extras Diurnas
        { width: 15 }, // Extras Nocturnas
        { width: 12 }, // Dom. Día
        { width: 12 }, // Dom. Noche
        { width: 12 }, // Desp. Ida
        { width: 12 }, // Desp. Regreso
      ];

      // Agregar título principal
      worksheet.mergeCells('A1:N1');
      const titleCell = worksheet.getCell('A1');
      titleCell.value = '📊 REPORTE MENSUAL DE REGISTROS';
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

      // Información del período
      worksheet.mergeCells('A3:N3');
      const periodoCell = worksheet.getCell('A3');
      periodoCell.value = `Período: ${meses[mesSeleccionado - 1]} ${añoSeleccionado} | Total de registros: ${registrosDelMes.length}`;
      periodoCell.font = { 
        size: 14, 
        bold: true, 
        color: { argb: 'FF228B22' } 
      };
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
      estadisticasCell.font = { 
        size: 12, 
        italic: true, 
        color: { argb: 'FF666666' } 
      };
      estadisticasCell.alignment = { horizontal: 'center' };

      // Fecha de generación
      worksheet.mergeCells('A5:N5');
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
        "Trabajador",
        "Centro",
        "Fecha",
        "Día Semana",
        "Hora Ingreso",
        "Hora Salida",
        "Horas Totales",
        "Normales",
        "Extras Diurnas",
        "Extras Nocturnas",
        "Dom. Diurnas",
        "Dom. Nocturnas",
        "Desp. Ida",
        "Desp. Regreso",
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
          size: 11
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

      // Ordenar registros por fecha y trabajador
      const registrosOrdenados = registrosDelMes.sort((a, b) => {
        const fechaComparison = a.fecha.localeCompare(b.fecha);
        if (fechaComparison !== 0) return fechaComparison;
        return a.trabajadorNombre.localeCompare(b.trabajadorNombre);
      });

      // Agregar datos de registros
      registrosOrdenados.forEach((registro, index) => {
        const formatearHora = (timeString: string) => {
          return timeString?.substring(0, 5) || "--:--";
        };

        const formatearFecha = (fecha: string) => {
          return new Date(fecha + 'T00:00:00').toLocaleDateString('es-ES');
        };

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
        
        // Estilo para filas de datos
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
          
          // Colores alternos para las filas
          if (index % 2 === 0) {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFF8FFF8' },
            };
          }
          
          // Formato para números
          if (colNumber >= 7 && colNumber <= 12) {
            cell.font = { 
              size: 10,
              color: { argb: 'FF333333' }
            };
            if (typeof cell.value === 'number' && cell.value > 0) {
              cell.numFmt = '#,##0.00';
            }
          } else {
            cell.font = { 
              size: 10,
              color: { argb: 'FF333333' }
            };
          }
        });
      });

      // Agregar fila de totales
      const totalRow = startRow + 1 + registrosOrdenados.length;
      const totales = [
        'TOTALES',
        `${new Set(registrosOrdenados.map(r => r.nombreCentro)).size} Centro(s)`,
        '',
        '',
        '',
        '',
        totalHorasGenerales,
        totalHorasNormales,
        totalHorasExtrasDiurnas,
        totalHorasExtrasNocturnas,
        registrosOrdenados.reduce((sum, r) => sum + r.extrasDominicalesDiurnas, 0),
        registrosOrdenados.reduce((sum, r) => sum + r.extrasDominicalesNocturnas, 0),
        '',
        '',
      ];
      
      worksheet.insertRow(totalRow, totales);
      const totalRowObj = worksheet.getRow(totalRow);
      totalRowObj.height = 25;
      totalRowObj.eachCell((cell, colNumber) => {
        cell.font = { 
          bold: true, 
          color: { argb: 'FFFFFFFF' },
          size: 11
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
        
        if (colNumber >= 7 && colNumber <= 12 && typeof cell.value === 'number') {
          cell.numFmt = '#,##0.00';
        }
      });

      // Agregar pie de página
      const footerRow = totalRow + 2;
      worksheet.mergeCells(`A${footerRow}:N${footerRow}`);
      const footerCell = worksheet.getCell(`A${footerRow}`);
      footerCell.value = '© Sistema de Gestión de Horas Extras - Reporte mensual generado automáticamente';
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
        fitToHeight: 0,
        fitToWidth: 1,
        margins: {
          left: 0.5,
          right: 0.5,
          top: 0.75,
          bottom: 0.75,
          header: 0.3,
          footer: 0.3,
        },
      };

      // Configurar encabezado y pie de página de impresión
      worksheet.headerFooter.oddHeader = '&C&16&B📊 REPORTE MENSUAL DE REGISTROS';
      worksheet.headerFooter.oddFooter = '&L&D &T&C&P de &N&R© Sistema de Gestión';

      // Generar y descargar el archivo
      const buffer = await workbook.xlsx.writeBuffer();
      const nombreArchivo = `Registros_${meses[mesSeleccionado - 1]}_${añoSeleccionado}_${new Date().toISOString().split('T')[0]}.xlsx`;
      saveAs(new Blob([buffer]), nombreArchivo);

      alert(`✅ Excel exportado exitosamente: ${nombreArchivo}`);

    } catch (error) {
      console.error("Error al exportar Excel:", error);
      alert("❌ Error al exportar el archivo Excel");
    } finally {
      setExportandoExcel(false);
    }
  };

  const seleccionarDia = async (dia: number) => {
    if (mesSeleccionado === null) return;

    const fechaString = `${añoSeleccionado}-${mesSeleccionado.toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`;
    setDiaSeleccionado(fechaString);
    await obtenerRegistrosDelDia(fechaString);
  };

  const cerrarModal = () => {
    setDiaSeleccionado(null);
    setRegistrosDelDia([]);
    setCentroSeleccionado(null);
  };

  const formatearHora = (timeString: string) => {
    return timeString?.substring(0, 5) || "--:--";
  };

  const formatearHoras = (hours: number) => {
    if (hours === 0) return "0:00";
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}:${m.toString().padStart(2, "0")}`;
  };

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    const opciones: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('es-ES', opciones);
  };

  const eliminarRegistro = async (id: number) => {
    if (confirm("¿Estás seguro de eliminar este registro?")) {
      try {
        await registrosService.eliminar(id);
        if (diaSeleccionado) {
          await obtenerRegistrosDelDia(diaSeleccionado);
        }
        // Recargar estadísticas
        if (mesSeleccionado !== null) {
          cargarEstadisticasDelMes();
        }
        alert("Registro eliminado correctamente");
      } catch (error) {
        console.error("Error al eliminar registro:", error);
        alert("Error al eliminar el registro");
      }
    }
  };

  const obtenerTooltipDia = (dia: number): string => {
    if (mesSeleccionado === null) return '';

    const fechaString = `${añoSeleccionado}-${mesSeleccionado.toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`;
    const estadistica = estadisticasMes.get(fechaString);

    if (!estadistica) return '';

    const { totalTrabajadores, trabajadoresConRegistro, porcentaje } = estadistica;
    return `${trabajadoresConRegistro}/${totalTrabajadores} trabajadores (${porcentaje.toFixed(1)}%)`;
  };

  const getSuccessMessage = (type: string) => {
    switch(type) {
      case 'registro-creado':
        return '✅ Registro individual creado exitosamente';
      case 'lote-creado':
        return '✅ Registros en lote creados exitosamente';
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
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
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
          marginBottom: '40px',
          color: 'white'
        }}>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: '700',
            marginBottom: '10px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            📊 Dashboard Global de Registros
          </h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>
            Visualiza todos los registros de todos los trabajadores por día
          </p>
          <div style={{ 
            fontSize: '0.95rem', 
            opacity: 0.8, 
            marginTop: '10px',
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            flexWrap: 'wrap'
          }}>
            <span>🔴 Sin registros (0%)</span>
            <span>🟠 Parcial (1-99%)</span>
            <span>🟢 Completo (100%)</span>
            <span>👥 {trabajadoresActivos.length} trabajadores activos</span>
          </div>
        </div>

        {/* Selector de año */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '30px',
          marginBottom: '30px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ maxWidth: '300px', margin: '0 auto' }}>
            <label style={{
              display: 'block',
              fontWeight: '600',
              color: '#333',
              marginBottom: '15px',
              fontSize: '1.2rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              📅 Selecciona el Año
            </label>
            <select
              value={añoSeleccionado}
              onChange={(e) => {
                setAñoSeleccionado(Number(e.target.value));
                setMesSeleccionado(null);
                setDiaSeleccionado(null);
              }}
              style={{
                width: '100%',
                padding: '15px',
                border: '2px solid #e1e8ed',
                borderRadius: '10px',
                fontSize: '1.2rem',
                background: '#f8fafb',
                cursor: 'pointer',
                textAlign: 'center',
                fontWeight: '600'
              }}
            >
              {[2023, 2024, 2025, 2026, 2027, 2028].map(año => (
                <option key={año} value={año}>{año}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Vista de meses */}
        {mesSeleccionado === null && (
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '30px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{
              textAlign: 'center',
              marginBottom: '30px',
              color: '#333',
              fontSize: '1.8rem',
              fontWeight: '600'
            }}>
              🗓️ Selecciona el Mes - {añoSeleccionado}
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px'
            }}>
              {meses.map((mes, index) => (
                <button
                  key={index}
                  onClick={() => setMesSeleccionado(index + 1)}
                  style={{
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    color: 'white',
                    border: 'none',
                    padding: '20px',
                    borderRadius: '15px',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 15px 35px rgba(102,126,234,0.3)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {mes}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Vista de días del mes */}
        {mesSeleccionado !== null && (
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '30px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '30px',
              flexWrap: 'wrap',
              gap: '15px'
            }}>
              <h2 style={{
                margin: 0,
                color: '#333',
                fontSize: '1.8rem',
                fontWeight: '600'
              }}>
                📅 {meses[mesSeleccionado - 1]} {añoSeleccionado}
                {cargandoEstadisticas && (
                  <span style={{ 
                    fontSize: '1rem', 
                    color: '#666', 
                    marginLeft: '10px' 
                  }}>
                    🔄 Cargando...
                  </span>
                )}
              </h2>
              <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                <button
                  onClick={exportarExcelMes}
                  disabled={exportandoExcel}
                  style={{
                    background: exportandoExcel 
                      ? 'linear-gradient(135deg, #94a3b8, #64748b)' 
                      : 'linear-gradient(135deg, #22c55e, #15803d)',
                    color: 'white',
                    border: 'none',
                    padding: '12px 20px',
                    borderRadius: '10px',
                    cursor: exportandoExcel ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    fontSize: '0.95rem',
                    opacity: exportandoExcel ? 0.7 : 1,
                    transition: 'all 0.3s ease'
                  }}
                >
                  {exportandoExcel ? '⏳ Exportando...' : '📤 Exportar Excel Mes'}
                </button>
                <button
                  onClick={() => setMesSeleccionado(null)}
                  style={{
                    background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
                    color: 'white',
                    border: 'none',
                    padding: '12px 20px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.95rem'
                  }}
                >
                  ← Volver a Meses
                </button>
              </div>
            </div>

            {/* Leyenda de colores */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '20px',
              marginBottom: '20px',
              flexWrap: 'wrap',
              padding: '15px',
              background: '#f8fafb',
              borderRadius: '12px',
              border: '2px solid #e1e8ed'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
                  border: '2px solid #fca5a5',
                  borderRadius: '4px'
                }}></div>
                <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#dc2626' }}>
                  Sin registros (0%)
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  background: 'linear-gradient(135deg, #fed7aa, #fdba74)',
                  border: '2px solid #fb923c',
                  borderRadius: '4px'
                }}></div>
                <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#ea580c' }}>
                  Parcial (1-99%)
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
                  border: '2px solid #86efac',
                  borderRadius: '4px'
                }}></div>
                <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#16a34a' }}>
                  Completo (100%)
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.9rem', color: '#666' }}>
                  👥 {trabajadoresActivos.length} trabajadores activos
                </span>
              </div>
            </div>

            {/* Días de la semana */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '10px',
              marginBottom: '15px'
            }}>
              {diasSemana.map(dia => (
                <div key={dia} style={{
                  background: 'linear-gradient(135deg, #43e97b, #38f9d7)',
                  color: 'white',
                  padding: '10px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  textTransform: 'uppercase'
                }}>
                  {dia}
                </div>
              ))}
            </div>

            {/* Calendario */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '10px'
            }}>
              {obtenerDiasDelMes(añoSeleccionado, mesSeleccionado).map((dia, index) => {
                const colores = dia ? obtenerColorDia(dia) : {
                  background: 'transparent',
                  color: 'transparent',
                  border: 'transparent'
                };
                
                return (
                  <div 
                    key={index} 
                    style={{
                      minHeight: '70px',
                      border: `2px solid ${colores.border}`,
                      borderRadius: '10px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: dia ? 'pointer' : 'default',
                      background: colores.background,
                      fontSize: '1.2rem',
                      fontWeight: '600',
                      color: colores.color,
                      transition: 'all 0.3s ease',
                      position: 'relative'
                    }}
                    onClick={() => dia && seleccionarDia(dia)}
                    title={dia ? obtenerTooltipDia(dia) : ''}
                    onMouseOver={(e) => {
                      if (dia) {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.zIndex = '10';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (dia) {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.zIndex = '1';
                        e.currentTarget.style.boxShadow = 'none';
                      }
                    }}
                  >
                    {dia && (
                      <>
                        <div style={{ fontSize: '1.2rem', fontWeight: '700' }}>
                          {dia}
                        </div>
                        {estadisticasMes.get(`${añoSeleccionado}-${mesSeleccionado.toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`) && (
                          <div style={{ 
                            fontSize: '0.7rem', 
                            fontWeight: '600',
                            marginTop: '2px',
                            opacity: 0.8
                          }}>
                            {(() => {
                              const fechaString = `${añoSeleccionado}-${mesSeleccionado.toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`;
                              const estadistica = estadisticasMes.get(fechaString);
                              if (!estadistica) return '';
                              const { trabajadoresConRegistro, totalTrabajadores } = estadistica;
                              return `${trabajadoresConRegistro}/${totalTrabajadores}`;
                            })()}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Modal del día seleccionado */}
        {diaSeleccionado && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '30px',
              maxWidth: '900px',
              width: '100%',
              maxHeight: '85vh',
              overflowY: 'auto',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '25px',
                paddingBottom: '15px',
                borderBottom: '2px solid #f0f0f0'
              }}>
                <div>
                  <h3 style={{
                    margin: '0 0 5px 0',
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    color: '#333'
                  }}>
                    📅 {formatearFecha(diaSeleccionado + 'T00:00:00')}
                  </h3>
                  {(() => {
                    const estadistica = estadisticasMes.get(diaSeleccionado);
                    if (!estadistica) return null;
                    const { trabajadoresConRegistro, totalTrabajadores, porcentaje } = estadistica;
                    return (
                      <p style={{
                        margin: 0,
                        fontSize: '0.9rem',
                        color: '#666'
                      }}>
                        👥 {trabajadoresConRegistro} de {totalTrabajadores} trabajadores ({porcentaje.toFixed(1)}%)
                      </p>
                    );
                  })()}
                </div>
                <button
                  onClick={cerrarModal}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    color: '#666'
                  }}
                >
                  ❌
                </button>
              </div>

              {loading ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px',
                  fontSize: '1.2rem',
                  color: '#667eea'
                }}>
                  🔄 Consultando registros del día...
                </div>
              ) : registrosDelDia.length > 0 ? (
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '25px',
                    padding: '15px 20px',
                    background: 'linear-gradient(135deg, #43e97b, #38f9d7)',
                    color: 'white',
                    borderRadius: '12px'
                  }}>
                    <h4 style={{ margin: 0, fontSize: '1.2rem' }}>
                      ✅ {registrosDelDia.length} Registro{registrosDelDia.length !== 1 ? 's' : ''} Encontrado{registrosDelDia.length !== 1 ? 's' : ''}
                    </h4>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => navigateToForm('individual')}
                        style={{
                          background: 'rgba(255,255,255,0.2)',
                          color: 'white',
                          border: '1px solid rgba(255,255,255,0.3)',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '0.9rem',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        ➕ Nuevo Registro
                      </button>
                      <button
                        onClick={() => navigateToForm('lote')}
                        style={{
                          background: 'rgba(255,255,255,0.2)',
                          color: 'white',
                          border: '1px solid rgba(255,255,255,0.3)',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '0.9rem',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        📊 Lote
                      </button>
                    </div>
                  </div>

                  {/* Vista por centros o trabajadores */}
                  {centroSeleccionado === null ? (
                    // VISTA DE CENTROS
                    <div>
                      <div style={{
                        marginBottom: '20px',
                        padding: '15px',
                        background: '#f0f9ff',
                        borderRadius: '12px',
                        border: '2px solid #bfdbfe',
                        textAlign: 'center'
                      }}>
                        <h4 style={{ margin: '0 0 10px 0', color: '#1d4ed8' }}>
                          🏢 Centros con Registros
                        </h4>
                        <p style={{ margin: 0, color: '#3730a3', fontSize: '0.9rem' }}>
                          Haz clic en un centro para ver los trabajadores
                        </p>
                      </div>

                      <div style={{
                        display: 'grid',
                        gap: '15px',
                        maxHeight: '400px',
                        overflowY: 'auto',
                        padding: '10px'
                      }}>
                        {agruparRegistrosPorCentro(registrosDelDia).map((centro) => (
                          <div 
                            key={centro.centroId} 
                            onClick={() => setCentroSeleccionado(centro.centroId)}
                            style={{
                              background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
                              color: 'white',
                              padding: '25px',
                              borderRadius: '15px',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)',
                              border: '2px solid transparent'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.transform = 'translateY(-3px)';
                              e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.3)';
                              e.currentTarget.style.borderColor = '#60a5fa';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.2)';
                              e.currentTarget.style.borderColor = 'transparent';
                            }}
                          >
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}>
                              <div>
                                <h5 style={{
                                  margin: '0 0 10px 0',
                                  fontSize: '1.3rem',
                                  fontWeight: '700'
                                }}>
                                  🏢 {centro.nombreCentro}
                                </h5>
                                <p style={{
                                  margin: 0,
                                  fontSize: '1rem',
                                  opacity: 0.9
                                }}>
                                  👥 {centro.trabajadores.length} trabajador{centro.trabajadores.length !== 1 ? 'es' : ''} con registro
                                </p>
                              </div>
                              <div style={{
                                background: 'rgba(255,255,255,0.2)',
                                padding: '10px 15px',
                                borderRadius: '20px',
                                fontSize: '1.5rem'
                              }}>
                                ➡️
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    // VISTA DE TRABAJADORES DEL CENTRO SELECCIONADO
                    <div>
                      {(() => {
                        const centroData = agruparRegistrosPorCentro(registrosDelDia).find(c => c.centroId === centroSeleccionado);
                        if (!centroData) return null;

                        return (
                          <div>
                            <div style={{
                              marginBottom: '20px',
                              padding: '15px 20px',
                              background: 'linear-gradient(135deg, #22c55e, #15803d)',
                              color: 'white',
                              borderRadius: '12px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}>
                              <div>
                                <h4 style={{ margin: '0 0 5px 0', fontSize: '1.2rem' }}>
                                  🏢 {centroData.nombreCentro}
                                </h4>
                                <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>
                                  👥 {centroData.trabajadores.length} trabajador{centroData.trabajadores.length !== 1 ? 'es' : ''} registrado{centroData.trabajadores.length !== 1 ? 's' : ''}
                                </p>
                              </div>
                              <button
                                onClick={() => setCentroSeleccionado(null)}
                                style={{
                                  background: 'rgba(255,255,255,0.2)',
                                  color: 'white',
                                  border: '1px solid rgba(255,255,255,0.3)',
                                  padding: '8px 16px',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  fontWeight: '600',
                                  fontSize: '0.9rem'
                                }}
                              >
                                ← Volver a Centros
                              </button>
                            </div>

                            <div style={{
                              display: 'grid',
                              gap: '12px',
                              maxHeight: '400px',
                              overflowY: 'auto',
                              padding: '10px'
                            }}>
                              {centroData.trabajadores.map((registro) => (
                                <div key={registro.id} style={{
                                  background: 'linear-gradient(135deg, #f8fafb, #ffffff)',
                                  padding: '20px',
                                  borderRadius: '15px',
                                  border: '2px solid #e1e8ed',
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                  transition: 'all 0.3s ease'
                                }}
                                onMouseOver={(e) => {
                                  e.currentTarget.style.transform = 'translateY(-2px)';
                                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)';
                                }}
                                onMouseOut={(e) => {
                                  e.currentTarget.style.transform = 'translateY(0)';
                                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                                }}
                                >
                                  <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                  }}>
                                    <div style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '15px'
                                    }}>
                                      <div style={{
                                        background: 'linear-gradient(135deg, #22c55e, #15803d)',
                                        color: 'white',
                                        width: '50px',
                                        height: '50px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.5rem',
                                        fontWeight: '700'
                                      }}>
                                        👤
                                      </div>
                                      <div>
                                        <h5 style={{
                                          margin: '0 0 5px 0',
                                          fontSize: '1.1rem',
                                          fontWeight: '600',
                                          color: '#333'
                                        }}>
                                          {registro.trabajadorNombre || `Trabajador ${registro.trabajadorId}`}
                                        </h5>
                                        <p style={{
                                          margin: 0,
                                          color: '#666',
                                          fontSize: '0.9rem'
                                        }}>
                                          🕐 {formatearHora(registro.horaIngreso)} - {formatearHora(registro.horaSalida)}
                                        </p>
                                      </div>
                                    </div>
                                    <div style={{
                                      display: 'flex',
                                      flexDirection: 'column',
                                      alignItems: 'center',
                                      gap: '5px'
                                    }}>
                                      <div style={{
                                        background: '#f0fdf4',
                                        color: '#15803d',
                                        padding: '6px 12px',
                                        borderRadius: '20px',
                                        fontSize: '0.9rem',
                                        fontWeight: '600'
                                      }}>
                                        {formatearHoras(registro.totalHoras)} hrs
                                      </div>
                                      <div style={{
                                        display: 'flex',
                                        gap: '5px'
                                      }}>
                                        <button
                                          style={{
                                            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                                            color: 'white',
                                            border: 'none',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '0.7rem'
                                          }}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            alert('Funcionalidad de editar próximamente');
                                          }}
                                        >
                                          ✏️
                                        </button>
                                        <button
                                          style={{
                                            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                            color: 'white',
                                            border: 'none',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '0.7rem'
                                          }}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            eliminarRegistro(registro.id);
                                          }}
                                        >
                                          🗑️
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              ) : (
                // Mensaje cuando no hay registros
                <div style={{
                  textAlign: 'center',
                  padding: '40px',
                  color: '#666'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📝</div>
                  <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>
                    No hay registros para este día
                  </h4>
                  <p style={{ marginBottom: '25px', color: '#666' }}>
                    Ningún trabajador tiene registros para esta fecha
                  </p>
                  
                  <div style={{
                    display: 'flex',
                    gap: '15px',
                    justifyContent: 'center',
                    flexWrap: 'wrap'
                  }}>
                    <button
                      onClick={() => navigateToForm('individual')}
                      style={{
                        background: 'linear-gradient(135deg, #22c55e, #15803d)',
                        color: 'white',
                        border: 'none',
                        padding: '15px 25px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '1rem',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      ➕ Crear Registro
                    </button>
                    <button
                      onClick={() => navigateToForm('lote')}
                      style={{
                        background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                        color: 'white',
                        border: 'none',
                        padding: '15px 25px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '1rem',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      📊 Registros en Lote
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
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