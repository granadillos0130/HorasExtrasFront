// src/components/trabajadores/TrabajadorForm.tsx
import React, { useState, useEffect } from "react";
import { trabajadoresService } from "../../api/trabajadoresService";
import "../../styles/components/trabajador/TrabajadorForm.css";
import type { CrearTrabajadorDto } from "../../types/trabajadores";

interface Props {
  onCreated: (trabajadorId: number) => void;
  onCancel: () => void;
  onRefresh: () => void;
}

const TrabajadorForm: React.FC<Props> = ({ onCreated, onCancel, onRefresh }) => {
  const [form, setForm] = useState<CrearTrabajadorDto>({
    // Información básica del trabajador
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
    auxilioTransporte: 0,
    valorHora: 0,
    fechaContratacion: "",
    correo: "",
    personaContacto: "",
    telefonoContacto: "",
    direccionContacto: "",
    parentescoContacto: "",
    tipoContratacion: "",

    // Servicios de seguridad social
    eps: "",
    epsFechaInicio: "",
    epsFechaFin: "",
    arl: "",
    arlFechaInicio: "",
    arlFechaFin: "",
    fondoPension: "",
    pensionFechaInicio: "",
    pensionFechaFin: "",
    banco: "",
    numeroCuenta: "",
    nombreClinica: "",
    clinicaFechaInicio: "",
    clinicaFechaFin: ""
  });

  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // ✅ Función para formatear números con puntos de miles
  const formatearNumero = (valor: string): string => {
    // Remover caracteres no numéricos
    const numeroLimpio = valor.replace(/\D/g, '');
    // Formatear con puntos de miles
    return numeroLimpio.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // ✅ Función para formatear valor hora con decimales (ej: 14.573,91)
  const formatearValorHora = (valor: number): string => {
    if (!valor || valor === 0) return '0,00';
    
    // Separar parte entera y decimal
    const parteEntera = Math.floor(valor);
    const parteDecimal = Math.round((valor - parteEntera) * 100);
    
    // Formatear parte entera con puntos de miles
    const enteroFormateado = parteEntera.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    // Agregar parte decimal con coma
    return `${enteroFormateado},${parteDecimal.toString().padStart(2, '0')}`;
  };

  // ✅ Función para obtener el valor numérico sin formato
  const obtenerValorNumerico = (valorFormateado: string): number => {
    return parseInt(valorFormateado.replace(/\./g, '')) || 0;
  };

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

  // Auto-calcular valor hora cuando cambia el salario o auxilio de transporte
  useEffect(() => {
    if (form.salario && form.salario > 0) {
      const auxilioTransporte = form.auxilioTransporte || 0;
      const parafiscales = (form.salario * 0.6544) + form.salario + auxilioTransporte;
      const valorHora = parafiscales / 184;
      setForm(prev => ({ ...prev, valorHora: Math.round(valorHora * 100) / 100 }));
    }
  }, [form.salario, form.auxilioTransporte]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // ✅ Manejo especial para campos de dinero (salario y auxilio de transporte)
    if (name === 'salario' || name === 'auxilioTransporte') {
      const valorNumerico = obtenerValorNumerico(value);
      setForm((prev) => ({
        ...prev,
        [name]: valorNumerico
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]:
          ["edad", "cantidadHijos", "valorHora"].includes(name)
            ? Number(value)
            : value
      }));
    }
    
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
      if (form.auxilioTransporte && form.auxilioTransporte < 0) newErrors.auxilioTransporte = "El auxilio de transporte debe ser mayor o igual a 0";
    }

    if (step === 3) {
      if (!form.personaContacto.trim()) newErrors.personaContacto = "La persona de contacto es requerida";
      if (!form.telefonoContacto.trim()) newErrors.telefonoContacto = "El teléfono de contacto es requerido";
      if (!form.parentescoContacto) newErrors.parentescoContacto = "El parentesco es requerido";
    }

    if (step === 4) {
      if (!form.eps.trim()) newErrors.eps = "El nombre de EPS es requerido";
      if (!form.epsFechaInicio) newErrors.epsFechaInicio = "La fecha de inicio de EPS es requerida";
    }

    if (step === 5) {
      if (!form.arl.trim()) newErrors.arl = "El nombre de ARL es requerido";
      if (!form.arlFechaInicio) newErrors.arlFechaInicio = "La fecha de inicio de ARL es requerida";
    }

    if (step === 6) {
      if (!form.fondoPension.trim()) newErrors.fondoPension = "El nombre de Pensión es requerido";
      if (!form.pensionFechaInicio) newErrors.pensionFechaInicio = "La fecha de inicio de Pensión es requerida";
    }

    if (step === 7) {
      if (!form.banco.trim()) newErrors.banco = "El nombre del Banco es requerido";
      if (!form.numeroCuenta.trim()) newErrors.numeroCuenta = "El número de cuenta es requerido";
    }

    if (step === 8) {
      if (!form.nombreClinica.trim()) newErrors.nombreClinica = "El nombre de la Clínica es requerido";
      if (!form.clinicaFechaInicio) newErrors.clinicaFechaInicio = "La fecha de inicio de Clínica es requerida";
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
      // ✅ UNA SOLA LLAMADA con todos los datos
      const resultado = await trabajadoresService.create(form);
      
      alert("Trabajador creado correctamente con todos sus servicios");
      onCreated(resultado.id);
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
                  type="text"
                  name="salario"
                  placeholder="1.500.000"
                  value={form.salario ? formatearNumero(form.salario.toString()) : ''}
                  onChange={handleChange}
                  className={`form-input ${errors.salario ? 'error' : ''}`}
                  disabled={loading}
                />
                {errors.salario && <span className="error-text">{errors.salario}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Auxilio de Transporte</label>
                <input
                  type="text"
                  name="auxilioTransporte"
                  placeholder="140.606"
                  value={form.auxilioTransporte ? formatearNumero(form.auxilioTransporte.toString()) : ''}
                  onChange={handleChange}
                  className={`form-input ${errors.auxilioTransporte ? 'error' : ''}`}
                  disabled={loading}
                />
                {errors.auxilioTransporte && <span className="error-text">{errors.auxilioTransporte}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Valor Hora</label>
                <input
                  type="text"
                  name="valorHora"
                  value={formatearValorHora(form.valorHora || 0)}
                  onChange={handleChange}
                  className="form-input"
                  disabled={true}
                  placeholder="Se calcula automáticamente"
                />
                <small style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                  Fórmula: (Salario × 0.6544 + Salario + Auxilio) ÷ 184
                </small>
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
                  name="eps"
                  placeholder="Ej: Sanitas, Sura, Nueva EPS"
                  value={form.eps}
                  onChange={handleChange}
                  className={`form-input ${errors.eps ? 'error' : ''}`}
                  disabled={loading}
                />
                {errors.eps && <span className="error-text">{errors.eps}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Fecha de Inicio <span className="required">*</span>
                </label>
                <input
                  type="date"
                  name="epsFechaInicio"
                  value={form.epsFechaInicio}
                  onChange={handleChange}
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
                  value={form.epsFechaFin}
                  onChange={handleChange}
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
                  name="arl"
                  placeholder="Ej: Sura ARL, Positiva, Colmena"
                  value={form.arl}
                  onChange={handleChange}
                  className={`form-input ${errors.arl ? 'error' : ''}`}
                  disabled={loading}
                />
                {errors.arl && <span className="error-text">{errors.arl}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Fecha de Inicio <span className="required">*</span>
                </label>
                <input
                  type="date"
                  name="arlFechaInicio"
                  value={form.arlFechaInicio}
                  onChange={handleChange}
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
                  value={form.arlFechaFin}
                  onChange={handleChange}
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
                  name="fondoPension"
                  placeholder="Ej: Protección, Porvenir, Colfondos"
                  value={form.fondoPension}
                  onChange={handleChange}
                  className={`form-input ${errors.fondoPension ? 'error' : ''}`}
                  disabled={loading}
                />
                {errors.fondoPension && <span className="error-text">{errors.fondoPension}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Fecha de Inicio <span className="required">*</span>
                </label>
                <input
                  type="date"
                  name="pensionFechaInicio"
                  value={form.pensionFechaInicio}
                  onChange={handleChange}
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
                  value={form.pensionFechaFin}
                  onChange={handleChange}
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
                  name="banco"
                  placeholder="Ej: Bancolombia, Banco de Bogotá, Nequi"
                  value={form.banco}
                  onChange={handleChange}
                  className={`form-input ${errors.banco ? 'error' : ''}`}
                  disabled={loading}
                />
                {errors.banco && <span className="error-text">{errors.banco}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Número de Cuenta <span className="required">*</span>
                </label>
                <input
                  name="numeroCuenta"
                  placeholder="Ej: 12345678901"
                  value={form.numeroCuenta}
                  onChange={handleChange}
                  className={`form-input ${errors.numeroCuenta ? 'error' : ''}`}
                  disabled={loading}
                />
                {errors.numeroCuenta && <span className="error-text">{errors.numeroCuenta}</span>}
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
                  name="nombreClinica"
                  placeholder="Ej: Clínica del Country, Hospital San Ignacio"
                  value={form.nombreClinica}
                  onChange={handleChange}
                  className={`form-input ${errors.nombreClinica ? 'error' : ''}`}
                  disabled={loading}
                />
                {errors.nombreClinica && <span className="error-text">{errors.nombreClinica}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Fecha de Inicio <span className="required">*</span>
                </label>
                <input
                  type="date"
                  name="clinicaFechaInicio"
                  value={form.clinicaFechaInicio}
                  onChange={handleChange}
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
                  value={form.clinicaFechaFin}
                  onChange={handleChange}
                  className="form-input"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Resumen final en el paso 8 */}
            <div className="form-summary">
              <h5>📋 Resumen del Trabajador</h5>
              <div className="summary-grid">
                <div className="summary-section">
                  <h6>👤 Personal</h6>
                  <p><strong>Nombre:</strong> {form.nombre}</p>
                  <p><strong>Cédula:</strong> {form.cedula}</p>
                  <p><strong>Edad:</strong> {form.edad} años</p>
                  <p><strong>Género:</strong> {form.genero}</p>
                </div>
                
                <div className="summary-section">
                  <h6>💼 Laboral</h6>
                  <p><strong>Correo:</strong> {form.correo}</p>
                  <p><strong>Salario:</strong> ${form.salario ? formatearNumero(form.salario.toString()) : '0'}</p>
                  <p><strong>Auxilio Transporte:</strong> ${form.auxilioTransporte ? formatearNumero(form.auxilioTransporte.toString()) : '0'}</p>
                  <p><strong>Valor Hora:</strong> ${formatearValorHora(form.valorHora || 0)}</p>
                  <p><strong>Tipo:</strong> {form.tipoContratacion}</p>
                </div>

                <div className="summary-section">
                  <h6>🏥 Servicios</h6>
                  <p><strong>EPS:</strong> {form.eps}</p>
                  <p><strong>ARL:</strong> {form.arl}</p>
                  <p><strong>Pensión:</strong> {form.fondoPension}</p>
                  <p><strong>Banco:</strong> {form.banco}</p>
                  <p><strong>Clínica:</strong> {form.nombreClinica}</p>
                </div>
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
                  Creando trabajador completo...
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