// src/components/trabajadores/TrabajadorDetailModal.tsx
import React, { useEffect, useState } from "react";
import type { Trabajador } from "../../types/trabajadores";
import { trabajadoresService } from "../../api/trabajadoresService";
import "../../styles/components/trabajador/TrabajadorDetail.css";

interface Props {
  trabajadorId: number;
  onClose: () => void;
}

const TrabajadorDetail: React.FC<Props> = ({ trabajadorId, onClose }) => {
  const [trabajador, setTrabajador] = useState<Trabajador | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await trabajadoresService.getById(trabajadorId);
        setTrabajador(data);
      } catch (err) {
        setError("Error al cargar la información del trabajador");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [trabajadorId]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const formatSalary = (salary: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(salary);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getContractTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'Tiempo Completo': '#22C55E',
      'Medio Tiempo': '#F97316',
      'Por Horas': '#3B82F6',
      'Contratista': '#8B5CF6',
      'Temporal': '#EF4444'
    };
    return colors[type] || '#64748B';
  };

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="loading-state">
            <div className="loading-spinner-large"></div>
            <h3>Cargando información del trabajador...</h3>
            <p>Por favor espere un momento</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="error-state">
            <div className="error-icon">❌</div>
            <h3>Error al cargar datos</h3>
            <p>{error}</p>
            <button className="btn-primary" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!trabajador) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header del modal */}
        <div className="modal-header">
          <div className="header-content">
            <div className="worker-avatar-large">
              <span className="avatar-initials-large">{getInitials(trabajador.nombre)}</span>
              <div className="avatar-status-large"></div>
            </div>
            <div className="worker-header-info">
              <h2 className="worker-name-large">{trabajador.nombre}</h2>
              <div className="worker-details-header">
                <span className="worker-id-badge">ID: {trabajador.id}</span>
                <span className="worker-cedula-badge">CC: {trabajador.cedula}</span>
                <span 
                  className="contract-type-badge"
                  style={{ backgroundColor: getContractTypeColor(trabajador.tipoContratacion) }}
                >
                  {trabajador.tipoContratacion}
                </span>
              </div>
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Contenido del modal */}
        <div className="modal-body">
          {/* Información Personal */}
          <div className="info-section">
            <div className="section-header">
              <div className="section-icon">👤</div>
              <h3>Información Personal</h3>
            </div>
            <div className="info-grid">
              <div className="info-card">
                <div className="info-card-icon">🎂</div>
                <div className="info-card-content">
                  <div className="info-card-label">Fecha de Nacimiento</div>
                  <div className="info-card-value">{formatDate(trabajador.fechaNacimiento)}</div>
                  <div className="info-card-extra">{trabajador.edad} años</div>
                </div>
              </div>
              
              <div className="info-card">
                <div className="info-card-icon">⚕️</div>
                <div className="info-card-content">
                  <div className="info-card-label">Tipo de Sangre</div>
                  <div className="info-card-value">{trabajador.rh || 'No especificado'}</div>
                </div>
              </div>
              
              <div className="info-card">
                <div className="info-card-icon">👥</div>
                <div className="info-card-content">
                  <div className="info-card-label">Estado Civil</div>
                  <div className="info-card-value">{trabajador.estadoCivil}</div>
                </div>
              </div>
              
              <div className="info-card">
                <div className="info-card-icon">🚻</div>
                <div className="info-card-content">
                  <div className="info-card-label">Género</div>
                  <div className="info-card-value">{trabajador.genero}</div>
                </div>
              </div>
              
              <div className="info-card">
                <div className="info-card-icon">👶</div>
                <div className="info-card-content">
                  <div className="info-card-label">Hijos</div>
                  <div className="info-card-value">{trabajador.cantidadHijos}</div>
                </div>
              </div>
              
              <div className="info-card">
                <div className="info-card-icon">🎓</div>
                <div className="info-card-content">
                  <div className="info-card-label">Escolaridad</div>
                  <div className="info-card-value">{trabajador.nivelEscolaridad}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Información Laboral */}
          <div className="info-section">
            <div className="section-header">
              <div className="section-icon">💼</div>
              <h3>Información Laboral</h3>
            </div>
            <div className="info-grid">
              <div className="info-card salary-card">
                <div className="info-card-icon">💰</div>
                <div className="info-card-content">
                  <div className="info-card-label">Salario</div>
                  <div className="info-card-value salary-value">{formatSalary(trabajador.salario)}</div>
                </div>
              </div>
              
              <div className="info-card">
                <div className="info-card-icon">📅</div>
                <div className="info-card-content">
                  <div className="info-card-label">Fecha de Contratación</div>
                  <div className="info-card-value">{formatDate(trabajador.fechaContratacion)}</div>
                </div>
              </div>
              
              <div className="info-card">
                <div className="info-card-icon">📧</div>
                <div className="info-card-content">
                  <div className="info-card-label">Correo Electrónico</div>
                  <div className="info-card-value email-value">{trabajador.correo}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Seguridad Social */}
          <div className="info-section">
            <div className="section-header">
              <div className="section-icon">🛡️</div>
              <h3>Seguridad Social</h3>
            </div>
            <div className="security-grid">
              <div className={`security-card ${trabajador.eps ? 'active' : 'inactive'}`}>
                <div className="security-card-header">
                  <div className="security-card-icon eps">⚕️</div>
                  <div className="security-card-title">EPS</div>
                </div>
                <div className="security-card-content">
                  <div className="security-card-value">
                    {trabajador.eps ? trabajador.eps.nombre : 'No asignada'}
                  </div>
                  {trabajador.eps && (
                    <div className="security-card-dates">
                      <div>Desde: {formatDate(trabajador.eps.fechaInicio)}</div>
                      {trabajador.eps.fechaFin && (
                        <div>Hasta: {formatDate(trabajador.eps.fechaFin)}</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className={`security-card ${trabajador.arl ? 'active' : 'inactive'}`}>
                <div className="security-card-header">
                  <div className="security-card-icon arl">🦺</div>
                  <div className="security-card-title">ARL</div>
                </div>
                <div className="security-card-content">
                  <div className="security-card-value">
                    {trabajador.arl ? trabajador.arl.nombre : 'No asignada'}
                  </div>
                  {trabajador.arl && (
                    <div className="security-card-dates">
                      <div>Desde: {formatDate(trabajador.arl.fechaInicio)}</div>
                      {trabajador.arl.fechaFin && (
                        <div>Hasta: {formatDate(trabajador.arl.fechaFin)}</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className={`security-card ${trabajador.pension ? 'active' : 'inactive'}`}>
                <div className="security-card-header">
                  <div className="security-card-icon pension">👴</div>
                  <div className="security-card-title">Pensión</div>
                </div>
                <div className="security-card-content">
                  <div className="security-card-value">
                    {trabajador.pension ? trabajador.pension.nombre : 'No asignada'}
                  </div>
                  {trabajador.pension && (
                    <div className="security-card-dates">
                      <div>Desde: {formatDate(trabajador.pension.fechaInicio)}</div>
                      {trabajador.pension.fechaFin && (
                        <div>Hasta: {formatDate(trabajador.pension.fechaFin)}</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className={`security-card ${trabajador.banco ? 'active' : 'inactive'}`}>
                <div className="security-card-header">
                  <div className="security-card-icon bank">🏦</div>
                  <div className="security-card-title">Banco</div>
                </div>
                <div className="security-card-content">
                  <div className="security-card-value">
                    {trabajador.banco ? trabajador.banco.nombre : 'No asignado'}
                  </div>
                  {trabajador.banco && (
                    <div className="security-card-account">
                      Cuenta: {trabajador.banco.numeroCuenta}
                    </div>
                  )}
                </div>
              </div>

              <div className={`security-card ${trabajador.clinica ? 'active' : 'inactive'}`}>
                <div className="security-card-header">
                  <div className="security-card-icon clinic">🏥</div>
                  <div className="security-card-title">Clínica</div>
                </div>
                <div className="security-card-content">
                  <div className="security-card-value">
                    {trabajador.clinica ? trabajador.clinica.nombre : 'No asignada'}
                  </div>
                  {trabajador.clinica && (
                    <div className="security-card-dates">
                      <div>Desde: {formatDate(trabajador.clinica.fechaInicio)}</div>
                      {trabajador.clinica.fechaFin && (
                        <div>Hasta: {formatDate(trabajador.clinica.fechaFin)}</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Contacto de Emergencia */}
          <div className="info-section">
            <div className="section-header">
              <div className="section-icon">🚨</div>
              <h3>Contacto de Emergencia</h3>
            </div>
            <div className="emergency-card">
              <div className="emergency-main">
                <div className="emergency-name">
                  <div className="emergency-icon">👤</div>
                  <div>
                    <div className="contact-name">{trabajador.personaContacto || 'No especificado'}</div>
                    <div className="contact-relation">{trabajador.parentescoContacto || 'Sin parentesco'}</div>
                  </div>
                </div>
                <div className="emergency-contact-info">
                  <div className="contact-item">
                    <div className="contact-icon">📞</div>
                    <div className="contact-detail">
                      <div className="contact-label">Teléfono</div>
                      <div className="contact-value">{trabajador.telefonoContacto || 'No especificado'}</div>
                    </div>
                  </div>
                  <div className="contact-item">
                    <div className="contact-icon">📍</div>
                    <div className="contact-detail">
                      <div className="contact-label">Dirección</div>
                      <div className="contact-value">{trabajador.direccionContacto || 'No especificada'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer del modal */}
        <div className="modal-footer">
          <div className="creation-info">
            <div className="creation-item">
              <span className="creation-icon">📅</span>
              <span>Creado: {formatDate(trabajador.fechaCreacion)}</span>
            </div>
            <div className="creation-item">
              <span className="creation-icon">✏️</span>
              <span>Actualizado: {formatDate(trabajador.fechaActualizacion)}</span>
            </div>
          </div>
          <button className="btn-close-footer" onClick={onClose}>
            ✅ Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrabajadorDetail;