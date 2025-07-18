import React, { useEffect, useState } from "react";
import { centrosService } from "../api/centrosService";
import { trabajadoresService } from "../api/trabajadoresService";
import { useNavigate } from "react-router-dom";
import CentroBuscador from "../components/shared/CentroBuscador";
import CentroForm from "../components/centros/CentroForm";
import type { Centro } from "../types/centros";
import type { Trabajador } from "../types/trabajadores";
import "../styles/pages/CentrosPage.css";

const CentrosPage: React.FC = () => {
  const [centros, setCentros] = useState<Centro[]>([]);
  const [centrosFiltrados, setCentrosFiltrados] = useState<Centro[]>([]);
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [selectedCentro, setSelectedCentro] = useState<string>("");
  const [selectedTrabajador, setSelectedTrabajador] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [loadingAssign, setLoadingAssign] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const navigate = useNavigate();

  const cargarCentros = async () => {
    try {
      setLoading(true);
      const data = await centrosService.getAll();
      setCentros(data);
      setCentrosFiltrados(data);
    } catch (error) {
      console.error("Error al cargar centros:", error);
    } finally {
      setLoading(false);
    }
  };

  const cargarTrabajadores = async () => {
    try {
      const data = await trabajadoresService.getAll();
      setTrabajadores(data);
    } catch (error) {
      console.error("Error al cargar trabajadores:", error);
    }
  };

  useEffect(() => {
    cargarCentros();
    cargarTrabajadores();
  }, []);

  useEffect(() => {
    if (!busqueda.trim()) {
      setCentrosFiltrados(centros);
    } else {
      const filtrados = centros.filter(centro =>
        centro.nombreCentro.toLowerCase().includes(busqueda.toLowerCase()) ||
        centro.id.toLowerCase().includes(busqueda.toLowerCase())
      );
      setCentrosFiltrados(filtrados);
    }
  }, [busqueda, centros]);

  const handleAsignar = async () => {
    if (selectedCentro === "" || selectedTrabajador === 0) {
      alert("Seleccione un centro y un trabajador");
      return;
    }

    setLoadingAssign(true);
    try {
      await centrosService.asignarTrabajador(selectedCentro, selectedTrabajador);
      alert("Trabajador asignado correctamente");
      setSelectedTrabajador(0);
      setSelectedCentro("");
    } catch (error) {
      console.error("Error al asignar trabajador:", error);
      alert("Error al asignar trabajador");
    } finally {
      setLoadingAssign(false);
    }
  };

  const handleEliminar = async (id: string, nombre: string) => {
    if (confirm(`¿Está seguro de eliminar el centro "${nombre}"?`)) {
      try {
        await centrosService.eliminar(id);
        cargarCentros();
        alert("Centro eliminado correctamente");
      } catch (error) {
        console.error("Error al eliminar centro:", error);
        alert("Error al eliminar centro");
      }
    }
  };

  const handleLimpiarBusqueda = () => {
    setBusqueda("");
  };

  const getSelectedTrabajadorName = () => {
    const trabajador = trabajadores.find(t => t.id === selectedTrabajador);
    return trabajador ? trabajador.nombre : "";
  };

  return (
    <div className="centros-page">
      <div className="page-container">
        <div className="page-header">
          <h1>Gestión de Centros</h1>
          <p className="page-subtitle">
            Administra los centros de trabajo y asigna trabajadores
          </p>
        </div>

        <div className="content-card">
          <div className="centros-toolbar">
            <div className="toolbar-left">
              <h2 className="toolbar-title">Centros de Trabajo</h2>
              <button
                className="btn-nuevo"
                onClick={() => setShowForm(!showForm)}
              >
                {showForm ? "❌ Cancelar" : "➕ Nuevo Centro"}
              </button>
            </div>
          </div>

          {showForm && (
            <div className="form-section">
              <div className="form-header">
                <div className="form-icon">🏢</div>
                <div>
                  <h3>Crear Nuevo Centro</h3>
                  <p>Ingresa la información del centro de trabajo</p>
                </div>
              </div>
              <CentroForm onSuccess={() => {
                setShowForm(false);
                cargarCentros();
              }} />
            </div>
          )}

          {/* Aquí sigue el resto sin cambios... (buscador, listado, asignación, etc.) */}
          {/* ... */}
        </div>

        {/* Asignar trabajador a centro */}
        <div className="content-card">
          <div className="assign-header">
            <div className="assign-icon">👥</div>
            <div>
              <h2>Asignar Trabajador a Centro</h2>
              <p>Vincula trabajadores con sus centros de trabajo correspondientes</p>
            </div>
          </div>

          <div className="assign-form">
            <div className="form-row">
              <CentroBuscador
                centros={centros}
                value={selectedCentro}
                onChange={(centroId) => setSelectedCentro(centroId)}
                placeholder="Seleccione un centro para asignar trabajador"
                label="Centro de Trabajo"
                showSelectedInfo={true}
              />

              <div className="form-group">
                <label className="form-label">Trabajador</label>
                <select 
                  value={selectedTrabajador} 
                  onChange={e => setSelectedTrabajador(Number(e.target.value))}
                  className="form-select"
                >
                  <option value={0}>Seleccione un trabajador</option>
                  {trabajadores.map(t => (
                    <option key={t.id} value={t.id}>{t.nombre}</option>
                  ))}
                </select>
                {getSelectedTrabajadorName() && (
                  <div className="selected-item">
                    👤 Trabajador seleccionado: <strong>{getSelectedTrabajadorName()}</strong>
                  </div>
                )}
              </div>

              <button 
                onClick={handleAsignar}
                className="btn-assign"
                disabled={loadingAssign || selectedCentro === "" || selectedTrabajador === 0}
              >
                {loadingAssign ? "Asignando..." : "👥 Asignar"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CentrosPage;
