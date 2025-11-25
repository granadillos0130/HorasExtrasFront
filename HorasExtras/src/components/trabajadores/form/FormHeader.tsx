import React from 'react';
import { getStepIcon, getStepTitle } from '../../../utils/trabajadores/trabajadorFormUtils';

interface FormHeaderProps {
  currentStep: number;
  onCancel: () => void;
}

export const FormHeader: React.FC<FormHeaderProps> = ({ currentStep, onCancel }) => {
  return (
    <div className="form-header">
      <div className="form-icon">
        {getStepIcon(currentStep)}
      </div>
      <div className="form-title-section">
        <h3>Nuevo Trabajador</h3>
        <p>Paso {currentStep} de 8: {getStepTitle(currentStep)}</p>
      </div>
      <button 
        type="button" 
        className="btn-close"
        onClick={onCancel}
      >
        ❌ Cancelar
      </button>
    </div>
  );
};