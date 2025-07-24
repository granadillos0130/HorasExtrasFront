import { AxiosError } from "axios";
import React, { useState, useEffect } from "react";
import { trabajadoresService } from "../../api/trabajadoresService";
import { centrosService } from "../../api/centrosService";
import { registrosService } from "../../api/registrosService";
import CentroBuscador from "../shared/CentroBuscador";
import TrabajadorBuscador from "../shared/TrabajadorBuscador";
import type { Trabajador } from "../../types/trabajadores";
import type { Centro } from "../../types/centros";
import type { RegistroInputDto } from "../../types/registros";
import "../../styles/components/registros/RegistroForm.css";

interface Props {
  onSuccess: () => void;
  fechaInicial?: string;
}

const RegistrosForm: React.FC<Props> = ({ onSuccess, fechaInicial }) => {
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [centros, setCentros] = useState<Centro[]>([]);
  const [loading, setLoading] = useState(false);
  const [analistas, setAnalistas] = useState<{ id: number; nombreCompleto: string }[]>([]);


  const [formData, setFormData] = useState<RegistroInputDto>({
    Trabajador_ID: 0,
    Centro_ID: "",
    Nombr_Centro: "",
    Fecha: fechaInicial || new Date().toISOString().split("T")[0],
    Hora_Ingreso: "08:00",
    Hora_Salida: "17:00",
    Tiempo_Almuerzo: "01:00",
    desplazamientoIda: "",
    desplazamientoRegreso: "",
  });

  useEffect(() => {
    if (fechaInicial) {
      setFormData((prev) => ({
        ...prev,
        Fecha: fechaInicial,
      }));
    }
  }, [fechaInicial]);

  useEffect(() => {
    const cargarDatos = async () => {
  try {
    const [trabajadoresData, centrosData, analistasData] = await Promise.all([
      trabajadoresService.getAll(),
      centrosService.getAll(),
      trabajadoresService.getAnalistas(), // 🔥 aquí está el llamado
    ]);
    setTrabajadores(trabajadoresData);
    setCentros(centrosData);
    setAnalistas(analistasData); // ⚡
  } catch (error) {
    console.error("Error al cargar datos:", error);
  }
};


    cargarDatos();
  }, []);

  const convertirATimeSpan = (valor: string): string => {
    const parts = valor.trim().split(":");
    if (parts.length === 1 && /^\d+$/.test(parts[0])) {
      return `00:${parts[0].padStart(2, "0")}:00`;
    } else if (parts.length === 2) {
      return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}:00`;
    } else if (parts.length === 3) {
      return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}:${parts[2].padStart(2, "0")}`;
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.Trabajador_ID || !formData.Centro_ID || !formData.Nombr_Centro) {
      alert("Por favor complete todos los campos obligatorios");
      return;
    }

    setLoading(true);

    try {
      const normalizarHora = (hora: string) =>
        hora.length === 5 ? `${hora}:00` : hora;

      const payload: RegistroInputDto = {
        ...formData,
        Tiempo_Almuerzo: normalizarHora(formData.Tiempo_Almuerzo),
        desplazamientoIda: formData.desplazamientoIda?.trim()
          ? convertirATimeSpan(formData.desplazamientoIda)
          : undefined,
        desplazamientoRegreso: formData.desplazamientoRegreso?.trim()
          ? convertirATimeSpan(formData.desplazamientoRegreso)
          : undefined,
      };

      await registrosService.crear(payload);
      alert("Registro creado correctamente");
      onSuccess();
    } catch (error: unknown) {
      console.error("Error al crear registro:", error);
      if (error instanceof AxiosError && error.response?.data) {
        alert(
          "Error del servidor:\n" +
            JSON.stringify(error.response.data, null, 2)
        );
      } else {
        alert("Error al crear el registro");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof RegistroInputDto, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTrabajadorChange = (trabajadorId: number) => {
    setFormData((prev) => ({
      ...prev,
      Trabajador_ID: trabajadorId,
    }));
  };

  const handleCentroChange = (centroId: string) => {
    const centroSeleccionado = centros.find((c) => c.id === centroId);
    setFormData((prev) => ({
      ...prev,
      Centro_ID: centroId,
      Nombr_Centro: centroSeleccionado?.nombreCentro || "",
    }));
  };

  return (
    <div className="registros-form-container">
      <h3>Crear Nuevo Registro</h3>
      {fechaInicial && (
        <div
          style={{
            background: 'linear-gradient(135deg, #43e97b, #38f9d7)',
            color: 'white',
            padding: '10px 15px',
            borderRadius: '8px',
            marginBottom: '20px',
            textAlign: 'center',
            fontWeight: '600',
          }}
        >
          📅 Fecha preseleccionada:{" "}
          {new Date(fechaInicial).toLocaleDateString("es-ES", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      )}

      <form onSubmit={handleSubmit} className="registros-form">
        <div className="form-row">
          <div className="form-group">
            <TrabajadorBuscador
              trabajadores={trabajadores}
              value={formData.Trabajador_ID}
              onChange={handleTrabajadorChange}
              label="Trabajador *"
              required
            />
          </div>

          <div className="form-group">
            <label>Centro *</label>
            <CentroBuscador
              centros={centros}
              value={formData.Centro_ID}
              onChange={handleCentroChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Nombre del Centro *</label>
            <input
              type="text"
              value={formData.Nombr_Centro}
              onChange={(e) => handleInputChange("Nombr_Centro", e.target.value)}
              placeholder="Escriba el nombre del centro"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Fecha *</label>
            <input
              type="date"
              value={formData.Fecha}
              onChange={(e) => handleInputChange("Fecha", e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Hora Ingreso *</label>
            <input
              type="time"
              value={formData.Hora_Ingreso}
              onChange={(e) => handleInputChange("Hora_Ingreso", e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Hora Salida *</label>
            <input
              type="time"
              value={formData.Hora_Salida}
              onChange={(e) => handleInputChange("Hora_Salida", e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Tiempo Almuerzo *</label>
            <select
              value={formData.Tiempo_Almuerzo}
              onChange={(e) => handleInputChange("Tiempo_Almuerzo", e.target.value)}
              required
            >
              <option value="00:00:00">Sin almuerzo</option>
              <option value="00:30:00">30 minutos</option>
              <option value="01:00:00">1 hora</option>
              <option value="01:30:00">1 hora 30 minutos</option>
              <option value="02:00:00">2 horas</option>
            </select>
          </div>
        </div>
        <div className="form-row">
  <div className="form-group">
    <label>Analista encargado</label>
    <select
      value={formData.AnalistaId || ""}
      onChange={(e) => handleInputChange("AnalistaId", Number(e.target.value))}
    >
      <option value="">-- Selecciona un analista --</option>
      {analistas.map((a) => (
        <option key={a.id} value={a.id}>
          {a.nombreCompleto}
        </option>
      ))}
    </select>
  </div>
</div>


        {/* 🚗 Desplazamientos */}
        <div
          className="form-section-header"
          style={{
            marginTop: "25px",
            marginBottom: "15px",
            padding: "10px 0",
            borderTop: "2px solid #e1e8ed",
            color: "#666",
          }}
        >
          <h4 style={{ margin: 0, fontSize: "1.1rem" }}>
            🚗 Tiempos de Desplazamiento (Opcional)
          </h4>
          <p
            style={{ margin: "5px 0 0 0", fontSize: "0.9rem", color: "#888" }}
          >
            Si el trabajador tiene tiempo de desplazamiento, ingrésalo aquí
          </p>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Desplazamiento Ida</label>
            <input
              type="text"
              value={formData.desplazamientoIda || ""}
              onChange={(e) => handleInputChange("desplazamientoIda", e.target.value)}
              placeholder="Ej: 00:20, 1:15, 45"
            />
            <small style={{ color: "#666", fontSize: "0.8rem" }}>
              Tiempo de ida (formato HH:mm o solo minutos)
            </small>
          </div>

          <div className="form-group">
            <label>Desplazamiento Regreso</label>
            <input
              type="text"
              value={formData.desplazamientoRegreso || ""}
              onChange={(e) => handleInputChange("desplazamientoRegreso", e.target.value)}
              placeholder="Ej: 00:30, 1:00, 20"
            />
            <small style={{ color: "#666", fontSize: "0.8rem" }}>
              Tiempo de regreso (formato HH:mm o solo minutos)
            </small>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-submit">
          {loading ? "Guardando..." : "Crear Registro"}
        </button>
      </form>
    </div>
  );
};

export default RegistrosForm;
