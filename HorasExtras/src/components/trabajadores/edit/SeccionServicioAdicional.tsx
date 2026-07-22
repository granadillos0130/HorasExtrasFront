import React from "react";
import type { TrabajadorEditFormData } from "../../../hooks/trabajadores/useTrabajadorEdit";

interface CampoServicio {
  name: keyof TrabajadorEditFormData;
  label: string;
  placeholder?: string;
  type?: "text" | "date";
}

interface Props {
  icon: string;
  title: string;
  sectionKey: string;
  campos: CampoServicio[];
  formData: TrabajadorEditFormData;
  expanded: boolean;
  saving: boolean;
  onToggle: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

// Sección genérica para los servicios de seguridad social del trabajador
// (EPS, ARL, Pensión, Banco, Clínica), que comparten la misma estructura:
// un nombre/identificador y, en la mayoría de casos, un rango de fechas.
export const SeccionServicioAdicional: React.FC<Props> = ({
  icon,
  title,
  campos,
  formData,
  expanded,
  saving,
  onToggle,
  onChange,
}) => {
  return (
    <div className="form-section">
      <div className="section-header" onClick={onToggle}>
        <div className="section-title">
          <span className="section-icon">{icon}</span>
          <h3>{title}</h3>
          <span className="optional-badge">Opcional</span>
        </div>
        <span className={`chevron ${expanded ? 'expanded' : ''}`}>▼</span>
      </div>

      {expanded && (
        <div className="section-content">
          <div className="form-grid">
            {campos.map((campo) => (
              <div className="form-group" key={campo.name}>
                <label className="form-label">{campo.label}</label>
                <input
                  type={campo.type || "text"}
                  name={campo.name}
                  placeholder={campo.placeholder}
                  value={formData[campo.name]}
                  onChange={onChange}
                  className="form-input"
                  disabled={saving}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
