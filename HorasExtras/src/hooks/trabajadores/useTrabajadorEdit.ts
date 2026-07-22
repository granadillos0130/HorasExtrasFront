import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { trabajadoresService } from "../../api/trabajadoresService";
import {
  obtenerValorNumerico,
  verificarAplicaAuxilio,
} from "../../utils/trabajadores/trabajadorFormUtils";
import type { Trabajador } from "../../types/trabajadores";

export const formatDate = (dateString: string | null | undefined) => {
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

export const getEstadoStyle = (estado: string) => {
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

const initialFormData = {
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
  fechaTerminacion: "",
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
};

export type TrabajadorEditFormData = typeof initialFormData;

const initialExpandedSections = {
  personal: true,
  imagen: false,
  laboral: true,
  contacto: true,
  eps: false,
  arl: false,
  pension: false,
  banco: false,
  clinica: false
};

export function useTrabajadorEdit(id: string | undefined) {
  const navigate = useNavigate();

  const [trabajador, setTrabajador] = useState<Trabajador | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [formData, setFormData] = useState<TrabajadorEditFormData>(initialFormData);

  const [expandedSections, setExpandedSections] = useState(initialExpandedSections);

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
        fechaTerminacion: trabajadorData.fechaTerminacion ? trabajadorData.fechaTerminacion.split('T')[0] : "",
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

    // Fecha de terminación no puede ser anterior a fecha de contratación
    if (formData.fechaTerminacion && formData.fechaContratacion) {
      const fechaContratacion = new Date(formData.fechaContratacion);
      const fechaTerminacion = new Date(formData.fechaTerminacion);

      if (fechaTerminacion < fechaContratacion) {
        newErrors.fechaTerminacion = "La fecha de terminación no puede ser anterior a la fecha de contratación";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      alert("Por favor completa todos los campos requeridos y corrige los errores");
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
        fechaTerminacion: formData.fechaTerminacion,
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
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      alert("Error al actualizar el trabajador: " + errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return {
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
  };
}
