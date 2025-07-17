// src/components/trabajadores/TrabajadorForm.tsx
import React, { useState, useEffect } from "react";
import { trabajadoresService } from "../../api/trabajadoresService";
import { epsService } from "../../api/epsService";
import { arlService } from "../../api/arlService";
import { pensionService } from "../../api/pensionService";
import { bancoService } from "../../api/bancoService";
import { clinicaService } from "../../api/clinicaService";
import "../../styles/components/TrabajadorForm.css";
import type { CrearTrabajadorDto } from "../../types/trabajadores";
import type { Eps } from "../../types/eps";
import type { Arl } from "../../types/arl";
import type { Pension } from "../../types/pension";
import type { Banco } from "../../types/banco";
import type { Clinica } from "../../types/clinica";

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

  // Estados para los servicios de seguridad social
  const [epsData, setEpsData] = useState<Omit<Eps, "id" | "trabajadorId">>({
    nombre: "",
    fechaInicio: "",
    fechaFin: ""
  });

  const [arlData, setArlData] = useState<Omit<Arl, "id" | "trabajadorId">>({
    nombre: "",
    fechaInicio: "",
    fechaFin: ""
  });

  const [pensionData, setPensionData] = useState<Omit<Pension, "id" | "trabajadorId">>({
    nombre: "",
    fechaInicio: "",
    fechaFin: ""
  });

  const [bancoData, setBancoData] = useState<Omit<Banco, "id" | "trabajadorId">>({
    nombre: "",
    numeroCuenta: ""
  });

  const [clinicaData, setClinicaData] = useState<Omit<Clinica, "id" | "trabajadorId">>({
    nombre: "",
    fechaInicio: "",
    fechaFin: ""
  });

  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [createdWorkerId, setCreatedWorkerId] = useState<number | null>(null);

  // Auto-calcular edad si se ingresa fecha de nacimiento
  useEffect(() => {
    if (form.fechaNacimiento) {
      const today = new Date();
      const birthDate = new Date(form.fechaNacimiento);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      setForm(prev => ({ ...prev, edad: age }));
    }
  }, [form.fechaNacimiento]);

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

    if (step === 4) {
      if (!epsData.nombre.trim()) newErrors.epsNombre = "El nombre de EPS es requerido";
      if (!epsData.fechaInicio) newErrors.epsFechaInicio = "La fecha de inicio de EPS es requerida";
    }

    if (step === 5) {
      if (!arlData.nombre.trim()) newErrors.arlNombre = "El nombre de ARL es requerido";
      if (!arlData.fechaInicio) newErrors.arlFechaInicio = "La fecha de inicio de ARL es requerida";
    }

    if (step === 6) {
      if (!pensionData.nombre.trim()) newErrors.pensionNombre = "El nombre de Pensión es requerido";
      if (!pensionData.fechaInicio) newErrors.pensionFechaInicio = "La fecha de inicio de Pensión es requerida";
    }

    if (step === 7) {
      if (!bancoData.nombre.trim()) newErrors.bancoNombre = "El nombre del Banco es requerido";
      if (!bancoData.numeroCuenta.trim()) newErrors.bancoNumeroCuenta = "El número de cuenta es requerido";
    }

    if (step === 8) {
      if (!clinicaData.nombre.trim()) newErrors.clinicaNombre = "El nombre de la Clínica es requerido";
      if (!clinicaData.fechaInicio) newErrors.clinicaFechaInicio = "La fecha de inicio de Clínica es requerida";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 8));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep < 8) {
      nextStep();
      return;
    }

    if (!validateStep(8)) return;

    setLoading(true);
    try {
      // 1. Crear el trabajador
      const nuevo = await trabajadoresService.create(form);
      setCreatedWorkerId(nuevo.id);
      
      // 2. Crear EPS
      await epsService.crear({
        ...epsData,
        trabajadorId: nuevo.id
      });

      // 3. Crear ARL
      await arlService.crear({
        ...arlData,
        trabajadorId: nuevo.id
      });

      // 4. Crear Pensión
      await pensionService.crear({
        ...pensionData,
        trabajadorId: nuevo.id
      });

      // 5. Crear Banco
      await bancoService.crear({
        ...bancoData,
        trabajadorId: nuevo.id
      });

      // 6. Crear Clínica
      await clinicaService.crear({
        ...clinicaData,
        trabajadorId: nuevo.id
      });

      alert("Trabajador y todos sus servicios creados correctamente");
      onCreated(nuevo.id);
      onRefresh();
      onCancel();
    } catch (error) {
      console.error("Error al crear trabajador:", error);
      alert("Error al crear trabajador y sus servicios.");
    } finally {
      setLoading(false);
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return "Información Personal";
      case 2: return "Información Laboral";
      case 3: return "Contacto de Emergencia";
      case 4: return "EPS";
      case 5: return "ARL";
      case 6: return "Pensión";
      case 7: return "Banco";
      case 8: return "Clínica";
      default: return "";
    }
  };

  const getStepIcon = () => {
    switch (currentStep) {
      case 1: return "👤";
      case 2: return "💼";
      case 3: return "📞";
      case 4: return "⚕️";
      case 5: return "🦺";
      case 6: return "👴";
      case 7: return "🏦";
      case 8: return "🏥";
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
          <p>Paso {currentStep} de 8: {getStepTitle()}</p>
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
            style={{ width: `${(currentStep / 8) * 100}%` }}
          ></div>
        </div>
        <div className="progress-steps">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(step => (
            <div 
              key={step}
              className={`progress-step ${currentStep >= step ? 'active' : ''}`}
            >
              <div className="step-number">{step}</div>
              <div className="step-label">
                {step === 1 ? "Personal" : 
                 step === 2 ? "Laboral" : 
                 step === 3 ? "Contacto" :
                 step === 4 ? "EPS" :
                 step === 5 ? "ARL" :
                 step === 6 ? "Pensión" :
                 step === 7 ? "Banco" :
                 "Clínica"}
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

        {/* Paso 4: EPS */}
        {currentStep === 4 && (
          <div className="form-step">
            <div className="step-header">
              <h4>⚕️ EPS (Entidad Promotora de Salud)</h4>
              <p>Información de la entidad de salud del trabajador</p>
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  Nombre de EPS <span className="required">*</span>
                </label>
                <input
                  name="epsNombre"
                  placeholder="Ej: Sanitas, Sura, Nueva EPS"
                  value={epsData.nombre}
                  onChange={(e) => setEpsData(prev => ({ ...prev, nombre: e.target.value }))}
                  className={`form-input ${errors.epsNombre ? 'error' : ''}`}
                  disabled={loading}
                />
                {errors.epsNombre && <span className="error-text">{errors.epsNombre}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Fecha de Inicio <span className="required">*</span>
                </label>
                <input
                  type="date"
                  name="epsFechaInicio"
                  value={epsData.fechaInicio}
                  onChange={(e) => setEpsData(prev => ({ ...prev, fechaInicio: e.target.value }))}
                  className={`form-input ${errors.epsFechaInicio ? 'error' : ''}`}
                  disabled={loading}
                />
                {errors.epsFechaInicio && <span className="error-text">{errors.epsFechaInicio}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Fecha de Fin (Opcional)</label>
                <input
                  type="date"
                  name="epsFechaFin"
                  value={epsData.fechaFin}
                  onChange={(e) => setEpsData(prev => ({ ...prev, fechaFin: e.target.value }))}
                  className="form-input"
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        )}

        {/* Paso 5: ARL */}
        {currentStep === 5 && (
          <div className="form-step">
            <div className="step-header">
              <h4>🦺 ARL (Administradora de Riesgos Laborales)</h4>
              <p>Información de la administradora de riesgos laborales</p>
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  Nombre de ARL <span className="required">*</span>
                </label>
                <input
                  name="arlNombre"
                  placeholder="Ej: Sura ARL, Positiva, Colmena"
                  value={arlData.nombre}
                  onChange={(e) => setArlData(prev => ({ ...prev, nombre: e.target.value }))}
                  className={`form-input ${errors.arlNombre ? 'error' : ''}`}
                  disabled={loading}
                />
                {errors.arlNombre && <span className="error-text">{errors.arlNombre}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Fecha de Inicio <span className="required">*</span>
                </label>
                <input
                  type="date"
                  name="arlFechaInicio"
                  value={arlData.fechaInicio}
                  onChange={(e) => setArlData(prev => ({ ...prev, fechaInicio: e.target.value }))}
                  className={`form-input ${errors.arlFechaInicio ? 'error' : ''}`}
                  disabled={loading}
                />
                {errors.arlFechaInicio && <span className="error-text">{errors.arlFechaInicio}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Fecha de Fin (Opcional)</label>
                <input
                  type="date"
                  name="arlFechaFin"
                  value={arlData.fechaFin}
                  onChange={(e) => setArlData(prev => ({ ...prev, fechaFin: e.target.value }))}
                  className="form-input"
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        )}

        {/* Paso 6: Pensión */}
        {currentStep === 6 && (
          <div className="form-step">
            <div className="step-header">
              <h4>👴 Fondo de Pensión</h4>
              <p>Información del fondo de pensión del trabajador</p>
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  Nombre del Fondo <span className="required">*</span>
                </label>
                <input
                  name="pensionNombre"
                  placeholder="Ej: Protección, Porvenir, Colfondos"
                  value={pensionData.nombre}
                  onChange={(e) => setPensionData(prev => ({ ...prev, nombre: e.target.value }))}
                  className={`form-input ${errors.pensionNombre ? 'error' : ''}`}
                  disabled={loading}
                />
                {errors.pensionNombre && <span className="error-text">{errors.pensionNombre}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Fecha de Inicio <span className="required">*</span>
                </label>
                <input
                  type="date"
                  name="pensionFechaInicio"
                  value={pensionData.fechaInicio}
                  onChange={(e) => setPensionData(prev => ({ ...prev, fechaInicio: e.target.value }))}
                  className={`form-input ${errors.pensionFechaInicio ? 'error' : ''}`}
                  disabled={loading}
                />
                {errors.pensionFechaInicio && <span className="error-text">{errors.pensionFechaInicio}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Fecha de Fin (Opcional)</label>
                <input
                  type="date"
                  name="pensionFechaFin"
                  value={pensionData.fechaFin}
                  onChange={(e) => setPensionData(prev => ({ ...prev, fechaFin: e.target.value }))}
                  className="form-input"
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        )}

        {/* Paso 7: Banco */}
        {currentStep === 7 && (
          <div className="form-step">
            <div className="step-header">
              <h4>🏦 Información Bancaria</h4>
              <p>Datos bancarios para pagos de nómina</p>
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  Nombre del Banco <span className="required">*</span>
                </label>
                <input
                  name="bancoNombre"
                  placeholder="Ej: Bancolombia, Banco de Bogotá, Nequi"
                  value={bancoData.nombre}
                  onChange={(e) => setBancoData(prev => ({ ...prev, nombre: e.target.value }))}
                  className={`form-input ${errors.bancoNombre ? 'error' : ''}`}
                  disabled={loading}
                />
                {errors.bancoNombre && <span className="error-text">{errors.bancoNombre}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Número de Cuenta <span className="required">*</span>
                </label>
                <input
                  name="bancoNumeroCuenta"
                  placeholder="Ej: 12345678901"
                  value={bancoData.numeroCuenta}
                  onChange={(e) => setBancoData(prev => ({ ...prev, numeroCuenta: e.target.value }))}
                  className={`form-input ${errors.bancoNumeroCuenta ? 'error' : ''}`}
                  disabled={loading}
                />
                {errors.bancoNumeroCuenta && <span className="error-text">{errors.bancoNumeroCuenta}</span>}
              </div>
            </div>
          </div>
        )}

        {/* Paso 8: Clínica */}
        {currentStep === 8 && (
          <div className="form-step">
            <div className="step-header">
              <h4>🏥 Clínica de Atención</h4>
              <p>Información de la clínica o centro médico de preferencia</p>
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  Nombre de la Clínica <span className="required">*</span>
                </label>
                <input
                  name="clinicaNombre"
                  placeholder="Ej: Clínica del Country, Hospital San Ignacio"
                  value={clinicaData.nombre}
                  onChange={(e) => setClinicaData(prev => ({ ...prev, nombre: e.target.value }))}
                  className={`form-input ${errors.clinicaNombre ? 'error' : ''}`}
                  disabled={loading}
                />
                {errors.clinicaNombre && <span className="error-text">{errors.clinicaNombre}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Fecha de Inicio <span className="required">*</span>
                </label>
                <input
                  type="date"
                  name="clinicaFechaInicio"
                  value={clinicaData.fechaInicio}
                  onChange={(e) => setClinicaData(prev => ({ ...prev, fechaInicio: e.target.value }))}
                  className={`form-input ${errors.clinicaFechaInicio ? 'error' : ''}`}
                  disabled={loading}
                />
                {errors.clinicaFechaInicio && <span className="error-text">{errors.clinicaFechaInicio}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Fecha de Fin (Opcional)</label>
                <input
                  type="date"
                  name="clinicaFechaFin"
                  value={clinicaData.fechaFin}
                  onChange={(e) => setClinicaData(prev => ({ ...prev, fechaFin: e.target.value }))}
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
          
          {currentStep < 8 ? (
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
                  Creando trabajador y servicios...
                </>
              ) : (
                <>
                  ✅ Crear Trabajador Completo
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