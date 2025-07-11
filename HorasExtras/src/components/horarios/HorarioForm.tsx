import React, { useState, useEffect } from "react";
import { trabajadoresService } from "../../api/trabajadoresService";
import { horariosService } from "../../api/horariosService";
import type { Trabajador } from "../../types/trabajadores";
import type { HorarioDto } from "../../types/horarios";

interface Props {
  onSuccess?: () => void;
}

const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

const HorariosForm: React.FC<Props> = ({ onSuccess }) => {
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [formData, setFormData] = useState<HorarioDto>({
    trabajadorId: 0,
    dia: "Lunes",
    horaInicio: "08:00",
    horaFin: "17:00",
    intensidadHoraria: 8
  });

  useEffect(() => {
    const cargar = async () => {
      const res = await trabajadoresService.getAll();
      setTrabajadores(res);
    };
    cargar();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.trabajadorId === 0) {
      alert("Seleccione un trabajador");
      return;
    }
    await horariosService.crear(formData);
    alert("Horario creado correctamente");
    if (onSuccess) {
      onSuccess();
    }
    setFormData({
      trabajadorId: 0,
      dia: "Lunes",
      horaInicio: "08:00",
      horaFin: "17:00",
      intensidadHoraria: 8
    });
  };

  const handleChange = (field: keyof HorarioDto, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="horarios-form">
      <select
        value={formData.trabajadorId}
        onChange={(e) => handleChange("trabajadorId", Number(e.target.value))}
      >
        <option value={0}>Seleccione trabajador</option>
        {trabajadores.map(t => (
          <option key={t.id} value={t.id}>{t.nombre}</option>
        ))}
      </select>

      <select
        value={formData.dia}
        onChange={(e) => handleChange("dia", e.target.value)}
      >
        {diasSemana.map(d => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>

      <input
        type="time"
        value={formData.horaInicio}
        onChange={(e) => handleChange("horaInicio", e.target.value)}
      />

      <input
        type="time"
        value={formData.horaFin}
        onChange={(e) => handleChange("horaFin", e.target.value)}
      />

      <input
        type="number"
        value={formData.intensidadHoraria}
        onChange={(e) => handleChange("intensidadHoraria", Number(e.target.value))}
        min={1}
        step={0.5}
        placeholder="Horas"
      />

      <button type="submit">Crear Horario</button>
    </form>
  );
};

export default HorariosForm;
