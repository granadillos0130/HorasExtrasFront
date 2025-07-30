import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import RegistrosLoteForm from "../components/registros/RegistrosLoteForm";

const RegistroLotePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fechaInicial = searchParams.get('fecha');
  const returnUrl = searchParams.get('return') || '/registros';

  const handleSuccess = () => {
    // Volver a la página anterior con un mensaje de éxito
    navigate(returnUrl + '?success=lote-creado');
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
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
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
                📊 Crear Registros en Lote
              </h1>
              <p style={{ 
                margin: '5px 0 0 0', 
                color: '#666', 
                fontSize: '1rem',
                fontWeight: '500'
              }}>
                Crea múltiples registros de trabajo de una vez
              </p>
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
                  📅 Fecha base: {new Date(fechaInicial).toLocaleDateString('es-ES', {
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
            background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
            color: '#92400e',
            padding: '12px 18px',
            borderRadius: '12px',
            fontSize: '0.9rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            ⚡ Modo Lote Activado
          </div>
        </div>

        {/* Información importante sobre el modo lote */}
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '15px',
          padding: '20px 25px',
          marginBottom: '25px',
          boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
          border: '2px solid #3b82f6'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              color: 'white',
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem'
            }}>
              💡
            </div>
            <div>
              <h3 style={{ margin: '0 0 8px 0', color: '#1d4ed8', fontSize: '1.2rem' }}>
                Funcionalidades del Modo Lote
              </h3>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                gap: '10px',
                fontSize: '0.9rem',
                color: '#4b5563'
              }}>
                <div>✅ Crear múltiples registros simultáneamente</div>
                <div>📅 Generación automática por rango de fechas</div>
                <div>🚫 Exclusión de días específicos (sábados, domingos)</div>
                <div>🔄 Aplicar configuración a todos los registros</div>
                <div>📋 Duplicar y personalizar registros individuales</div>
                <div>⚡ Validación automática antes de guardar</div>
              </div>
            </div>
          </div>
        </div>

        {/* Contenedor del formulario de lote */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '30px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          border: '1px solid #e1e8ed'
        }}>
          <RegistrosLoteForm 
            onSuccess={handleSuccess}
            onCancel={handleCancel}
            fechaInicial={fechaInicial || undefined}
          />
        </div>

        {/* Footer con consejos */}
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          color: 'white',
          padding: '20px 25px',
          borderRadius: '15px',
          marginTop: '25px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          fontSize: '0.9rem'
        }}>
          <div>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '1rem' }}>
              🎯 Consejos para usar el Modo Lote:
            </h4>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li>Configura el primer registro como plantilla</li>
              <li>Usa "Aplicar Config. a Todos" para sincronizar</li>
              <li>Revisa cada registro antes de guardar</li>
            </ul>
          </div>
          <div>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '1rem' }}>
              ⚡ Funciones Avanzadas:
            </h4>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li>Rango de fechas con exclusiones automáticas</li>
              <li>Duplicación rápida de registros</li>
              <li>Validación inteligente de datos</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistroLotePage;