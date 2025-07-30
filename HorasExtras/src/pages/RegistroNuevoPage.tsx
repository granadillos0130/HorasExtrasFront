import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import RegistrosForm from "../components/registros/RegistrosForm";

const RegistroNuevoPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fechaInicial = searchParams.get('fecha');
  const returnUrl = searchParams.get('return') || '/registros';

  const handleSuccess = () => {
    // Volver a la página anterior con un mensaje de éxito
    navigate(returnUrl + '?success=registro-creado');
  };

  const handleCancel = () => {
    navigate(returnUrl);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header con navegación */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '20px 30px',
          marginBottom: '30px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '15px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button
              onClick={handleCancel}
              style={{
                background: 'linear-gradient(135deg, #6b7280, #4b5563)',
                color: 'white',
                border: 'none',
                padding: '12px 18px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '0.95rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(107, 114, 128, 0.3)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              ← Volver
            </button>
            <div>
              <h1 style={{ 
                margin: 0, 
                fontSize: '1.8rem', 
                color: '#333',
                fontWeight: '700'
              }}>
                ➕ Crear Nuevo Registro
              </h1>
              {fechaInicial && (
                <div style={{
                  background: 'linear-gradient(135deg, #43e97b, #38f9d7)',
                  color: 'white',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  marginTop: '8px',
                  display: 'inline-block'
                }}>
                  📅 Fecha: {new Date(fechaInicial).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Información adicional */}
          <div style={{
            background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
            padding: '10px 15px',
            borderRadius: '10px',
            fontSize: '0.8rem',
            color: '#4b5563',
            fontWeight: '600'
          }}>
            💡 Formulario Individual
          </div>
        </div>

        {/* Contenedor del formulario */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '30px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          border: '1px solid #e1e8ed'
        }}>
          <RegistrosForm 
            onSuccess={handleSuccess} 
            fechaInicial={fechaInicial || undefined}
          />
        </div>

        {/* Footer informativo */}
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          color: 'white',
          padding: '15px 20px',
          borderRadius: '15px',
          marginTop: '20px',
          textAlign: 'center',
          fontSize: '0.9rem',
          fontWeight: '500'
        }}>
          💡 Consejo: Verifica todos los datos antes de guardar. Los registros se crean inmediatamente.
        </div>
      </div>
    </div>
  );
};

export default RegistroNuevoPage;