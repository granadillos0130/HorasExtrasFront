import React, { useState, useEffect } from 'react';
import { cursosService } from '../../api/cursoService';
import type { Curso } from '../../types/curso';

interface CursosFormProps {
  curso?: Curso | null;
  onSuccess: () => void;
  onCancel: () => void;
}

interface FormData {
  nombre: string;
  descripcion: string;
}

interface FormErrors {
  nombre?: string;
  descripcion?: string;
  general?: string;
}

export const CursosForm: React.FC<CursosFormProps> = ({ curso, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    descripcion: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const isEditing = !!curso;

  useEffect(() => {
    if (curso) {
      setFormData({
        nombre: curso.nombre,
        descripcion: curso.descripcion || ''
      });
    }
  }, [curso]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre del curso es obligatorio';
    } else if (formData.nombre.trim().length < 3) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
    } else if (formData.nombre.trim().length > 100) {
      newErrors.nombre = 'El nombre no puede exceder 100 caracteres';
    }

    if (formData.descripcion && formData.descripcion.length > 500) {
      newErrors.descripcion = 'La descripción no puede exceder 500 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const cursoData = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim() || undefined
      };

      if (isEditing && curso) {
        await cursosService.actualizar(curso.id, cursoData);
      } else {
        await cursosService.crear(cursoData);
      }

      onSuccess();
    } catch (error: any) {
      console.error('Error al guardar curso:', error);
      
      let errorMessage = 'Ocurrió un error inesperado';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  // ESTILOS INTEGRADOS
  const styles = {
    overlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      padding: '1rem'
    },
    container: {
      background: 'white',
      borderRadius: '0.5rem',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      maxWidth: '28rem',
      width: '100%',
      maxHeight: '90vh',
      overflowY: 'auto' as const,
      animation: 'slideIn 0.3s ease-out'
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1.5rem',
      borderBottom: '1px solid #e5e7eb'
    },
    headerContent: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem'
    },
    iconContainer: {
      padding: '0.5rem',
      backgroundColor: '#dbeafe',
      borderRadius: '0.5rem',
      fontSize: '1.25rem'
    },
    titleContainer: {
      display: 'flex',
      flexDirection: 'column' as const
    },
    title: {
      fontSize: '1.125rem',
      fontWeight: '600',
      color: '#111827',
      margin: '0 0 0.25rem 0'
    },
    subtitle: {
      fontSize: '0.875rem',
      color: '#6b7280',
      margin: '0'
    },
    closeBtn: {
      padding: '0.5rem',
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      borderRadius: '0.5rem',
      transition: 'background-color 0.2s ease',
      fontSize: '1.25rem'
    },
    content: {
      padding: '1.5rem'
    },
    fields: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '1.5rem'
    },
    errorAlert: {
      backgroundColor: '#fef2f2',
      border: '1px solid #fecaca',
      borderRadius: '0.5rem',
      padding: '1rem',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.75rem'
    },
    errorIcon: {
      color: '#ef4444',
      marginTop: '0.125rem',
      flexShrink: 0,
      fontSize: '1.25rem'
    },
    errorContent: {
      display: 'flex',
      flexDirection: 'column' as const
    },
    errorTitle: {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#991b1b',
      margin: '0 0 0.25rem 0'
    },
    errorText: {
      fontSize: '0.875rem',
      color: '#dc2626',
      margin: '0',
      lineHeight: 1.4
    },
    field: {
      display: 'flex',
      flexDirection: 'column' as const
    },
    label: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '0.5rem'
    },
    input: {
      width: '100%',
      padding: '0.5rem 0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.375rem',
      fontSize: '0.875rem',
      transition: 'all 0.2s ease',
      boxSizing: 'border-box' as const
    },
    inputError: {
      width: '100%',
      padding: '0.5rem 0.75rem',
      border: '1px solid #fca5a5',
      borderRadius: '0.375rem',
      fontSize: '0.875rem',
      transition: 'all 0.2s ease',
      backgroundColor: '#fef2f2',
      boxSizing: 'border-box' as const
    },
    textarea: {
      width: '100%',
      padding: '0.5rem 0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.375rem',
      fontSize: '0.875rem',
      resize: 'none' as const,
      fontFamily: 'inherit',
      transition: 'all 0.2s ease',
      boxSizing: 'border-box' as const
    },
    textareaError: {
      width: '100%',
      padding: '0.5rem 0.75rem',
      border: '1px solid #fca5a5',
      borderRadius: '0.375rem',
      fontSize: '0.875rem',
      resize: 'none' as const,
      fontFamily: 'inherit',
      transition: 'all 0.2s ease',
      backgroundColor: '#fef2f2',
      boxSizing: 'border-box' as const
    },
    fieldError: {
      marginTop: '0.25rem',
      fontSize: '0.875rem',
      color: '#dc2626',
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem'
    },
    charCounter: {
      marginTop: '0.25rem',
      fontSize: '0.75rem',
      color: '#6b7280',
      textAlign: 'right' as const
    },
    charCounterWarning: {
      marginTop: '0.25rem',
      fontSize: '0.75rem',
      color: '#f59e0b',
      textAlign: 'right' as const
    },
    charCounterDanger: {
      marginTop: '0.25rem',
      fontSize: '0.75rem',
      color: '#dc2626',
      textAlign: 'right' as const
    },
    previewContainer: {
      backgroundColor: '#f9fafb',
      borderRadius: '0.5rem',
      padding: '1rem',
      border: '1px solid #e5e7eb'
    },
    previewHeader: {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '0.5rem'
    },
    previewCard: {
      background: 'white',
      borderRadius: '0.375rem',
      border: '1px solid #d1d5db',
      padding: '0.75rem'
    },
    previewTitle: {
      fontWeight: '500',
      color: '#111827',
      margin: '0 0 0.25rem 0',
      fontSize: '0.875rem'
    },
    previewDescription: {
      fontSize: '0.875rem',
      color: '#6b7280',
      margin: '0',
      lineHeight: 1.4
    },
    actions: {
      display: 'flex',
      gap: '0.75rem',
      justifyContent: 'flex-end',
      paddingTop: '1rem',
      borderTop: '1px solid #e5e7eb'
    },
    cancelBtn: {
      padding: '0.5rem 1rem',
      color: '#6b7280',
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      fontWeight: '500',
      borderRadius: '0.375rem',
      transition: 'all 0.2s ease'
    },
    submitBtn: {
      padding: '0.5rem 1.5rem',
      borderRadius: '0.375rem',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontWeight: '600',
      transition: 'all 0.2s ease'
    },
    submitBtnActive: {
      backgroundColor: '#2563eb',
      color: 'white'
    },
    submitBtnDisabled: {
      backgroundColor: '#d1d5db',
      color: '#9ca3af',
      cursor: 'not-allowed'
    },
    submitBtnLoading: {
      backgroundColor: '#6b7280',
      color: 'white',
      cursor: 'wait'
    },
    spinner: {
      border: '2px solid transparent',
      borderTop: '2px solid currentColor',
      borderRadius: '50%',
      width: '1rem',
      height: '1rem',
      animation: 'spin 1s linear infinite'
    },
    footer: {
      padding: '0.75rem 1.5rem 1rem',
      borderTop: '1px solid #f3f4f6',
      fontSize: '0.75rem',
      color: '#6b7280'
    },
    keyboardShortcut: {
      padding: '0.125rem 0.25rem',
      backgroundColor: '#f3f4f6',
      borderRadius: '0.25rem',
      fontFamily: 'monospace',
      fontSize: '0.75rem',
      border: '1px solid #d1d5db'
    }
  };

  const nombreLength = formData.nombre.length;
  const descripcionLength = formData.descripcion.length;

  return (
    <div style={styles.overlay} onKeyDown={handleKeyDown}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <div style={styles.iconContainer}>
              <span>📚</span>
            </div>
            <div style={styles.titleContainer}>
              <h2 style={styles.title}>
                {isEditing ? 'Editar Curso' : 'Crear Nuevo Curso'}
              </h2>
              <p style={styles.subtitle}>
                {isEditing ? 'Modifica los datos del curso' : 'Completa la información del nuevo curso'}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            style={styles.closeBtn}
            disabled={loading}
            onMouseOver={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <span>❌</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.content}>
          <div style={styles.fields}>
            {/* Error general */}
            {errors.general && (
              <div style={styles.errorAlert}>
                <div style={styles.errorIcon}>⚠️</div>
                <div style={styles.errorContent}>
                  <h4 style={styles.errorTitle}>Error al guardar</h4>
                  <p style={styles.errorText}>{errors.general}</p>
                </div>
              </div>
            )}

            {/* Nombre del curso */}
            <div style={styles.field}>
              <label htmlFor="nombre" style={styles.label}>
                Nombre del Curso *
              </label>
              <input
                id="nombre"
                type="text"
                value={formData.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                style={errors.nombre ? styles.inputError : styles.input}
                placeholder="Ej: Curso de Seguridad Industrial"
                maxLength={100}
                disabled={loading}
                autoFocus
                onFocus={(e) => {
                  if (!errors.nombre) {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    e.target.style.transform = 'translateY(-1px)';
                  }
                }}
                onBlur={(e) => {
                  if (!errors.nombre) {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                    e.target.style.transform = 'translateY(0)';
                  }
                }}
              />
              {errors.nombre && (
                <div style={styles.fieldError}>
                  <span>⚠️</span>
                  {errors.nombre}
                </div>
              )}
              <div style={
                nombreLength > 95 ? styles.charCounterDanger :
                nombreLength > 80 ? styles.charCounterWarning :
                styles.charCounter
              }>
                {nombreLength}/100 caracteres
              </div>
            </div>

            {/* Descripción */}
            <div style={styles.field}>
              <label htmlFor="descripcion" style={styles.label}>
                Descripción (Opcional)
              </label>
              <textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => handleInputChange('descripcion', e.target.value)}
                rows={4}
                style={errors.descripcion ? styles.textareaError : styles.textarea}
                placeholder="Describe brevemente el contenido y objetivos del curso..."
                maxLength={500}
                disabled={loading}
                onFocus={(e) => {
                  if (!errors.descripcion) {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    e.target.style.transform = 'translateY(-1px)';
                  }
                }}
                onBlur={(e) => {
                  if (!errors.descripcion) {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                    e.target.style.transform = 'translateY(0)';
                  }
                }}
              />
              {errors.descripcion && (
                <div style={styles.fieldError}>
                  <span>⚠️</span>
                  {errors.descripcion}
                </div>
              )}
              <div style={
                descripcionLength > 475 ? styles.charCounterDanger :
                descripcionLength > 400 ? styles.charCounterWarning :
                styles.charCounter
              }>
                {descripcionLength}/500 caracteres
              </div>
            </div>

            {/* Preview */}
            {formData.nombre && (
              <div style={styles.previewContainer}>
                <div style={styles.previewHeader}>Vista previa:</div>
                <div style={styles.previewCard}>
                  <h5 style={styles.previewTitle}>{formData.nombre}</h5>
                  {formData.descripcion && (
                    <p style={styles.previewDescription}>{formData.descripcion}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div style={styles.actions}>
            <button
              type="button"
              onClick={onCancel}
              style={styles.cancelBtn}
              disabled={loading}
              onMouseOver={(e) => {
                if (!loading) {
                  e.currentTarget.style.color = '#374151';
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = '#6b7280';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !formData.nombre.trim()}
              style={{
                ...styles.submitBtn,
                ...(loading ? styles.submitBtnLoading :
                   !formData.nombre.trim() ? styles.submitBtnDisabled :
                   styles.submitBtnActive)
              }}
              onMouseOver={(e) => {
                if (!loading && formData.nombre.trim()) {
                  e.currentTarget.style.backgroundColor = '#1d4ed8';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(37, 99, 235, 0.3)';
                }
              }}
              onMouseOut={(e) => {
                if (!loading && formData.nombre.trim()) {
                  e.currentTarget.style.backgroundColor = '#2563eb';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              {loading ? (
                <>
                  <div style={styles.spinner}></div>
                  {isEditing ? 'Actualizando...' : 'Creando...'}
                </>
              ) : (
                <>
                  <span>💾</span>
                  {isEditing ? 'Actualizar' : 'Crear Curso'}
                </>
              )}
            </button>
          </div>
        </form>

        {/* Shortcuts info */}
        <div style={styles.footer}>
          <p style={{ margin: 0 }}>
            Tip: Presiona <span style={styles.keyboardShortcut}>Esc</span> para cancelar
          </p>
        </div>
      </div>

      {/* CSS Animations */}
      <style>
        {`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(-20px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};