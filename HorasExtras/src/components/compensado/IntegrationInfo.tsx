import React from "react";

interface Props {
  mostrarInfo: boolean;
  onToggle: () => void;
}

export const IntegrationInfo: React.FC<Props> = ({ mostrarInfo, onToggle }) => (
  <div className="integration-info">
    <h4>
      🔗 Sistema de Compensados
      <button
        type="button"
        onClick={onToggle}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          marginLeft: 'auto',
          fontSize: '1rem',
          color: '#1d4ed8'
        }}
      >
        {mostrarInfo ? '🔼' : '🔽'}
      </button>
    </h4>

    {mostrarInfo && (
      <div>
        <p><strong>¿Qué son los compensados?</strong></p>
        <ul>
          <li>Permite usar horas excedentes acumuladas en períodos anteriores</li>
          <li>Solo disponible para trabajadores con sistema de banco de horas</li>
          <li>Las horas se registran en un centro de trabajo específico</li>
          <li>Se integran automáticamente al sistema de registros diarios</li>
          <li>Las horas aparecen como "normales" (no generan extras adicionales)</li>
        </ul>
        <p><strong>¿Cómo funciona?</strong></p>
        <ul>
          <li>Consulta las horas disponibles de un período específico</li>
          <li>Crea el compensado especificando centro, fecha y horario</li>
          <li>El sistema descuenta automáticamente las horas del banco</li>
          <li>Se crea un registro de trabajo en la fecha especificada</li>
        </ul>
      </div>
    )}
  </div>
);
