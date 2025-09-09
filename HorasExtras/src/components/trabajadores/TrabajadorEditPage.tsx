// src/components/trabajadores/TrabajadorEditPage.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getImageUrl, getImageValidationError, fileToBase64 } from "../../utils/imageUtils";

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
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [imageError, setImageError] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Constantes para cálculos
  const SALARIO_MINIMO_2025 = 1400000; // $1,400,000
  const DOS_SALARIOS_MINIMOS = SALARIO_MINIMO_2025 * 2; // $2,800,000

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
    auxilioTransporte: 0,
    valorHora: 0,
    fechaContratacion: "",
    tipoContratacion: "",
    correo: "",

    // Contacto de Emergencia
    personaContacto: "",
    telefonoContacto: "",
    direccionContacto: "",
    parentescoContacto: "",

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
  const handleImageUpload = async (file: File) => {
  // Validar archivo
  const validationError = getImageValidationError(file);
  if (validationError) {
    alert(validationError);
    return;
  }

  try {
    setUploadingImage(true);
    
    // Mostrar preview mientras se sube
    const preview = await fileToBase64(file);
    setImagePreview(preview);

    // Subir imagen
    const result = await trabajadoresService.subirImagen(trabajador!.id, file);
    
    // Actualizar el trabajador local - CORREGIDO: usar undefined en lugar de null
    setTrabajador(prev => prev ? { ...prev, imagen_Url: result.imagenUrl } : null);
    setImagePreview(null);
    setImageError(false);
    
    alert("Imagen actualizada correctamente");
  } catch (error) {
    console.error("Error al subir imagen:", error);
    // CORREGIDO: tipo más específico para error
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    alert("Error al subir la imagen: " + errorMessage);
    setImagePreview(null);
  } finally {
    setUploadingImage(false);
  }
};
  const handleImageDelete = async () => {
  if (!trabajador?.imagen_Url) return;
  
  if (!confirm("¿Estás seguro de que quieres eliminar la imagen?")) return;

  try {
    setUploadingImage(true);
    await trabajadoresService.eliminarImagen(trabajador.id);
    
    // CORREGIDO: usar undefined en lugar de null para imagen_Url
    setTrabajador(prev => prev ? { ...prev, imagen_Url: undefined } : null);
    setImageError(false);
    
    alert("Imagen eliminada correctamente");
  } catch (error) {
    console.error("Error al eliminar imagen:", error);
    // CORREGIDO: tipo más específico para error
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    alert("Error al eliminar la imagen: " + errorMessage);
  } finally {
    setUploadingImage(false);
  }
};
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
    // Limpiar input
    e.target.value = '';
  };
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Estados para manejar secciones colapsables
  const [expandedSections, setExpandedSections] = useState({
    personal: true,
    imagen: false,
    laboral: true,
    contacto: true,
    eps: false,
    arl: false,
    pension: false,
    banco: false,
    clinica: false
  });

  // Función para verificar si aplica auxilio de transporte
  const verificarAplicaAuxilio = (salario: number): boolean => {
    return salario <= DOS_SALARIOS_MINIMOS;
  };

  // Función para formatear números con puntos de miles
  const formatearNumero = (valor: string | number): string => {
    const numeroStr = valor.toString().replace(/\D/g, '');
    return numeroStr.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Función para obtener el valor numérico sin formato
  const obtenerValorNumerico = (valorFormateado: string): number => {
    return parseInt(valorFormateado.replace(/\./g, '')) || 0;
  };

  // Función para calcular valor hora con nueva lógica
  const calcularValorHora = (salario: number, auxilioTransporte: number = 0): number => {
    if (salario <= 0) return 0;

    // Aplicar regla de dos salarios mínimos
    const auxilioAUsar = verificarAplicaAuxilio(salario) ? auxilioTransporte : 0;

    const parafiscales = (salario * 0.6544) + salario + auxilioAUsar;

    // Usar divisor según fecha actual (agosto 2025 o posterior = 176, anterior = 184)
    const divisor = new Date() >= new Date(2025, 7, 1) ? 176 : 184;

    const valorHora = parafiscales / divisor;
    return Math.round(valorHora * 100) / 100; // Redondear a 2 decimales
  };

  // Función para formatear fechas
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'No especificado';

    try {
      let dateToFormat = dateString;
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

  // Función para estilos del estado
  const getEstadoStyle = (estado: string) => {
    if (estado === "Vigente") {
      return {
        backgroundColor: "#22C55E",
        color: "white",
        border: "2px solid #16A34A"
      };
    } else {
      return {
        backgroundColor: "#EF4444",
        color: "white",
        border: "2px solid #DC2626"
      };
    }
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
        auxilioTransporte: trabajadorData.auxilioTransporte || 0,
        valorHora: trabajadorData.valorHora || 0,
        fechaContratacion: trabajadorData.fechaContratacion ? trabajadorData.fechaContratacion.split('T')[0] : "",
        tipoContratacion: trabajadorData.tipoContratacion || "",
        correo: trabajadorData.correo || "",
        personaContacto: trabajadorData.personaContacto || "",
        telefonoContacto: trabajadorData.telefonoContacto || "",
        direccionContacto: trabajadorData.direccionContacto || "",
        parentescoContacto: trabajadorData.parentescoContacto || "",

        // Cargar servicios de seguridad social
        eps: trabajadorData.eps?.nombre || "",
        epsFechaInicio: trabajadorData.eps?.fechaInicio ? trabajadorData.eps.fechaInicio.split('T')[0] : "",
        epsFechaFin: trabajadorData.eps?.fechaFin ? trabajadorData.eps.fechaFin.split('T')[0] : "",
        arl: trabajadorData.arl?.nombre || "",
        arlFechaInicio: trabajadorData.arl?.fechaInicio ? trabajadorData.arl.fechaInicio.split('T')[0] : "",
        arlFechaFin: trabajadorData.arl?.fechaFin ? trabajadorData.arl.fechaFin.split('T')[0] : "",
        fondoPension: trabajadorData.pension?.nombre || "",
        pensionFechaInicio: trabajadorData.pension?.fechaInicio ? trabajadorData.pension.fechaInicio.split('T')[0] : "",
        pensionFechaFin: trabajadorData.pension?.fechaFin ? trabajadorData.pension.fechaFin.split('T')[0] : "",
        banco: trabajadorData.banco?.nombre || "",
        numeroCuenta: trabajadorData.banco?.numeroCuenta || "",
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

    // Manejo especial para campos de dinero (salario y auxilio de transporte)
    if (name === 'salario' || name === 'auxilioTransporte') {
      const valorNumerico = obtenerValorNumerico(value);
      setFormData(prev => {
        const newFormData = {
          ...prev,
          [name]: valorNumerico
        };

        // Recalcular valor hora cuando cambie salario o auxilio de transporte
        const salario = name === 'salario' ? valorNumerico : prev.salario;
        const auxilio = name === 'auxilioTransporte' ? valorNumerico : prev.auxilioTransporte;
        newFormData.valorHora = calcularValorHora(salario, auxilio);

        return newFormData;
      });
    } else {
      const numericValue = ["edad", "cantidadHijos"].includes(name) ? Number(value) : value;

      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
    }

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
    const newErrors: { [key: string]: string } = {};

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
      // Enviar todo en una sola llamada
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
        auxilioTransporte: formData.auxilioTransporte,
        valorHora: formData.valorHora,
        fechaContratacion: formData.fechaContratacion,
        correo: formData.correo,
        personaContacto: formData.personaContacto,
        telefonoContacto: formData.telefonoContacto,
        direccionContacto: formData.direccionContacto,
        parentescoContacto: formData.parentescoContacto,
        tipoContratacion: formData.tipoContratacion,

        // Servicios de seguridad social
        eps: formData.eps,
        epsFechaInicio: formData.epsFechaInicio,
        epsFechaFin: formData.epsFechaFin,
        arl: formData.arl,
        arlFechaInicio: formData.arlFechaInicio,
        arlFechaFin: formData.arlFechaFin,
        fondoPension: formData.fondoPension,
        pensionFechaInicio: formData.pensionFechaInicio,
        pensionFechaFin: formData.pensionFechaFin,
        banco: formData.banco,
        numeroCuenta: formData.numeroCuenta,
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
       imagen: false,
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
      personal: true,
       imagen: true,
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

          {/* NUEVO: Mostrar estado del trabajador en el header */}
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
          {/* NUEVA SECCIÓN: Imagen del Trabajador */}
          <div className="form-section">
            <div
              className="section-header"
              onClick={() => toggleSection('imagen')}
            >
              <div className="section-title">
                <span className="section-icon">🖼️</span>
                <h3>Imagen del Trabajador</h3>
                <span className="optional-badge">Opcional</span>
              </div>
              <span className={`chevron ${expandedSections.imagen ? 'expanded' : ''}`}>
                ▼
              </span>
            </div>

            {expandedSections.imagen && (
              <div className="section-content">
                <div className="image-management-container">

                  {/* Vista previa de la imagen */}
                  <div className="image-preview-section">
                    <div className="image-preview-container">
                      <div className="worker-avatar-large">
                        {(imagePreview || (trabajador?.imagen_Url && !imageError)) ? (
                          <img
                            src={imagePreview || getImageUrl(trabajador?.imagen_Url)!}
                            alt={trabajador?.nombre}
                            className="avatar-image-preview"
                            onError={() => setImageError(true)}
                          />
                        ) : (
                          <div className="avatar-initials-large">
                            {trabajador?.nombre ? getInitials(trabajador.nombre) : 'NA'}
                          </div>
                        )}

                        {/* Overlay de carga */}
                        {uploadingImage && (
                          <div className="upload-overlay">
                            <div className="upload-spinner"></div>
                            <span>Procesando...</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="image-info">
                      <p className="image-status">
                        {trabajador?.imagen_Url ? "✅ Imagen configurada" : "📷 Sin imagen"}
                      </p>
                      <small className="image-requirements">
                        Formatos: JPG, PNG, GIF • Tamaño máximo: 5MB
                      </small>
                    </div>
                  </div>

                  {/* Acciones de imagen */}
                  <div className="image-actions">

                    {/* Input de archivo oculto */}
                    <input
                      type="file"
                      id="imageInput"
                      accept="image/jpeg,image/jpg,image/png,image/gif"
                      onChange={handleFileInputChange}
                      style={{ display: 'none' }}
                      disabled={uploadingImage}
                    />

                    {/* Botón para subir/cambiar imagen */}
                    <button
                      type="button"
                      className="btn-image-upload"
                      onClick={() => document.getElementById('imageInput')?.click()}
                      disabled={uploadingImage || saving}
                    >
                      <span className="btn-icon">📤</span>
                      <span>{trabajador?.imagen_Url ? 'Cambiar Imagen' : 'Subir Imagen'}</span>
                    </button>

                    {/* Botón para eliminar imagen */}
                    {trabajador?.imagen_Url && (
                      <button
                        type="button"
                        className="btn-image-delete"
                        onClick={handleImageDelete}
                        disabled={uploadingImage || saving}
                      >
                        <span className="btn-icon">🗑️</span>
                        <span>Eliminar Imagen</span>
                      </button>
                    )}
                  </div>

                  {/* Mensaje de ayuda */}
                  <div className="image-help">
                    <p>💡 <strong>Consejo:</strong> Una buena imagen mejora la identificación del trabajador en el sistema.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* Sección 2: Información Laboral - ACTUALIZADA CON FECHA DE TERMINACIÓN */}
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

                  {/* NUEVA SECCIÓN: Estado Laboral */}
                  <div className="form-group">
                    <label className="form-label">Estado Laboral</label>
                    <div
                      className="form-input"
                      style={{
                        ...getEstadoStyle(trabajador.estado),
                        textAlign: 'center',
                        fontWeight: '600',
                        fontSize: '14px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}
                    >
                      {trabajador.estado}
                    </div>
                    <small style={{
                      color: 'var(--text-secondary)',
                      fontSize: '0.8rem',
                      display: 'block',
                      marginTop: '4px',
                      fontStyle: 'italic'
                    }}>
                      * El estado se cambia desde la lista de trabajadores
                    </small>
                  </div>

                  {/* MOSTRAR FECHA DE TERMINACIÓN SOLO SI ESTÁ NO VIGENTE */}
                  {trabajador.estado === "No Vigente" && trabajador.fechaTerminacion && (
                    <div className="form-group">
                      <label className="form-label">Fecha de Terminación</label>
                      <div
                        className="form-input"
                        style={{
                          backgroundColor: '#FEF2F2',
                          color: '#EF4444',
                          border: '2px solid #FCA5A5',
                          fontWeight: '600',
                          textAlign: 'center'
                        }}
                      >
                        {formatDate(trabajador.fechaTerminacion)}
                      </div>
                      <small style={{
                        color: '#B91C1C',
                        fontSize: '0.8rem',
                        display: 'block',
                        marginTop: '4px',
                        fontStyle: 'italic'
                      }}>
                        * Fecha cuando se cambió a estado "No Vigente"
                      </small>
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">
                      Salario <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      name="salario"
                      placeholder="1.500.000"
                      value={formData.salario ? formatearNumero(formData.salario.toString()) : ''}
                      onChange={handleFormChange}
                      className={`form-input ${errors.salario ? 'error' : ''}`}
                      disabled={saving}
                    />
                    {errors.salario && <span className="error-text">{errors.salario}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Auxilio de Transporte</label>
                    <input
                      type="text"
                      name="auxilioTransporte"
                      placeholder="140.606"
                      value={formData.auxilioTransporte ? formatearNumero(formData.auxilioTransporte.toString()) : ''}
                      onChange={handleFormChange}
                      className="form-input"
                      disabled={saving}
                    />
                  </div>

                  {/* Campo de Valor Hora Actualizado */}
                  <div className="form-group">
                    <label className="form-label">Valor Hora</label>
                    <input
                      type="text"
                      name="valorHora"
                      value={formData.valorHora ? formatearNumero(formData.valorHora.toString()) : ''}
                      className="form-input"
                      disabled={true}
                      style={{
                        fontStyle: 'italic',
                        color: 'var(--text-secondary)',
                        backgroundColor: 'var(--background-secondary)'
                      }}
                    />

                    {/* Información actualizada con nueva regla */}
                    <div style={{ marginTop: '8px' }}>
                      <small style={{
                        color: 'var(--text-secondary)',
                        fontSize: '0.8rem',
                        display: 'block',
                        marginBottom: '4px'
                      }}>
                        📊 <strong>Fórmula:</strong> (Salario × 1.6544 + Auxilio*) ÷ {new Date() >= new Date(2025, 7, 1) ? '176' : '184'}
                      </small>

                      {/* Mostrar si aplica auxilio según el salario actual */}
                      {formData.salario > 0 && (
                        <small style={{
                          color: verificarAplicaAuxilio(formData.salario) ? 'var(--success-color, #22c55e)' : 'var(--warning-color, #f59e0b)',
                          fontSize: '0.8rem',
                          display: 'block',
                          marginBottom: '4px',
                          fontWeight: '500'
                        }}>
                          {verificarAplicaAuxilio(formData.salario) ? (
                            <span>✅ <strong>Auxilio de transporte:</strong> SÍ aplica (salario ≤ ${formatearNumero(DOS_SALARIOS_MINIMOS.toString())})</span>
                          ) : (
                            <span>⚠️ <strong>Auxilio de transporte:</strong> NO aplica (salario {'>'} ${formatearNumero(DOS_SALARIOS_MINIMOS.toString())})</span>
                          )}
                        </small>
                      )}

                      <small style={{
                        color: 'var(--text-secondary)',
                        fontSize: '0.75rem',
                        display: 'block',
                        fontStyle: 'italic'
                      }}>
                        * El auxilio de transporte solo se incluye si el salario no supera dos salarios mínimos (${formatearNumero(DOS_SALARIOS_MINIMOS.toString())} en 2025)
                      </small>
                    </div>
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

          {/* Resto de las secciones permanecen igual... */}
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

          {/* Las demás secciones (EPS, ARL, Pensión, Banco, Clínica) permanecen igual... */}
          {/* Por brevedad, las omito aquí, pero en el código real deben estar todas */}

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