import React from 'react';
import type { Trabajador } from '../../types/trabajadores';

interface EmptyStateNoSeleccionProps {
  type: 'no-seleccion';
}

interface EmptyStateNoRegistrosProps {
  type: 'no-registros';
  trabajador: Trabajador;
}

type EmptyStatesProps = EmptyStateNoSeleccionProps | EmptyStateNoRegistrosProps;

export const EmptyStates: React.FC<EmptyStatesProps> = (props) => {
  if (props.type === 'no-seleccion') {
    return (
      <div style={containerStyle}>
        <div style={iconContainerStyle}>
          <span style={iconStyle}>👤</span>
        </div>
        <h3 style={titleStyle}>SELECCIONE UN TRABAJADOR</h3>
        <p style={descriptionStyle}>
          Utilice el buscador superior para seleccionar un trabajador y visualizar
          su intensidad horaria en el período deseado.
        </p>
        <div style={stepsContainerStyle}>
          <div style={stepItemStyle}>
            <div style={stepNumberStyle}>1</div>
            <span style={stepTextStyle}>Seleccione un trabajador</span>
          </div>
          <div style={stepItemStyle}>
            <div style={stepNumberStyle}>2</div>
            <span style={stepTextStyle}>Configure el período de análisis</span>
          </div>
          <div style={stepItemStyle}>
            <div style={stepNumberStyle}>3</div>
            <span style={stepTextStyle}>Revise el reporte generado</span>
          </div>
        </div>
        <div style={featuresContainerStyle}>
          <div style={featureItemStyle}>
            <span style={featureIconStyle}>🔍</span>
            <span style={featureTextStyle}>Búsqueda por nombre o cédula</span>
          </div>
          <div style={featureItemStyle}>
            <span style={featureIconStyle}>📅</span>
            <span style={featureTextStyle}>Períodos personalizados</span>
          </div>
          <div style={featureItemStyle}>
            <span style={featureIconStyle}>📊</span>
            <span style={featureTextStyle}>Análisis detallado de horas</span>
          </div>
          <div style={featureItemStyle}>
            <span style={featureIconStyle}>⚡</span>
            <span style={featureTextStyle}>Rangos rápidos disponibles</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={iconContainerStyle}>
        <span style={iconStyle}>📊</span>
      </div>
      <h3 style={titleStyle}>SIN REGISTROS DISPONIBLES</h3>
      <p style={descriptionStyle}>
        No se encontraron registros para <strong>{props.trabajador?.nombre || 'este trabajador'}</strong> en el período seleccionado.
      </p>
      <div style={suggestionsContainerStyle}>
        <p style={suggestionsHeaderStyle}>Sugerencias:</p>
        <ul style={suggestionListStyle}>
          <li style={suggestionItemStyle}>Seleccione un rango de fechas diferente</li>
          <li style={suggestionItemStyle}>Verifique períodos anteriores o posteriores</li>
          <li style={suggestionItemStyle}>Asegúrese de que existan registros para este trabajador</li>
        </ul>
      </div>
    </div>
  );
};

// Estilos
const containerStyle: React.CSSProperties = {
  background: 'white',
  borderRadius: '12px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  padding: '60px 40px',
  textAlign: 'center',
  marginBottom: '20px',
};

const iconContainerStyle: React.CSSProperties = {
  marginBottom: '24px',
};

const iconStyle: React.CSSProperties = {
  fontSize: '4rem',
  display: 'inline-block',
};

const titleStyle: React.CSSProperties = {
  margin: '0 0 12px 0',
  fontSize: '1.3rem',
  fontWeight: '700',
  color: '#1e293b',
  letterSpacing: '0.02em',
};

const descriptionStyle: React.CSSProperties = {
  margin: '0 0 32px 0',
  fontSize: '1rem',
  color: '#64748b',
  maxWidth: '600px',
  marginLeft: 'auto',
  marginRight: 'auto',
  lineHeight: '1.6',
};

const stepsContainerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  gap: '24px',
  marginBottom: '40px',
  flexWrap: 'wrap',
};

const stepItemStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '12px',
  maxWidth: '150px',
};

const stepNumberStyle: React.CSSProperties = {
  width: '48px',
  height: '48px',
  background: '#eff6ff',
  border: '2px solid #3b82f6',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1.2rem',
  fontWeight: '700',
  color: '#1e40af',
};

const stepTextStyle: React.CSSProperties = {
  fontSize: '0.85rem',
  color: '#475569',
  fontWeight: '500',
};

const featuresContainerStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '16px',
  maxWidth: '800px',
  margin: '0 auto',
};

const featureItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '12px 16px',
  background: '#f8fafc',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
};

const featureIconStyle: React.CSSProperties = {
  fontSize: '1.2rem',
};

const featureTextStyle: React.CSSProperties = {
  fontSize: '0.85rem',
  color: '#475569',
  fontWeight: '500',
  textAlign: 'left',
};

const suggestionsContainerStyle: React.CSSProperties = {
  marginTop: '32px',
  padding: '24px',
  background: '#f8fafc',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
  maxWidth: '600px',
  marginLeft: 'auto',
  marginRight: 'auto',
};

const suggestionsHeaderStyle: React.CSSProperties = {
  margin: '0 0 16px 0',
  fontSize: '0.9rem',
  fontWeight: '600',
  color: '#475569',
  textAlign: 'left',
};

const suggestionListStyle: React.CSSProperties = {
  margin: 0,
  padding: '0 0 0 20px',
  textAlign: 'left',
};

const suggestionItemStyle: React.CSSProperties = {
  marginBottom: '8px',
  fontSize: '0.85rem',
  color: '#64748b',
  lineHeight: '1.6',
};