import React from 'react';
import { getStepLabel } from '../../../utils/trabajadores/trabajadorFormUtils';

interface ProgressIndicatorProps {
  currentStep: number;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ currentStep }) => {
  return (
    <div className="progress-indicator">
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${(currentStep / 8) * 100}%` }}
        ></div>
      </div>
      <div className="progress-steps">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(step => (
          <div 
            key={step}
            className={`progress-step ${currentStep >= step ? 'active' : ''}`}
          >
            <div className="step-number">{step}</div>
            <div className="step-label">{getStepLabel(step)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};