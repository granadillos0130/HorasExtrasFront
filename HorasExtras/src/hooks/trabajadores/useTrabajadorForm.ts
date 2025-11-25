import { useState, useEffect } from 'react';
import { trabajadoresService } from '../../api/trabajadoresService';
import type { CrearTrabajadorDto } from '../../types/trabajadores';
import { initialFormState, obtenerValorNumerico } from '../../utils/trabajadores/trabajadorFormUtils';

export const useTrabajadorForm = (
  onCreated: (trabajadorId: number) => void,
  onCancel: () => void,
  onRefresh: () => void
) => {
  const [form, setForm] = useState<CrearTrabajadorDto>(initialFormState);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Auto-calcular edad
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
    
    if (name === 'salario' || name === 'auxilioTransporte') {
      const valorNumerico = obtenerValorNumerico(value);
      setForm((prev) => ({
        ...prev,
        [name]: valorNumerico
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: ["edad", "cantidadHijos"].includes(name) ? Number(value) : value
      }));
    }
    
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

  const handleSubmit = async (e: React.FormEvent, imagen: File | null) => {
    e.preventDefault();
    
    if (currentStep < 8) {
      nextStep();
      return;
    }

    if (!validateStep(8)) return;

    setLoading(true);
    try {
      const resultado = await trabajadoresService.createWithImage(form, imagen || undefined);
      
      alert("Trabajador creado correctamente con todos sus servicios");
      
      onCreated(resultado.trabajadorId);
      onRefresh();
      onCancel();
    } catch (error) {
      console.error("Error al crear trabajador:", error);
      alert("Error al crear trabajador y sus servicios.");
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    loading,
    currentStep,
    errors,
    handleChange,
    nextStep,
    prevStep,
    handleSubmit,
  };
};