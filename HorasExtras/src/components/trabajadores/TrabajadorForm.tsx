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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        ["edad", "cantidadHijos", "salario"].includes(name)
          ? Number(value)
          : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const nuevo = await trabajadoresService.create(form);
      onCreated(nuevo.id);
      onRefresh();
      onCancel(); // Ocultar el formulario
    } catch (error) {
      console.error("Error al crear trabajador:", error);
      alert("Error al crear trabajador.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="trabajador-form" onSubmit={handleSubmit}>
      <h3>Nuevo Trabajador</h3>
      <div className="form-grid">
        <input name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} />
        <input name="cedula" placeholder="Cédula" value={form.cedula} onChange={handleChange} />
        <input name="rh" placeholder="RH" value={form.rh} onChange={handleChange} />
        <input type="date" name="fechaNacimiento" placeholder="Fecha Nacimiento" value={form.fechaNacimiento} onChange={handleChange} />
        <input type="number" name="edad" placeholder="Edad" value={form.edad} onChange={handleChange} />
        <input name="estadoCivil" placeholder="Estado Civil" value={form.estadoCivil} onChange={handleChange} />
        <input name="genero" placeholder="Género" value={form.genero} onChange={handleChange} />
        <input type="number" name="cantidadHijos" placeholder="Cantidad Hijos" value={form.cantidadHijos} onChange={handleChange} />
        <input name="nivelEscolaridad" placeholder="Nivel Escolaridad" value={form.nivelEscolaridad} onChange={handleChange} />
        <input type="number" name="salario" placeholder="Salario" value={form.salario} onChange={handleChange} />
        <input type="date" name="fechaContratacion" placeholder="Fecha Contratación" value={form.fechaContratacion} onChange={handleChange} />
        <input type="email" name="correo" placeholder="Correo Electrónico" value={form.correo} onChange={handleChange} />
        <input name="personaContacto" placeholder="Persona Contacto" value={form.personaContacto} onChange={handleChange} />
        <input name="telefonoContacto" placeholder="Teléfono Contacto" value={form.telefonoContacto} onChange={handleChange} />
        <input name="direccionContacto" placeholder="Dirección Contacto" value={form.direccionContacto} onChange={handleChange} />
        <input name="parentescoContacto" placeholder="Parentesco Contacto" value={form.parentescoContacto} onChange={handleChange} />
        <input name="tipoContratacion" placeholder="Tipo Contratación" value={form.tipoContratacion} onChange={handleChange} />
      </div>
      <div className="form-actions">
        <button type="submit" disabled={loading}>
          {loading ? "Guardando..." : "✅ Guardar"}
        </button>
        <button type="button" onClick={onCancel}>
          ❌ Cancelar
        </button>
      </div>
    </form>
  );
};

export default TrabajadorForm;
