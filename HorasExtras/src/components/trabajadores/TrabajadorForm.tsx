// src/components/trabajadores/TrabajadorForm.tsx
import React, { useState } from "react";
import { trabajadoresService } from "../../api/trabajadoresService";
import "../../styles/components/TrabajadorForm.css";
import type { CrearTrabajadorDto } from "../../types/trabajadores";

interface Props {
  onCreated: (trabajadorId: number) => void;
  onCancel: () => void;
  onRefresh: () => void;
}

const TrabajadorForm: React.FC<Props> = ({ onCreated, onCancel, onRefresh }) => {
  const [form, setForm] = useState<CrearTrabajadorDto>({
    nombre: "",
    cedula: "",
    rh: "",
    fechaNacimiento: "",
    edad: 0,
    estadoCivil: "",
    genero: "",
    cantidadHijos: 0,
    nivelEscolaridad: "",
    salario: 0,
    fechaContratacion: "",
    correo: "",
    personaContacto: "",
    telefonoContacto: "",
    direccionContacto: "",
    parentescoContacto: "",
    tipoContratacion: ""
  });

  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        ["edad", "cantidadHijos", "salario"].includes(name)
          ? Number(value)
          : value
    }));
    
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }

    // Auto-calcular edad si se ingresa fecha de nacimiento
    if (name === "fechaNacimiento" && value) {
      const today = new Date();
      const birthDate = new Date(value);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      setForm(prev => ({ ...prev, edad: age }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (step === 1) {
      if (!form.nombre.trim()) newErrors.nombre = "El nombre es requerido";
      if (!form.cedula.trim()) newErrors.cedula = "La cédula es requerida";
      if (!form.fechaNacimiento) newErrors.fechaNacimiento = "La fecha de nacimiento es requerida";
      if (!form.genero) newErrors.genero = "El género es requerido";
      if (!form.estadoCivil) newErrors.estadoCivil = "El estado civil es requerido";
    }

    if (step === 2) {
      if (!form.correo.trim()) newErrors.correo = "El correo es requerido";
      if (form.correo && !/\S+@\S+\.\S+/.test(form.correo)) {
        newErrors.correo = "El correo no es válido";
      }
      if (!form.tipoContratacion) newErrors.tipoContratacion = "El tipo de contratación es requerido";
      if (form.salario <= 0) newErrors.salario = "El salario debe ser mayor a 0";
    }

    if (step === 3) {
      if (!form.personaContacto.trim()) newErrors.personaContacto = "La persona de contacto es requerida";
      if (!form.telefonoContacto.trim()) newErrors.telefonoContacto = "El teléfono de contacto es requerido";
      if (!form.parentescoContacto) newErrors.parentescoContacto = "El parentesco es requerido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(3)) return;

    setLoading(true);
    try {
      const nuevo = await trabajadoresService.create(form);
      onCreated(nuevo.id);
      onRefresh();
      onCancel();
    } catch (error) {
      console.error("Error al crear trabajador:", error);
      alert("Error al crear trabajador.");
    } finally {
      setLoading(false);
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return "Información Personal";
      case 2: return "Información Laboral";
      case 3: return "Contacto de Emergencia";
      default: return "";
    }
  };

  const getStepIcon = () => {
    switch (currentStep) {
      case 1: return "👤";
      case 2: return "💼";
      case 3: return "📞";
      default: return "📋";
    }
  };

  return (
    <div className="trabajador-form-container">
      <div className="form-header">
        <div className="form-icon">
          {getStepIcon()}
        </div>
        <div className="form-title-section">
          <h3>Nuevo Trabajador</h3>
          <p>Paso {currentStep} de 3: {getStepTitle()}</p>
        </div>
        <button 
          type="button" 
          className="btn-close"
          onClick={onCancel}
        >
          ❌ Cancelar
        </button>
      </div>

      {/* Indicador de progreso */}
      <div className="progress-indicator">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${(currentStep / 3) * 100}%` }}
          ></div>
        </div>
        <div className="progress-steps">
          {[1, 2, 3].map(step => (
            <div 
              key={step}
              className={`progress-step ${currentStep >= step ? 'active' : ''}`}
            >
              <div className="step-number">{step}</div>
              <div className="step-label">
                {step === 1 ? "Personal" : step === 2 ? "Laboral" : "Contacto"}
              </div>
            </div>
          ))}
        </div>
      </div>

      <form className="trabajador-form" onSubmit={handleSubmit}>
        {/* Paso 1: Información Personal */}
        {currentStep === 1 && (
          <div className="form-step">
            <div className="step-header">
              <h4>👤 Información Personal</h4>
              <p>Datos básicos del trabajador</p>
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  Nombre Completo <span className="required">*</span>
                </label>
                <input
                  name="nombre"
                  placeholder="Ej: Juan Carlos Pérez"
                  value={form.nombre}
                  onChange={handleChange}
                  className={`form-input ${errors.nombre ? 'error' : ''}`}
                  disabled={loading}
                />
                {errors.nombre && <span className="error-text">{errors.nombre}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Cédula <span className="required">*</span>
                </label>
                <input
                  name="cedula"
                  placeholder="Ej: 12345678"
                  value={form.cedula}
                  onChange={handleChange}
                  className={`form-input ${errors.cedula ? 'error' : ''}`}
                  disabled={loading}
                />
                {errors.cedula && <span className="error-text">{errors.cedula}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Tipo de Sangre</label>
                <select
                  name="rh"
                  value={form.rh}
                  onChange={handleChange}
                  className="form-select"
                  disabled={loading}
                >
                  <option value="">Seleccionar</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Fecha de Nacimiento <span className="required">*</span>
                </label>
                <input
                  type="date"
                  name="fechaNacimiento"
                  value={form.fechaNacimiento}
                  onChange={handleChange}
                  className={`form-input ${errors.fechaNacimiento ? 'error' : ''}`}
                  disabled={loading}
                />
                {errors.fechaNacimiento && <span className="error-text">{errors.fechaNacimiento}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Edad</label>
                <input
                  type="number"
                  name="edad"
                  value={form.edad || ''}
                  onChange={handleChange}
                  className="form-input"
                  disabled={true}
                  placeholder="Se calcula automáticamente"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Género <span className="required">*</span>
                </label>
                <select
                  name="genero"
                  value={form.genero}
                  onChange={handleChange}
                  className={`form-select ${errors.genero ? 'error' : ''}`}
                  disabled={loading}
                >
                  <option value="">Seleccionar</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                  <option value="Otro">Otro</option>
                </select>
                {errors.genero && <span className="error-text">{errors.genero}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Estado Civil <span className="required">*</span>
                </label>
                <select
                  name="estadoCivil"
                  value={form.estadoCivil}
                  onChange={handleChange}
                  className={`form-select ${errors.estadoCivil ? 'error' : ''}`}
                  disabled={loading}
                >
                  <option value="">Seleccionar</option>
                  <option value="Soltero">Soltero(a)</option>
                  <option value="Casado">Casado(a)</option>
                  <option value="Divorciado">Divorciado(a)</option>
                  <option value="Viudo">Viudo(a)</option>
                  <option value="Unión Libre">Unión Libre</option>
                </select>
                {errors.estadoCivil && <span className="error-text">{errors.estadoCivil}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Cantidad de Hijos</label>
                <input
                  type="number"
                  name="cantidadHijos"
                  value={form.cantidadHijos || ''}
                  onChange={handleChange}
                  className="form-input"
                  min="0"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nivel de Escolaridad</label>
                <select
                  name="nivelEscolaridad"
                  value={form.nivelEscolaridad}
                  onChange={handleChange}
                  className="form-select"
                  disabled={loading}
                >
                  <option value="">Seleccionar</option>
                  <option value="Primaria">Primaria</option>
                  <option value="Bachillerato">Bachillerato</option>
                  <option value="Técnico">Técnico</option>
                  <option value="Tecnológico">Tecnológico</option>
                  <option value="Universitario">Universitario</option>
                  <option value="Postgrado">Postgrado</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Paso 2: Información Laboral */}
        {currentStep === 2 && (
          <div className="form-step">
            <div className="step-header">
              <h4>💼 Información Laboral</h4>
              <p>Datos relacionados con el trabajo</p>
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  Correo Electrónico <span className="required">*</span>
                </label>
                <input
                  type="email"
                  name="correo"
                  placeholder="ejemplo@correo.com"
                  value={form.correo}
                  onChange={handleChange}
                  className={`form-input ${errors.correo ? 'error' : ''}`}
                  disabled={loading}
                />
                {errors.correo && <span className="error-text">{errors.correo}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Tipo de Contratación <span className="required">*</span>
                </label>
                <select
                  name="tipoContratacion"
                  value={form.tipoContratacion}
                  onChange={handleChange}
                  className={`form-select ${errors.tipoContratacion ? 'error' : ''}`}
                  disabled={loading}
                >
                  <option value="">Seleccionar</option>
                  <option value="Tiempo Completo">Tiempo Completo</option>
                  <option value="Medio Tiempo">Medio Tiempo</option>
                  <option value="Por Horas">Por Horas</option>
                  <option value="Contratista">Contratista</option>
                  <option value="Temporal">Temporal</option>
                </select>
                {errors.tipoContratacion && <span className="error-text">{errors.tipoContratacion}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Salario <span className="required">*</span>
                </label>
                <input
                  type="number"
                  name="salario"
                  placeholder="1500000"
                  value={form.salario || ''}
                  onChange={handleChange}
                  className={`form-input ${errors.salario ? 'error' : ''}`}
                  min="0"
                  disabled={loading}
                />
                {errors.salario && <span className="error-text">{errors.salario}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Fecha de Contratación</label>
                <input
                  type="date"
                  name="fechaContratacion"
                  value={form.fechaContratacion}
                  onChange={handleChange}
                  className="form-input"
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        )}

        {/* Paso 3: Contacto de Emergencia */}
        {currentStep === 3 && (
          <div className="form-step">
            <div className="step-header">
              <h4>📞 Contacto de Emergencia</h4>
              <p>Información de contacto en caso de emergencia</p>
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  Persona de Contacto <span className="required">*</span>
                </label>
                <input
                  name="personaContacto"
                  placeholder="Nombre completo"
                  value={form.personaContacto}
                  onChange={handleChange}
                  className={`form-input ${errors.personaContacto ? 'error' : ''}`}
                  disabled={loading}
                />
                {errors.personaContacto && <span className="error-text">{errors.personaContacto}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Teléfono de Contacto <span className="required">*</span>
                </label>
                <input
                  name="telefonoContacto"
                  placeholder="3001234567"
                  value={form.telefonoContacto}
                  onChange={handleChange}
                  className={`form-input ${errors.telefonoContacto ? 'error' : ''}`}
                  disabled={loading}
                />
                {errors.telefonoContacto && <span className="error-text">{errors.telefonoContacto}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Parentesco <span className="required">*</span>
                </label>
                <select
                  name="parentescoContacto"
                  value={form.parentescoContacto}
                  onChange={handleChange}
                  className={`form-select ${errors.parentescoContacto ? 'error' : ''}`}
                  disabled={loading}
                >
                  <option value="">Seleccionar</option>
                  <option value="Padre">Padre</option>
                  <option value="Madre">Madre</option>
                  <option value="Esposo(a)">Esposo(a)</option>
                  <option value="Hermano(a)">Hermano(a)</option>
                  <option value="Hijo(a)">Hijo(a)</option>
                  <option value="Tío(a)">Tío(a)</option>
                  <option value="Abuelo(a)">Abuelo(a)</option>
                  <option value="Amigo(a)">Amigo(a)</option>
                  <option value="Otro">Otro</option>
                </select>
                {errors.parentescoContacto && <span className="error-text">{errors.parentescoContacto}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Dirección de Contacto</label>
                <input
                  name="direccionContacto"
                  placeholder="Dirección completa"
                  value={form.direccionContacto}
                  onChange={handleChange}
                  className="form-input"
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        )}

        {/* Botones de navegación */}
        <div className="form-actions">
          {currentStep > 1 && (
            <button
              type="button"
              className="btn-secondary"
              onClick={prevStep}
              disabled={loading}
            >
              ← Anterior
            </button>
          )}
          
          <div className="spacer"></div>
          
          {currentStep < 3 ? (
            <button
              type="button"
              className="btn-primary"
              onClick={nextStep}
              disabled={loading}
            >
              Siguiente →
            </button>
          ) : (
            <button
              type="submit"
              className="btn-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Guardando...
                </>
              ) : (
                <>
                  ✅ Crear Trabajador
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default TrabajadorForm;