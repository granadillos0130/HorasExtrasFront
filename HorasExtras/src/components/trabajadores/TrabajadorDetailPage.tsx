// src/pages/TrabajadorDetailPage.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Trabajador } from "../../types/trabajadores";
import { trabajadoresService } from "../../api/trabajadoresService";
import "../../styles/components/trabajador/TrabajadorDetailPage.css";

const TrabajadorDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trabajador, setTrabajador] = useState<Trabajador | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError("ID de trabajador no válido");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await trabajadoresService.getById(parseInt(id));
        setTrabajador(data);
      } catch (err) {
        setError("Error al cargar la información del trabajador");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const formatSalary = (salary?: number) => {
    if (!salary) return 'No especificado';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(salary);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'No especificado';
    
    try {
      // Manejar fechas que vienen solo con fecha (sin hora)
      let dateToFormat = dateString;
      
      // Si la fecha no tiene hora, agregamos hora del mediodía para evitar problemas de zona horaria
      if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        dateToFormat = `${dateString}T12:00:00`;
      }
      
      const date = new Date(dateToFormat);
      if (isNaN(date.getTime())) return 'Fecha inválida';
      
      return date.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  const getContractTypeColor = (type?: string) => {
    if (!type) return '#64748B';
    const colors: { [key: string]: string } = {
      'Tiempo Completo': '#22C55E',
      'Medio Tiempo': '#F97316',
      'Por Horas': '#3B82F6',
      'Contratista': '#8B5CF6',
      'Temporal': '#EF4444'
    };
    return colors[type] || '#64748B';
  };

  const handleGoBack = () => {
    navigate(-1); // Volver a la página anterior
  };

  const handleGoToList = () => {
    navigate('/trabajadores'); // Ir a la lista de trabajadores
  };

  const handleEdit = () => {
    navigate(`/trabajadores/editar/${id}`); // Ir a editar trabajador
  };

  const handleGenerateReport = () => {
    // TODO: Implementar generación de reporte
    alert('Funcionalidad de generar reporte en desarrollo');
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-content">
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
      <div className="page-container">
        <div className="page-content">
          <div className="error-state">
            <div className="error-icon">❌</div>
            <h3>Error al cargar datos</h3>
            <p>{error}</p>
            <div className="error-actions">
              <button className="btn-secondary" onClick={handleGoBack}>
                ← Volver
              </button>
              <button className="btn-primary" onClick={handleGoToList}>
                Ir a Trabajadores
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!trabajador) return null;

  return (
    <div className="page-container">
      <div className="page-content">
        {/* Header de la página */}
        <div className="page-header">
          <div className="header-navigation">
            <button className="btn-back" onClick={handleGoBack}>
              ← Volver
            </button>
            <div className="breadcrumb">
              <span onClick={handleGoToList} className="breadcrumb-link">Trabajadores</span>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-current">{trabajador.nombre}</span>
            </div>
          </div>
          
          <div className="header-content">
            <div className="worker-avatar-large">
              <span className="avatar-initials-large">{getInitials(trabajador.nombre)}</span>
              <div className="avatar-status-large"></div>
            </div>
            <div className="worker-header-info">
              <h1 className="worker-name-large">{trabajador.nombre}</h1>
              <div className="worker-details-header">
                <span className="worker-id-badge">ID: {trabajador.id}</span>
                <span className="worker-cedula-badge">CC: {trabajador.cedula}</span>
                {trabajador.tipoContratacion && (
                  <span 
                    className="contract-type-badge"
                    style={{ backgroundColor: getContractTypeColor(trabajador.tipoContratacion) }}
                  >
                    {trabajador.tipoContratacion}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="header-actions">
            <button className="btn-secondary" onClick={handleEdit}>
              ✏️ Editar
            </button>
            <button className="btn-primary" onClick={handleGenerateReport}>
              📄 Generar Reporte
            </button>
          </div>
        </div>

        {/* Contenido principal de la página */}
        <div className="page-body">
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
                  <div className="info-card-extra">{trabajador.edad ? `${trabajador.edad} años` : ''}</div>
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
                  <div className="info-card-value">{trabajador.estadoCivil || 'No especificado'}</div>
                </div>
              </div>
              
              <div className="info-card">
                <div className="info-card-icon">🚻</div>
                <div className="info-card-content">
                  <div className="info-card-label">Género</div>
                  <div className="info-card-value">{trabajador.genero || 'No especificado'}</div>
                </div>
              </div>
              
              <div className="info-card">
                <div className="info-card-icon">👶</div>
                <div className="info-card-content">
                  <div className="info-card-label">Hijos</div>
                  <div className="info-card-value">{trabajador.cantidadHijos ?? 'No especificado'}</div>
                </div>
              </div>
              
              <div className="info-card">
                <div className="info-card-icon">🎓</div>
                <div className="info-card-content">
                  <div className="info-card-label">Escolaridad</div>
                  <div className="info-card-value">{trabajador.nivelEscolaridad || 'No especificado'}</div>
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
                  <div className="info-card-value salary-value">
                    {formatSalary(trabajador.salario)}
                  </div>
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
                  <div className="info-card-value email-value">{trabajador.correo || 'No especificado'}</div>
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

        {/* Footer de la página */}
        <div className="page-footer">
          <div className="creation-info">
            <div className="creation-item">
              <span className="creation-icon">📅</span>
              <span>Creado: {formatDate(trabajador.fechaCreacion)}</span>
            </div>
            <div className="creation-item">
              <span className="creation-icon">✏️</span>
              <span>Actualizado: {trabajador.fechaActualizacion ? formatDate(trabajador.fechaActualizacion) : 'Nunca actualizado'}</span>
            </div>
          </div>
          <div className="footer-actions">
            <button className="btn-secondary" onClick={handleGoBack}>
              ← Volver
            </button>
            <button className="btn-primary" onClick={handleGoToList}>
              📋 Ver Todos los Trabajadores
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrabajadorDetailPage;