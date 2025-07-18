import React, { useState } from "react";
import { useTrabajadores } from "../hooks/useTrabajadores";
import TrabajadorForm from "../components/trabajadores/TrabajadorForm";
import TrabajadorCard from "../components/trabajadores/TrabajadorCard";
import TrabajadorDetail from "../components/trabajadores/TrabajadorDetailModal";
import { trabajadoresService } from "../api/trabajadoresService";
import "../styles/pages/TrabajadoresPage.css";
import EpsForm from "../components/SeguridadEmpleado/epsForm";
import ArlForm from "../components/SeguridadEmpleado/arlForm";
import PensionForm from "../components/SeguridadEmpleado/PensionForm";
import ClinicaForm from "../components/SeguridadEmpleado/ClinicaForm";
import BancoForm from "../components/SeguridadEmpleado/BancoForm";
import { epsService } from "../api/epsService";
import { arlService } from "../api/arlService";
import { pensionService } from "../api/pensionService";
import { clinicaService } from "../api/clinicaService";
import { bancoService } from "../api/bancoService";

const TrabajadoresPage: React.FC = () => {
  const { trabajadores, loading, error, refetch } = useTrabajadores();
  const [showForm, setShowForm] = useState(false);
  const [nuevoTrabajadorId, setNuevoTrabajadorId] = useState<number | null>(null);
  const [detalleId, setDetalleId] = useState<number | null>(null);
  const [mostrarSoloNoVigentes, setMostrarSoloNoVigentes] = useState(false);

  const handleCreated = (id: number) => {
    setNuevoTrabajadorId(id);
    setShowForm(false);
  };

  const handleDelete = async (id: number, nombre: string) => {
    if (confirm(`¿Estás seguro de eliminar a ${nombre}?`)) {
      try {
        await trabajadoresService.delete(id);
        refetch();
      } catch (error) {
        alert("Error al eliminar el trabajador");
      }
    }
  };

  const trabajadoresFiltrados = mostrarSoloNoVigentes
    ? trabajadores.filter((t) => t.estado === "No Vigente")
    : trabajadores;

  return (
    <div className="trabajadores-page">
      <div className="page-container">
        <div className="page-header">
          <h1>Gestión de Trabajadores</h1>
          <p className="page-subtitle">
            Administra la información de tu equipo de trabajo
          </p>
        </div>

        <div className="content-card">
          <div className="form-section">
            {!showForm && (
              <>
                <button className="btn-primary" onClick={() => setShowForm(true)}>
                  ➕ Agregar Nuevo Trabajador
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => setMostrarSoloNoVigentes((prev) => !prev)}
                >
                  {mostrarSoloNoVigentes ? "👀 Ver Todos" : "🚫 Ver No Vigentes"}
                </button>
              </>
            )}
          </div>

          {showForm && (
            <TrabajadorForm
              onCreated={handleCreated}
              onCancel={() => setShowForm(false)}
              onRefresh={refetch}
            />
          )}

          <div className="list-section">
            <h2>Trabajadores Registrados ({trabajadoresFiltrados.length})</h2>

            {loading && (
              <div className="loading-message">
                🔄 Cargando trabajadores...
              </div>
            )}

            {error && (
              <div className="error-message">
                ❌ {error}
              </div>
            )}

            {!loading && trabajadoresFiltrados.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon">👥</div>
                <h3>No hay trabajadores {mostrarSoloNoVigentes ? "No Vigentes" : "registrados"}</h3>
                <p>Comienza agregando tu primer trabajador usando el botón de arriba.</p>
              </div>
            )}

            {!loading && trabajadoresFiltrados.length > 0 && (
              <div className="trabajadores-grid">
                {trabajadoresFiltrados.map((trabajador) => (
                  <TrabajadorCard
                    key={trabajador.id}
                    trabajador={trabajador}
                    onDelete={(id) => handleDelete(id, trabajador.nombre)}
                    onView={(id) => setDetalleId(id)}
                  />
                ))}
              </div>
            )}
          </div>

          {detalleId && (
            <TrabajadorDetail
              trabajadorId={detalleId}
              onClose={() => setDetalleId(null)}
            />
          )}

          {nuevoTrabajadorId && (
            <div className="extra-section">
              <h2>Completar información para el trabajador #{nuevoTrabajadorId}</h2>

              <EpsForm
                trabajadorId={nuevoTrabajadorId}
                onSave={async (data) => {
                  await epsService.crear(data);
                  alert("EPS registrada correctamente");
                }}
                onCancel={() => console.log("EPS cancelada")}
              />

              <ArlForm
                trabajadorId={nuevoTrabajadorId}
                onSave={async (data) => {
                  await arlService.crear(data);
                  alert("ARL registrada correctamente");
                }}
                onCancel={() => console.log("ARL cancelada")}
              />

              <PensionForm
                trabajadorId={nuevoTrabajadorId}
                onSave={async (data) => {
                  await pensionService.crear(data);
                  alert("Pensión registrada correctamente");
                }}
                onCancel={() => console.log("Pensión cancelada")}
              />

              <ClinicaForm
                trabajadorId={nuevoTrabajadorId}
                onSave={async (data) => {
                  await clinicaService.crear(data);
                  alert("Clínica registrada correctamente");
                }}
                onCancel={() => console.log("Clínica cancelada")}
              />

              <BancoForm
                trabajadorId={nuevoTrabajadorId}
                onSave={async (data) => {
                  await bancoService.crear(data);
                  alert("Banco registrado correctamente");
                }}
                onCancel={() => console.log("Banco cancelado")}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrabajadoresPage;
