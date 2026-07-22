// CentrosPage.tsx - Versión Refactorizada y Ejecutiva
import React, { useState, useEffect, useCallback } from "react";
import { centrosService } from "../api/centrosService";
import { clientesService } from "../api/clientesService";
import CentrosFilters from "../components/centros/CentrosFilters";
import CentrosTable from "../components/centros/CentrosTable";
import CentrosPagination from "../components/centros/CentrosPagination";
import CentroForm from "../components/centros/CentroForm";
import InformacionEjecucionPage from "./InformacionEjecucionPage";
import CentroModalUniversal from "../components/centros/CentroModalUniversal";
import type { Centro, CentroPorMesCompleto, EstadisticaTrabajador } from "../types/centros";
import type { Cliente } from "../types/cliente";

const CentrosPage: React.FC = () => {
  // Estados de filtros y paginación
  const [añoSeleccionado, setAñoSeleccionado] = useState<number>(new Date().getFullYear());
  const [mesSeleccionado, setMesSeleccionado] = useState<number | null>(null);
  const [busqueda, setBusqueda] = useState<string>("");
  const [paginaActual, setPaginaActual] = useState<number>(1);
  const [itemsPorPagina, setItemsPorPagina] = useState<number>(15);

  // Estados de datos
  const [centrosDelMes, setCentrosDelMes] = useState<CentroPorMesCompleto[]>([]);
  const [loading, setLoading] = useState(false);

  // Estados de vistas y modales
  const [vistaActual, setVistaActual] = useState<'lista' | 'crear' | 'editar' | 'ejecucion'>('lista');
  const [centroSeleccionado, setCentroSeleccionado] = useState<CentroPorMesCompleto | null>(null);
  const [centroAEditar, setCentroAEditar] = useState<Centro | null>(null);
  const [centroEncontrado, setCentroEncontrado] = useState<Centro | null>(null);

  // Estados para modal
  const [modal, setModal] = useState<{
    isOpen: boolean;
    type: 'info' | 'cargos';
  }>({
    isOpen: false,
    type: 'info'
  });

  // Estados para datos completos del modal
  const [datosCompletos, setDatosCompletos] = useState<{
    cliente: Cliente | null;
    manoObraTotal: number;
    cargosUnicos: string[];
  }>({
    cliente: null,
    manoObraTotal: 0,
    cargosUnicos: []
  });

  // ================================
  // FUNCIONES DE CARGA DE DATOS
  // ================================
  const cargarCentrosDelMes = useCallback(async () => {
    if (mesSeleccionado === null) {
      setCentrosDelMes([]);
      return;
    }

    setLoading(true);
    try {
      const centrosCompletos = await centrosService.obtenerPorMes(añoSeleccionado, mesSeleccionado);
      const centrosFiltrados = centrosCompletos.filter(centro => {
        const nombre = centro.centroNombre.toLowerCase();
        return !nombre.includes('festivo') && !nombre.includes('vacaciones');
      });
      setCentrosDelMes(centrosFiltrados);
      setPaginaActual(1); // Reset página al cambiar filtros
    } catch (error) {
      console.error("Error al cargar centros del mes:", error);
      setCentrosDelMes([]);
    } finally {
      setLoading(false);
    }
  }, [añoSeleccionado, mesSeleccionado]);

  const cargarDatosCompletosCentro = async (
    centro: Centro,
    estadisticas: { trabajadores?: EstadisticaTrabajador[] } | null,
    centroCompleto?: CentroPorMesCompleto
  ) => {
    try {
      if (centroCompleto) {
        setDatosCompletos({
          cliente: centroCompleto.cliente ? {
            id: centroCompleto.cliente.id,
            nombreCliente: centroCompleto.cliente.nombre
          } as Cliente : null,
          manoObraTotal: centroCompleto.manoObraTotal,
          cargosUnicos: centroCompleto.cargosUnicos
        });
        return;
      }

      // Cargar cliente
      let cliente = null;
      if (centro.clienteId) {
        try {
          cliente = await clientesService.obtenerPorId(centro.clienteId);
        } catch (error) {
          console.warn("No se pudo cargar el cliente:", error);
        }
      }

      // Cargar mano de obra total
      let manoObraTotal = 0;
      try {
        const resultadoBatch = await centrosService.obtenerManoObraTotalBatch([centro.id]);
        if (resultadoBatch.length > 0 && resultadoBatch[0].success) {
          manoObraTotal = resultadoBatch[0].manoObraTotal;
        }
      } catch (error) {
        console.warn("No se pudo cargar la mano de obra total:", error);
      }

      // Extraer cargos únicos
      const cargosUnicos: string[] = [];
      if (estadisticas && estadisticas.trabajadores) {
        const cargosSet = new Set<string>();
        estadisticas.trabajadores.forEach((t: EstadisticaTrabajador) => {
          if (t.cargo && t.cargo !== 'No especificado') {
            cargosSet.add(t.cargo);
          }
        });
        if (cargosSet.size === 0) {
          cargosSet.add("Trabajador General");
        }
        cargosUnicos.push(...Array.from(cargosSet));
      } else {
        cargosUnicos.push("Trabajador General");
      }

      setDatosCompletos({
        cliente,
        manoObraTotal,
        cargosUnicos
      });
    } catch (error) {
      console.error("Error al cargar datos completos:", error);
      setDatosCompletos({
        cliente: null,
        manoObraTotal: 0,
        cargosUnicos: []
      });
    }
  };

  // ================================
  // FUNCIONES DE MANEJO DE MODALES
  // ================================
  const abrirModal = (tipo: 'info' | 'cargos') => {
    setModal({
      isOpen: true,
      type: tipo
    });
  };

  const cerrarModal = () => {
    setModal({
      isOpen: false,
      type: 'info'
    });
    setCentroSeleccionado(null);
    setCentroAEditar(null);
    setCentroEncontrado(null);
    setDatosCompletos({
      cliente: null,
      manoObraTotal: 0,
      cargosUnicos: []
    });
  };

  const toggleModalType = () => {
    setModal(prev => ({
      ...prev,
      type: prev.type === 'info' ? 'cargos' : 'info'
    }));
  };

  // ================================
  // FUNCIONES DE ACCIONES
  // ================================
  const handleVerInfo = async (centro: CentroPorMesCompleto) => {
    setCentroSeleccionado(centro);
    try {
      const centroCompleto = await centrosService.getById(centro.centroId);
      setCentroEncontrado(centroCompleto);
      await cargarDatosCompletosCentro(centroCompleto, null, centro);
      abrirModal('info');
    } catch (error) {
      console.error("Error al cargar centro:", error);
    }
  };

  const handleVerCargos = async (centro: CentroPorMesCompleto) => {
    if (centro.trabajadores.length === 0) {
      alert('Este centro no tiene trabajadores registrados en el sistema.');
      return;
    }
    setCentroSeleccionado(centro);
    try {
      const centroCompleto = await centrosService.getById(centro.centroId);
      setCentroEncontrado(centroCompleto);
      await cargarDatosCompletosCentro(centroCompleto, null, centro);
      abrirModal('cargos');
    } catch (error) {
      console.error("Error al cargar centro:", error);
    }
  };

  const handleVerEjecucion = (centro: CentroPorMesCompleto) => {
    setCentroSeleccionado(centro);
    setVistaActual('ejecucion');
  };

  const handleEditar = async (centroId: string) => {
    try {
      setLoading(true);
      const centroCompleto = await centrosService.getById(centroId);
      setCentroAEditar(centroCompleto);
      setVistaActual('editar');
    } catch (error) {
      console.error("Error al cargar centro para editar:", error);
      alert("Error al cargar los datos del centro");
    } finally {
      setLoading(false);
    }
  };

  const handleCentroCreado = () => {
    cargarCentrosDelMes();
    setVistaActual('lista');
    cerrarModal();
  };

  const handleCentroActualizado = () => {
    cargarCentrosDelMes();
    setVistaActual('lista');
    cerrarModal();
  };

  // ================================
  // FILTRADO Y PAGINACIÓN
  // ================================
  const centrosFiltrados = centrosDelMes.filter(centro => {
    if (!busqueda) return true;
    const busquedaLower = busqueda.toLowerCase();
    return (
      centro.centroNombre.toLowerCase().includes(busquedaLower) ||
      centro.centroId.toLowerCase().includes(busquedaLower)
    );
  });

  const totalPaginas = Math.ceil(centrosFiltrados.length / itemsPorPagina);
  const centrosPaginados = centrosFiltrados.slice(
    (paginaActual - 1) * itemsPorPagina,
    paginaActual * itemsPorPagina
  );

  // ================================
  // EFFECTS
  // ================================
  useEffect(() => {
    cargarCentrosDelMes();
  }, [cargarCentrosDelMes]);

  // Reset página cuando cambian los filtros
  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, añoSeleccionado, mesSeleccionado]);

  // ================================
  // RENDERS CONDICIONALES
  // ================================
  if (vistaActual === 'ejecucion' && centroSeleccionado) {
    return (
      <InformacionEjecucionPage
        centroId={centroSeleccionado.centroId}
        centroNombre={centroSeleccionado.centroNombre}
        onVolver={() => setVistaActual('lista')}
      />
    );
  }

  // ================================
  // RENDER PRINCIPAL
  // ================================
  return (
    <div style={{
      minHeight: '100vh',
      background: '#f1f5f9',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        {/* Header compacto */}
        <div style={{
          textAlign: 'center',
          marginBottom: '30px'
        }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: '#1e293b',
            margin: '0'
          }}>
            GESTIÓN DE CENTROS DE TRABAJO
          </h1>
        </div>

        {/* Filtros */}
        <CentrosFilters
          añoSeleccionado={añoSeleccionado}
          mesSeleccionado={mesSeleccionado}
          busqueda={busqueda}
          onAñoChange={setAñoSeleccionado}
          onMesChange={setMesSeleccionado}
          onBusquedaChange={setBusqueda}
          onCrearCentro={() => setVistaActual('crear')}
        />

        {/* Tabla */}
        <CentrosTable
          centros={centrosPaginados}
          loading={loading}
          onVerInfo={handleVerInfo}
          onVerCargos={handleVerCargos}
          onVerEjecucion={handleVerEjecucion}
          onEditar={handleEditar}
          mostrarTotales={true}
        />

        {/* Paginación */}
        {centrosFiltrados.length > 0 && (
          <CentrosPagination
            paginaActual={paginaActual}
            totalPaginas={totalPaginas}
            itemsPorPagina={itemsPorPagina}
            totalItems={centrosFiltrados.length}
            onCambioPagina={setPaginaActual}
            onCambioItemsPorPagina={setItemsPorPagina}
          />
        )}

        {/* Modal Universal */}
        {centroSeleccionado && modal.isOpen && (
          <CentroModalUniversal
            isOpen={modal.isOpen}
            onClose={cerrarModal}
            centro={centroSeleccionado}
            datosCompletos={datosCompletos}
            centroEncontrado={centroEncontrado}
            modalType={modal.type}
            onToggleModal={toggleModalType}
            source="meses"
          />
        )}

        {/* Modal Crear Centro */}
        {vistaActual === 'crear' && (
          <div style={modalOverlayStyle}>
            <div style={modalContainerStyle}>
              <div style={modalHeaderStyle}>
                <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600', color: '#1e293b' }}>
                  Crear Nuevo Centro
                </h3>
                <button
                  onClick={() => setVistaActual('lista')}
                  style={closeButtonStyle}
                >
                  ✕
                </button>
              </div>
              <div style={{ padding: '0 30px 30px 30px' }}>
                <CentroForm onSuccess={handleCentroCreado} />
              </div>
            </div>
          </div>
        )}

        {/* Modal Editar Centro */}
        {vistaActual === 'editar' && centroAEditar && (
          <div style={modalOverlayStyle}>
            <div style={modalContainerStyle}>
              <div style={modalHeaderStyle}>
                <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600', color: '#1e293b' }}>
                  Editar Centro: {centroAEditar.nombreCentro}
                </h3>
                <button
                  onClick={() => setVistaActual('lista')}
                  style={closeButtonStyle}
                >
                  ✕
                </button>
              </div>
              <div style={{ padding: '0 30px 30px 30px' }}>
                <CentroForm
                  centroAEditar={centroAEditar}
                  onSuccess={handleCentroActualizado}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Estilos para modales
const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: '20px'
};

const modalContainerStyle: React.CSSProperties = {
  background: 'white',
  borderRadius: '12px',
  maxWidth: '800px',
  width: '100%',
  maxHeight: '90vh',
  overflowY: 'auto',
  boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
};

const modalHeaderStyle: React.CSSProperties = {
  position: 'sticky',
  top: 0,
  background: 'white',
  borderRadius: '12px 12px 0 0',
  padding: '20px 30px',
  borderBottom: '2px solid #e2e8f0',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  zIndex: 1001
};

const closeButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  fontSize: '1.5rem',
  cursor: 'pointer',
  color: '#64748b',
  padding: '0',
  width: '30px',
  height: '30px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '6px',
  transition: 'all 0.2s ease'
};

export default CentrosPage;