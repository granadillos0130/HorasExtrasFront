import React, { useState } from "react";
import { crearAusencia } from "../../api/ausenciasService";
import type { AusenciaDto } from "../../types/ausencia";

const initialState: AusenciaDto = {
  id: 0,
  fecha: new Date(),
  tipoAusencia: "",
  descripcion: "",
  trabajadorNombre: "",
  cargo: "",
  fechaInicio: new Date(),
  fechaFin: new Date(),
  horaInicio: "08:00",
  horaFin: "10:00",
  remunerado: false,
};

const AusenciaForm = () => {
  const [formData, setFormData] = useState<AusenciaDto>(initialState);
  const [mensaje, setMensaje] = useState("");

  const handleChange = (
  e: React.ChangeEvent<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  >
) => {
  const target = e.target;
  const { name, value } = target;

  let newValue: unknown = value;

  if (target instanceof HTMLInputElement && target.type === "checkbox") {
    newValue = target.checked;
  }

  if (name === "fechaInicio" || name === "fechaFin") {
    newValue = new Date(value);
  }

  setFormData((prev) => ({
    ...prev,
    [name]: newValue,
  }));
};


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const nuevaAusencia = {
        ...formData,
        fecha: new Date(), // fecha de solicitud actual
      };

      await crearAusencia(nuevaAusencia);
      setMensaje("Ausencia registrada correctamente.");
      setFormData(initialState); // Reinicia el formulario
    } catch (error) {
      console.error("Error al registrar la ausencia:", error);
      setMensaje("Hubo un error al guardar la ausencia.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Registrar Ausencia</h2>

      <label>Nombre del trabajador:</label>
      <input
        type="text"
        name="trabajadorNombre"
        value={formData.trabajadorNombre}
        onChange={handleChange}
        required
      />

      <label>Cargo:</label>
      <input
        type="text"
        name="cargo"
        value={formData.cargo}
        onChange={handleChange}
        required
      />

      <label>Tipo de Ausencia:</label>
      <select
        name="tipoAusencia"
        value={formData.tipoAusencia}
        onChange={handleChange}
        required
      >
        <option value="">Seleccionar</option>
        <option value="Cita médica">Cita médica</option>
        <option value="Accidente laboral">Accidente laboral</option>
        <option value="Enfermedad común">Enfermedad común</option>
        <option value="Diligencias personales">Diligencias personales</option>
      </select>

      <label>Descripción / Justificación:</label>
      <textarea
        name="descripcion"
        value={formData.descripcion}
        onChange={handleChange}
        required
      />

      <label>Fecha de Inicio:</label>
      <input
        type="date"
        name="fechaInicio"
        value={formData.fechaInicio.toISOString().split("T")[0]}
        onChange={handleChange}
        required
      />

      <label>Fecha de Fin:</label>
      <input
        type="date"
        name="fechaFin"
        value={formData.fechaFin.toISOString().split("T")[0]}
        onChange={handleChange}
        required
      />

      <label>Hora de Inicio:</label>
      <input
        type="time"
        name="horaInicio"
        value={formData.horaInicio}
        onChange={handleChange}
        required
      />

      <label>Hora de Fin:</label>
      <input
        type="time"
        name="horaFin"
        value={formData.horaFin}
        onChange={handleChange}
        required
      />

      <label>
        <input
          type="checkbox"
          name="remunerado"
          checked={formData.remunerado}
          onChange={handleChange}
        />
        ¿Es remunerado?
      </label>

      <button type="submit">Guardar Ausencia</button>

      {mensaje && <p>{mensaje}</p>}
    </form>
  );
};

export default AusenciaForm;
