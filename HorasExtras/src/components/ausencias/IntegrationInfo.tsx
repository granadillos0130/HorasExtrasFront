import React, { useState } from 'react';

export const IntegrationInfo: React.FC = () => {
  const [mostrarInfo, setMostrarInfo] = useState(false);

  return (
    <div className="integration-info">
      <h4>
        Integración Automática con Sistema de Registros
        <button
          type="button"
          onClick={() => setMostrarInfo(!mostrarInfo)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            marginLeft: 'auto',
            fontSize: '1rem',
            color: '#1d4ed8'
          }}
        >
          {mostrarInfo ? '▲' : '▼'}
        </button>
      </h4>

      {mostrarInfo && (
        <div>
          <p>
            <strong>Qué sucede cuando registras una ausencia:</strong>
          </p>
          <ul>
            <li>Se crean automáticamente registros en el sistema de horas para cada día de la ausencia</li>
            <li>Se descuenta automáticamente el tiempo de almuerzo (12:30 PM - 2:00 PM) cuando la ausencia incluye este período</li>
            <li>Las ausencias aparecen junto con los registros normales de trabajo</li>
            <li>Si es <strong>remunerada</strong>: cuenta como horas normales trabajadas</li>
            <li>Si <strong>no es remunerada</strong>: se marca como horas ausentes</li>
            <li><strong>Para vacaciones</strong>: solo ingresas cuántos días y el sistema calcula automáticamente las fechas</li>
            <li><strong>Para citas médicas y enfermedades</strong>: puedes agregar el diagnóstico CIE-10 correspondiente</li>
          </ul>
        </div>
      )}
    </div>
  );
};