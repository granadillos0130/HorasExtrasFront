// src/components/trabajadores/TrabajadorEditPage.tsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTrabajadorEdit, formatDate, getEstadoStyle } from "../../hooks/trabajadores/useTrabajadorEdit";
import { useTrabajadorImagen } from "../../hooks/trabajadores/useTrabajadorImagen";
import { SeccionPersonal } from "./edit/SeccionPersonal";
import { SeccionImagen } from "./edit/SeccionImagen";
import { SeccionLaboral } from "./edit/SeccionLaboral";
import { SeccionContacto } from "./edit/SeccionContacto";
import { SeccionServicioAdicional } from "./edit/SeccionServicioAdicional";
import "../../styles/components/trabajador/TrabajadorEditPage.css";

const TrabajadorEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    trabajador,
    setTrabajador,
    loading,
    saving,
    error,
    errors,
    formData,
    expandedSections,
    handleFormChange,
    toggleSection,
    expandAll,
    collapseAll,
    handleSubmit,
  } = useTrabajadorEdit(id);

  const {
    imageError,
    uploadingImage,
    imagePreview,
    handleImageDelete,
    handleFileInputChange,
    setImageError,
  } = useTrabajadorImagen(trabajador, setTrabajador);

  if (loading) {
    return (
      <div className="trabajador-edit-page">
        <div className="page-container">
          <div className="loading-state">
            <div className="loading-spinner-large"></div>
            <h3>Cargando información del trabajador...</h3>
            <p>Por favor espere un momento</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !trabajador) {
    return (
      <div className="trabajador-edit-page">
        <div className="page-container">
          <div className="error-state">
            <div className="error-icon">❌</div>
            <h3>Error al cargar datos</h3>
            <p>{error || "No se pudo encontrar el trabajador"}</p>
            <button className="btn-primary" onClick={() => navigate("/trabajadores")}>
              Volver a Trabajadores
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="trabajador-edit-page">
      <div className="page-container">
        <div className="page-header">
          <button
            className="btn-back"
            onClick={() => navigate("/trabajadores")}
          >
            ← Volver
          </button>
          <h1>Editar Trabajador</h1>
          <p className="page-subtitle">
            Actualiza la información de {trabajador.nombre}
          </p>

          <div className="worker-status-header">
            <span
              className="estado-badge-edit"
              style={getEstadoStyle(trabajador.estado)}
            >
              {trabajador.estado}
            </span>
            {trabajador.estado === "No Vigente" && trabajador.fechaTerminacion && (
              <span className="fecha-terminacion-header">
                Terminado el: {formatDate(trabajador.fechaTerminacion)}
              </span>
            )}
          </div>
        </div>

        {/* Controles de expansión */}
        <div className="section-controls">
          <button type="button" className="btn-outline" onClick={expandAll}>
            📂 Expandir Todo
          </button>
          <button type="button" className="btn-outline" onClick={collapseAll}>
            📁 Colapsar Opcionales
          </button>
        </div>

        <form className="trabajador-form-unified" onSubmit={handleSubmit}>
          <SeccionPersonal
            formData={formData}
            errors={errors}
            expanded={expandedSections.personal}
            saving={saving}
            onToggle={() => toggleSection('personal')}
            onChange={handleFormChange}
          />

          <SeccionImagen
            trabajador={trabajador}
            expanded={expandedSections.imagen}
            saving={saving}
            imageError={imageError}
            uploadingImage={uploadingImage}
            imagePreview={imagePreview}
            onToggle={() => toggleSection('imagen')}
            onImageError={() => setImageError(true)}
            onFileInputChange={handleFileInputChange}
            onImageDelete={handleImageDelete}
          />

          <SeccionLaboral
            formData={formData}
            errors={errors}
            expanded={expandedSections.laboral}
            saving={saving}
            trabajador={trabajador}
            onToggle={() => toggleSection('laboral')}
            onChange={handleFormChange}
          />

          <SeccionContacto
            formData={formData}
            expanded={expandedSections.contacto}
            saving={saving}
            onToggle={() => toggleSection('contacto')}
            onChange={handleFormChange}
          />

          <SeccionServicioAdicional
            icon="⚕️"
            title="EPS"
            sectionKey="eps"
            expanded={expandedSections.eps}
            saving={saving}
            formData={formData}
            onToggle={() => toggleSection('eps')}
            onChange={handleFormChange}
            campos={[
              { name: "eps", label: "Nombre de EPS", placeholder: "Ej: Sanitas, Sura, Nueva EPS" },
              { name: "epsFechaInicio", label: "Fecha de Inicio", type: "date" },
              { name: "epsFechaFin", label: "Fecha de Fin (Opcional)", type: "date" },
            ]}
          />

          <SeccionServicioAdicional
            icon="🦺"
            title="ARL"
            sectionKey="arl"
            expanded={expandedSections.arl}
            saving={saving}
            formData={formData}
            onToggle={() => toggleSection('arl')}
            onChange={handleFormChange}
            campos={[
              { name: "arl", label: "Nombre de ARL", placeholder: "Ej: Sura ARL, Positiva, Colmena" },
              { name: "arlFechaInicio", label: "Fecha de Inicio", type: "date" },
              { name: "arlFechaFin", label: "Fecha de Fin (Opcional)", type: "date" },
            ]}
          />

          <SeccionServicioAdicional
            icon="👴"
            title="Fondo de Pensión"
            sectionKey="pension"
            expanded={expandedSections.pension}
            saving={saving}
            formData={formData}
            onToggle={() => toggleSection('pension')}
            onChange={handleFormChange}
            campos={[
              { name: "fondoPension", label: "Nombre del Fondo", placeholder: "Ej: Protección, Porvenir, Colfondos" },
              { name: "pensionFechaInicio", label: "Fecha de Inicio", type: "date" },
              { name: "pensionFechaFin", label: "Fecha de Fin (Opcional)", type: "date" },
            ]}
          />

          <SeccionServicioAdicional
            icon="🏦"
            title="Información Bancaria"
            sectionKey="banco"
            expanded={expandedSections.banco}
            saving={saving}
            formData={formData}
            onToggle={() => toggleSection('banco')}
            onChange={handleFormChange}
            campos={[
              { name: "banco", label: "Nombre del Banco", placeholder: "Ej: Bancolombia, Banco de Bogotá, Nequi" },
              { name: "numeroCuenta", label: "Número de Cuenta", placeholder: "Ej: 12345678901" },
            ]}
          />

          <SeccionServicioAdicional
            icon="🏥"
            title="Clínica de Atención"
            sectionKey="clinica"
            expanded={expandedSections.clinica}
            saving={saving}
            formData={formData}
            onToggle={() => toggleSection('clinica')}
            onChange={handleFormChange}
            campos={[
              { name: "nombreClinica", label: "Nombre de la Clínica", placeholder: "Ej: Clínica del Country, Hospital San Ignacio" },
              { name: "clinicaFechaInicio", label: "Fecha de Inicio", type: "date" },
              { name: "clinicaFechaFin", label: "Fecha de Fin (Opcional)", type: "date" },
            ]}
          />

          {/* Botón de envío */}
          <div className="form-actions-unified">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate("/trabajadores")}
              disabled={saving}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="btn-submit"
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="loading-spinner"></span>
                  Actualizando trabajador...
                </>
              ) : (
                <>
                  ✅ Actualizar Trabajador
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TrabajadorEditPage;
