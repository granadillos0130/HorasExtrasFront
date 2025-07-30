// src/components/trabajadores/TrabajadorEditPage.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { trabajadoresService } from "../../api/trabajadoresService";
import type { Trabajador } from "../../types/trabajadores";
import "../../styles/components/trabajador/TrabajadorEditPage.css";

const TrabajadorEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [trabajador, setTrabajador] = useState<Trabajador | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Estados para todas las secciones
  const [formData, setFormData] = useState({
    // Información Personal
    nombre: "",
    cedula: "",
    rh: "",
    fechaNacimiento: "",
    edad: 0,
    estadoCivil: "",
    genero: "",
    cantidadHijos: 0,
    nivelEscolaridad: "",
    
    // Información Laboral
    salario: 0,
    auxilioTransporte: 0, // 🆕 NUEVO CAMPO
    valorHora: 0,         // 🆕 NUEVO CAMPO (calculado automáticamente)
    fechaContratacion: "",
    tipoContratacion: "",
    correo: "",
    
    // Contacto de Emergencia
    personaContacto: "",
    telefonoContacto: "",
    direccionContacto: "",
    parentescoContacto: "",

    // ===== SERVICIOS DE SEGURIDAD SOCIAL =====
    // EPS
    eps: "",
    epsFechaInicio: "",
    epsFechaFin: "",

    // ARL
    arl: "",
    arlFechaInicio: "",
    arlFechaFin: "",

    // PENSIÓN
    fondoPension: "",
    pensionFechaInicio: "",
    pensionFechaFin: "",

    // BANCO
    banco: "",
    numeroCuenta: "",

    // CLÍNICA
    nombreClinica: "",
    clinicaFechaInicio: "",
    clinicaFechaFin: ""
  });

  // Estados para manejar secciones colapsables
  const [expandedSections, setExpandedSections] = useState({
    personal: true,
    laboral: true,
    contacto: true,
    eps: false,
    arl: false,
    pension: false,
    banco: false,
    clinica: false
  });

  // 🆕 FUNCIÓN PARA CALCULAR VALOR HORA
  const calcularValorHora = (salario: number, auxilioTransporte: number = 0): number => {
    if (salario <= 0) return 0;
    
    const parafiscales = (salario * 0.6544) + salario + auxilioTransporte;
    const valorHora = parafiscales / 184;
    return Math.round(valorHora * 100) / 100; // Redondear a 2 decimales
  };

  useEffect(() => {
    if (id) {
      cargarTrabajador(Number(id));
    }
  }, [id]);

  const cargarTrabajador = async (trabajadorId: number) => {
    try {
      setLoading(true);
      const trabajadorData = await trabajadoresService.getById(trabajadorId);
      setTrabajador(trabajadorData);
      
      // Cargar datos básicos del trabajador con validaciones
      setFormData({
        nombre: trabajadorData.nombre || "",
        cedula: trabajadorData.cedula || "",
        rh: trabajadorData.rh || "",
        fechaNacimiento: trabajadorData.fechaNacimiento ? trabajadorData.fechaNacimiento.split('T')[0] : "",
        edad: trabajadorData.edad || 0,
        estadoCivil: trabajadorData.estadoCivil || "",
        genero: trabajadorData.genero || "",
        cantidadHijos: trabajadorData.cantidadHijos || 0,
        nivelEscolaridad: trabajadorData.nivelEscolaridad || "",
        salario: trabajadorData.salario || 0,
        auxilioTransporte: trabajadorData.auxilioTransporte || 0, // 🆕 CARGAR AUXILIO
        valorHora: trabajadorData.valorHora || 0,                 // 🆕 CARGAR VALOR HORA
        fechaContratacion: trabajadorData.fechaContratacion ? trabajadorData.fechaContratacion.split('T')[0] : "",
        tipoContratacion: trabajadorData.tipoContratacion || "",
        correo: trabajadorData.correo || "",
        personaContacto: trabajadorData.personaContacto || "",
        telefonoContacto: trabajadorData.telefonoContacto || "",
        direccionContacto: trabajadorData.direccionContacto || "",
        parentescoContacto: trabajadorData.parentescoContacto || "",

        // ===== CARGAR SERVICIOS DE SEGURIDAD SOCIAL =====
        // EPS
        eps: trabajadorData.eps?.nombre || "",
        epsFechaInicio: trabajadorData.eps?.fechaInicio ? trabajadorData.eps.fechaInicio.split('T')[0] : "",
        epsFechaFin: trabajadorData.eps?.fechaFin ? trabajadorData.eps.fechaFin.split('T')[0] : "",

        // ARL
        arl: trabajadorData.arl?.nombre || "",
        arlFechaInicio: trabajadorData.arl?.fechaInicio ? trabajadorData.arl.fechaInicio.split('T')[0] : "",
        arlFechaFin: trabajadorData.arl?.fechaFin ? trabajadorData.arl.fechaFin.split('T')[0] : "",

        // PENSIÓN
        fondoPension: trabajadorData.pension?.nombre || "",
        pensionFechaInicio: trabajadorData.pension?.fechaInicio ? trabajadorData.pension.fechaInicio.split('T')[0] : "",
        pensionFechaFin: trabajadorData.pension?.fechaFin ? trabajadorData.pension.fechaFin.split('T')[0] : "",

        // BANCO
        banco: trabajadorData.banco?.nombre || "",
        numeroCuenta: trabajadorData.banco?.numeroCuenta || "",

        // CLÍNICA
        nombreClinica: trabajadorData.clinica?.nombre || "",
        clinicaFechaInicio: trabajadorData.clinica?.fechaInicio ? trabajadorData.clinica.fechaInicio.split('T')[0] : "",
        clinicaFechaFin: trabajadorData.clinica?.fechaFin ? trabajadorData.clinica.fechaFin.split('T')[0] : ""
      });

      // Expandir secciones si tienen datos
      if (trabajadorData.eps?.nombre) {
        setExpandedSections(prev => ({ ...prev, eps: true }));
      }
      if (trabajadorData.arl?.nombre) {
        setExpandedSections(prev => ({ ...prev, arl: true }));
      }
      if (trabajadorData.pension?.nombre) {
        setExpandedSections(prev => ({ ...prev, pension: true }));
      }
      if (trabajadorData.banco?.nombre) {
        setExpandedSections(prev => ({ ...prev, banco: true }));
      }
      if (trabajadorData.clinica?.nombre) {
        setExpandedSections(prev => ({ ...prev, clinica: true }));
      }
      
    } catch (err) {
      setError("Error al cargar la información del trabajador");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const numericValue = ["edad", "cantidadHijos", "salario", "auxilioTransporte"].includes(name) ? Number(value) : value;
    
    setFormData(prev => {
      const newFormData = {
        ...prev,
        [name]: numericValue
      };

      // 🆕 RECALCULAR VALOR HORA cuando cambie salario o auxilio de transporte
      if (name === "salario" || name === "auxilioTransporte") {
        const salario = name === "salario" ? Number(value) : prev.salario;
        const auxilio = name === "auxilioTransporte" ? Number(value) : prev.auxilioTransporte;
        newFormData.valorHora = calcularValorHora(salario, auxilio);
      }

      return newFormData;
    });
    
    // Auto-calcular edad
    if (name === "fechaNacimiento" && value) {
      const today = new Date();
      const birthDate = new Date(value);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      setFormData(prev => ({ ...prev, edad: age }));
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev]
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    // Validaciones de información personal (requerida)
    if (!formData.nombre.trim()) newErrors.nombre = "El nombre es requerido";
    if (!formData.cedula.trim()) newErrors.cedula = "La cédula es requerida";
    if (!formData.fechaNacimiento) newErrors.fechaNacimiento = "La fecha de nacimiento es requerida";
    if (!formData.genero) newErrors.genero = "El género es requerido";
    if (!formData.estadoCivil) newErrors.estadoCivil = "El estado civil es requerido";

    // Validaciones de información laboral (requerida)
    if (!formData.correo.trim()) newErrors.correo = "El correo es requerido";
    if (formData.correo && !/\S+@\S+\.\S+/.test(formData.correo)) {
      newErrors.correo = "El correo no es válido";
    }
    if (!formData.tipoContratacion) newErrors.tipoContratacion = "El tipo de contratación es requerido";
    if (formData.salario <= 0) newErrors.salario = "El salario debe ser mayor a 0";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert("Por favor completa todos los campos requeridos");
      return;
    }
    
    if (!trabajador) return;

    setSaving(true);
    try {
      // ===== ENVIAR TODO EN UNA SOLA LLAMADA =====
      const updateDto = {
        // Información básica del trabajador
        nombre: formData.nombre,
        cedula: formData.cedula,
        rh: formData.rh,
        fechaNacimiento: formData.fechaNacimiento,
        edad: formData.edad,
        estadoCivil: formData.estadoCivil,
        genero: formData.genero,
        cantidadHijos: formData.cantidadHijos,
        nivelEscolaridad: formData.nivelEscolaridad,
        salario: formData.salario,
        auxilioTransporte: formData.auxilioTransporte, // 🆕 ENVIAR AUXILIO
        valorHora: formData.valorHora,                 // 🆕 ENVIAR VALOR HORA
        fechaContratacion: formData.fechaContratacion,
        correo: formData.correo,
        personaContacto: formData.personaContacto,
        telefonoContacto: formData.telefonoContacto,
        direccionContacto: formData.direccionContacto,
        parentescoContacto: formData.parentescoContacto,
        tipoContratacion: formData.tipoContratacion,

        // ===== SERVICIOS DE SEGURIDAD SOCIAL =====
        // EPS
        eps: formData.eps,
        epsFechaInicio: formData.epsFechaInicio,
        epsFechaFin: formData.epsFechaFin,

        // ARL
        arl: formData.arl,
        arlFechaInicio: formData.arlFechaInicio,
        arlFechaFin: formData.arlFechaFin,

        // PENSIÓN
        fondoPension: formData.fondoPension,
        pensionFechaInicio: formData.pensionFechaInicio,
        pensionFechaFin: formData.pensionFechaFin,

        // BANCO
        banco: formData.banco,
        numeroCuenta: formData.numeroCuenta,

        // CLÍNICA
        nombreClinica: formData.nombreClinica,
        clinicaFechaInicio: formData.clinicaFechaInicio,
        clinicaFechaFin: formData.clinicaFechaFin
      };

      console.log("Enviando datos:", updateDto);

      // Una sola llamada para actualizar todo
      await trabajadoresService.update(trabajador.id, updateDto);

      alert("Trabajador actualizado correctamente");
      navigate("/trabajadores");
      
    } catch (error) {
      console.error("Error al actualizar trabajador:", error);
      alert("Error al actualizar el trabajador: " + (error as any)?.message || "Error desconocido");
    } finally {
      setSaving(false);
    }
  };

  const expandAll = () => {
    setExpandedSections({
      personal: true,
      laboral: true,
      contacto: true,
      eps: true,
      arl: true,
      pension: true,
      banco: true,
      clinica: true
    });
  };

  const collapseAll = () => {
    setExpandedSections({
      personal: true, // Mantenemos personal y laboral siempre visibles
      laboral: true,
      contacto: true,
      eps: false,
      arl: false,
      pension: false,
      banco: false,
      clinica: false
    });
  };

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
          
          {/* Sección 1: Información Personal */}
          <div className="form-section">
            <div 
              className="section-header"
              onClick={() => toggleSection('personal')}
            >
              <div className="section-title">
                <span className="section-icon">👤</span>
                <h3>Información Personal</h3>
                <span className="required-badge">Requerido</span>
              </div>
              <span className={`chevron ${expandedSections.personal ? 'expanded' : ''}`}>
                ▼
              </span>
            </div>
            
            {expandedSections.personal && (
              <div className="section-content">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">
                      Nombre Completo <span className="required">*</span>
                    </label>
                    <input
                      name="nombre"
                      placeholder="Ej: Juan Carlos Pérez"
                      value={formData.nombre}
                      onChange={handleFormChange}
                      className={`form-input ${errors.nombre ? 'error' : ''}`}
                      disabled={saving}
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
                      value={formData.cedula}
                      onChange={handleFormChange}
                      className={`form-input ${errors.cedula ? 'error' : ''}`}
                      disabled={saving}
                    />
                    {errors.cedula && <span className="error-text">{errors.cedula}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tipo de Sangre</label>
                    <select
                      name="rh"
                      value={formData.rh}
                      onChange={handleFormChange}
                      className="form-select"
                      disabled={saving}
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
                      value={formData.fechaNacimiento}
                      onChange={handleFormChange}
                      className={`form-input ${errors.fechaNacimiento ? 'error' : ''}`}
                      disabled={saving}
                    />
                    {errors.fechaNacimiento && <span className="error-text">{errors.fechaNacimiento}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Edad</label>
                    <input
                      type="number"
                      name="edad"
                      value={formData.edad || ''}
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
                      value={formData.genero}
                      onChange={handleFormChange}
                      className={`form-select ${errors.genero ? 'error' : ''}`}
                      disabled={saving}
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
                      value={formData.estadoCivil}
                      onChange={handleFormChange}
                      className={`form-select ${errors.estadoCivil ? 'error' : ''}`}
                      disabled={saving}
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
                      value={formData.cantidadHijos || ''}
                      onChange={handleFormChange}
                      className="form-input"
                      min="0"
                      disabled={saving}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Nivel de Escolaridad</label>
                    <select
                      name="nivelEscolaridad"
                      value={formData.nivelEscolaridad}
                      onChange={handleFormChange}
                      className="form-select"
                      disabled={saving}
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
          </div>

          {/* Sección 2: Información Laboral */}
          <div className="form-section">
            <div 
              className="section-header"
              onClick={() => toggleSection('laboral')}
            >
              <div className="section-title">
                <span className="section-icon">💼</span>
                <h3>Información Laboral</h3>
                <span className="required-badge">Requerido</span>
              </div>
              <span className={`chevron ${expandedSections.laboral ? 'expanded' : ''}`}>
                ▼
              </span>
            </div>
            
            {expandedSections.laboral && (
              <div className="section-content">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">
                      Correo Electrónico <span className="required">*</span>
                    </label>
                    <input
                      type="email"
                      name="correo"
                      placeholder="ejemplo@correo.com"
                      value={formData.correo}
                      onChange={handleFormChange}
                      className={`form-input ${errors.correo ? 'error' : ''}`}
                      disabled={saving}
                    />
                    {errors.correo && <span className="error-text">{errors.correo}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Tipo de Contratación <span className="required">*</span>
                    </label>
                    <select
                      name="tipoContratacion"
                      value={formData.tipoContratacion}
                      onChange={handleFormChange}
                      className={`form-select ${errors.tipoContratacion ? 'error' : ''}`}
                      disabled={saving}
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
                      value={formData.salario || ''}
                      onChange={handleFormChange}
                      className={`form-input ${errors.salario ? 'error' : ''}`}
                      min="0"
                      disabled={saving}
                    />
                    {errors.salario && <span className="error-text">{errors.salario}</span>}
                  </div>

                  {/* 🆕 NUEVO CAMPO: AUXILIO DE TRANSPORTE */}
                  <div className="form-group">
                    <label className="form-label">Auxilio de Transporte</label>
                    <input
                      type="number"
                      name="auxilioTransporte"
                      placeholder="140606"
                      value={formData.auxilioTransporte || ''}
                      onChange={handleFormChange}
                      className="form-input"
                      min="0"
                      disabled={saving}
                    />
                    <small className="form-help">
                      Auxilio de transporte mensual (opcional)
                    </small>
                  </div>

                  {/* 🆕 NUEVO CAMPO: VALOR HORA (CALCULADO) */}
                  <div className="form-group">
                    <label className="form-label">Valor Hora</label>
                    <input
                      type="number"
                      name="valorHora"
                      value={formData.valorHora || ''}
                      className="form-input"
                      disabled={true}
                      placeholder="Se calcula automáticamente"
                    />
                    <small className="form-help">
                      Se calcula automáticamente: (Salario × 1.6544 + Salario + Auxilio) ÷ 184
                    </small>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Fecha de Contratación</label>
                    <input
                      type="date"
                      name="fechaContratacion"
                      value={formData.fechaContratacion}
                      onChange={handleFormChange}
                      className="form-input"
                      disabled={saving}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Las demás secciones permanecen igual... */}
          {/* Sección 3: Contacto de Emergencia */}
          <div className="form-section">
            <div 
              className="section-header"
              onClick={() => toggleSection('contacto')}
            >
              <div className="section-title">
                <span className="section-icon">📞</span>
                <h3>Contacto de Emergencia</h3>
                <span className="optional-badge">Opcional</span>
              </div>
              <span className={`chevron ${expandedSections.contacto ? 'expanded' : ''}`}>
                ▼
              </span>
            </div>
            
            {expandedSections.contacto && (
              <div className="section-content">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Persona de Contacto</label>
                    <input
                      name="personaContacto"
                      placeholder="Nombre completo"
                      value={formData.personaContacto}
                      onChange={handleFormChange}
                      className="form-input"
                      disabled={saving}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Teléfono de Contacto</label>
                    <input
                      name="telefonoContacto"
                      placeholder="3001234567"
                      value={formData.telefonoContacto}
                      onChange={handleFormChange}
                      className="form-input"
                      disabled={saving}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Parentesco</label>
                    <select
                      name="parentescoContacto"
                      value={formData.parentescoContacto}
                      onChange={handleFormChange}
                      className="form-select"
                      disabled={saving}
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
                  </div>

                  <div className="form-group">
                    <label className="form-label">Dirección de Contacto</label>
                    <input
                      name="direccionContacto"
                      placeholder="Dirección completa"
                      value={formData.direccionContacto}
                      onChange={handleFormChange}
                      className="form-input"
                      disabled={saving}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sección 4: EPS */}
          <div className="form-section">
            <div 
              className="section-header"
              onClick={() => toggleSection('eps')}
            >
              <div className="section-title">
                <span className="section-icon">⚕️</span>
                <h3>EPS (Entidad Promotora de Salud)</h3>
                <span className="optional-badge">Opcional</span>
              </div>
              <span className={`chevron ${expandedSections.eps ? 'expanded' : ''}`}>
                ▼
              </span>
            </div>
            
            {expandedSections.eps && (
              <div className="section-content">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Nombre de EPS</label>
                    <input
                      name="eps"
                      placeholder="Ej: Sanitas, Sura, Nueva EPS"
                      value={formData.eps}
                      onChange={handleFormChange}
                      className="form-input"
                      disabled={saving}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Fecha de Inicio</label>
                    <input
                      type="date"
                      name="epsFechaInicio"
                      value={formData.epsFechaInicio}
                      onChange={handleFormChange}
                      className="form-input"
                      disabled={saving}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Fecha de Fin (Opcional)</label>
                    <input
                      type="date"
                      name="epsFechaFin"
                      value={formData.epsFechaFin}
                      onChange={handleFormChange}
                      className="form-input"
                      disabled={saving}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sección 5: ARL */}
          <div className="form-section">
            <div 
              className="section-header"
              onClick={() => toggleSection('arl')}
            >
              <div className="section-title">
                <span className="section-icon">🦺</span>
                <h3>ARL (Administradora de Riesgos Laborales)</h3>
                <span className="optional-badge">Opcional</span>
              </div>
              <span className={`chevron ${expandedSections.arl ? 'expanded' : ''}`}>
                ▼
              </span>
            </div>
            
            {expandedSections.arl && (
              <div className="section-content">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Nombre de ARL</label>
                    <input
                      name="arl"
                      placeholder="Ej: Sura ARL, Positiva, Colmena"
                      value={formData.arl}
                      onChange={handleFormChange}
                      className="form-input"
                      disabled={saving}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Fecha de Inicio</label>
                    <input
                      type="date"
                      name="arlFechaInicio"
                      value={formData.arlFechaInicio}
                      onChange={handleFormChange}
                      className="form-input"
                      disabled={saving}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Fecha de Fin (Opcional)</label>
                    <input
                      type="date"
                      name="arlFechaFin"
                      value={formData.arlFechaFin}
                      onChange={handleFormChange}
                      className="form-input"
                      disabled={saving}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sección 6: Pensión */}
          <div className="form-section">
            <div 
              className="section-header"
              onClick={() => toggleSection('pension')}
            >
              <div className="section-title">
                <span className="section-icon">👴</span>
                <h3>Fondo de Pensión</h3>
                <span className="optional-badge">Opcional</span>
              </div>
              <span className={`chevron ${expandedSections.pension ? 'expanded' : ''}`}>
                ▼
              </span>
            </div>
            
            {expandedSections.pension && (
              <div className="section-content">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Nombre del Fondo</label>
                    <input
                      name="fondoPension"
                      placeholder="Ej: Protección, Porvenir, Colfondos"
                      value={formData.fondoPension}
                      onChange={handleFormChange}
                      className="form-input"
                      disabled={saving}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Fecha de Inicio</label>
                    <input
                      type="date"
                      name="pensionFechaInicio"
                      value={formData.pensionFechaInicio}
                      onChange={handleFormChange}
                      className="form-input"
                      disabled={saving}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Fecha de Fin (Opcional)</label>
                    <input
                      type="date"
                      name="pensionFechaFin"
                      value={formData.pensionFechaFin}
                      onChange={handleFormChange}
                      className="form-input"
                      disabled={saving}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sección 7: Banco */}
          <div className="form-section">
            <div 
              className="section-header"
              onClick={() => toggleSection('banco')}
            >
              <div className="section-title">
                <span className="section-icon">🏦</span>
                <h3>Información Bancaria</h3>
                <span className="optional-badge">Opcional</span>
              </div>
              <span className={`chevron ${expandedSections.banco ? 'expanded' : ''}`}>
                ▼
              </span>
            </div>
            
            {expandedSections.banco && (
              <div className="section-content">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Nombre del Banco</label>
                    <input
                      name="banco"
                      placeholder="Ej: Bancolombia, Banco de Bogotá, Nequi"
                      value={formData.banco}
                      onChange={handleFormChange}
                      className="form-input"
                      disabled={saving}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Número de Cuenta</label>
                    <input
                      name="numeroCuenta"
                      placeholder="Ej: 12345678901"
                      value={formData.numeroCuenta}
                      onChange={handleFormChange}
                      className="form-input"
                      disabled={saving}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sección 8: Clínica */}
          <div className="form-section">
            <div 
              className="section-header"
              onClick={() => toggleSection('clinica')}
            >
              <div className="section-title">
                <span className="section-icon">🏥</span>
                <h3>Clínica de Atención</h3>
                <span className="optional-badge">Opcional</span>
              </div>
              <span className={`chevron ${expandedSections.clinica ? 'expanded' : ''}`}>
                ▼
              </span>
            </div>
            
            {expandedSections.clinica && (
              <div className="section-content">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Nombre de la Clínica</label>
                    <input
                      name="nombreClinica"
                      placeholder="Ej: Clínica del Country, Hospital San Ignacio"
                      value={formData.nombreClinica}
                      onChange={handleFormChange}
                      className="form-input"
                      disabled={saving}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Fecha de Inicio</label>
                    <input
                      type="date"
                      name="clinicaFechaInicio"
                      value={formData.clinicaFechaInicio}
                      onChange={handleFormChange}
                      className="form-input"
                      disabled={saving}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Fecha de Fin (Opcional)</label>
                    <input
                      type="date"
                      name="clinicaFechaFin"
                      value={formData.clinicaFechaFin}
                      onChange={handleFormChange}
                      className="form-input"
                      disabled={saving}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

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