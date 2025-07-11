import React, { useState } from "react";
import { centrosService } from "../../api/centrosService";
import type { Centro } from "../../types/centros";

interface Props {
  onSuccess: () => void;
}

const CentroForm: React.FC<Props> = ({ onSuccess }) => {
  const [formData, setFormData] = useState<Centro>({
    id: 0,
    nombreCentro: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "id" ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.id === 0 || !formData.nombreCentro.trim()) {
      alert("Por favor, ingrese un ID válido y un nombre de centro.");
      return;
    }
    await centrosService.crear(formData);
    alert("Centro creado correctamente.");
    onSuccess();
    setFormData({ id: 0, nombreCentro: "" });
  };

  return (
    <form className="centro-form" onSubmit={handleSubmit}>
      <div>
        <label>ID Centro</label>
        <input
          type="text"
          name="id"
          value={formData.id === 0 ? "" : formData.id.toString()}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Nombre del Centro</label>
        <input
          type="text"
          name="nombreCentro"
          value={formData.nombreCentro}
          onChange={handleChange}
          required
        />
      </div>
      <button type="submit">Crear Centro</button>
    </form>
  );
};

export default CentroForm;
