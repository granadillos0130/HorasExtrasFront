import React from 'react';

interface FormNavigationProps {
  currentStep: number;
  loading: boolean;
  onPrev: () => void;
  onNext: () => void;
}

export const FormNavigation: React.FC<FormNavigationProps> = ({
  currentStep,
  loading,
  onPrev,
  onNext
}) => {
  return (
    <div className="form-actions">
      {currentStep > 1 && (
        <button
          type="button"
          className="btn-secondary"
          onClick={onPrev}
          disabled={loading}
        >
          ← Anterior
        </button>
      )}
      
      <div className="spacer"></div>
      
      {currentStep < 8 ? (
        <button
          type="button"
          className="btn-primary"
          onClick={onNext}
          disabled={loading}
        >
          Siguiente →
        </button>
      ) : (
        <button
          type="submit"
          className="btn-submit"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="loading-spinner"></span>
              Creando trabajador completo...
            </>
          ) : (
            <>
              ✅ Crear Trabajador Completo
            </>
          )}
        </button>
      )}
    </div>
  );
};