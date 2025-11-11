/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../api/authService";
import "../styles/pages/LoginPage.css";

export default function LoginPage() {
  const [cedulaOrEmail, setCedulaOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authService.login({ cedulaOrEmail, password });

      if (response.success) {
        // Redirigir al dashboard
        navigate("/");
      } else {
        setError(response.message || "Error al iniciar sesión");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>Iniciar Sesión</h1>
          <p>Sistema de Control de Horas</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="cedulaOrEmail">Cédula o Correo Electrónico</label>
            <input
              id="cedulaOrEmail"
              type="text"
              value={cedulaOrEmail}
              onChange={(e) => setCedulaOrEmail(e.target.value)}
              placeholder="Ingresa tu cédula o correo"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
              required
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="btn-login"
            disabled={loading}
          >
            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>
        </form>

        <div className="login-footer">
          <p>¿Olvidaste tu contraseña? Contacta al administrador</p>
        </div>
      </div>
    </div>
  );
}