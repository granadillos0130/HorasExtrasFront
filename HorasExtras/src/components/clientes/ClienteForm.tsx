// src/components/clientes/ClienteForm.tsx
import React, { useState, useEffect } from "react";
import type { Cliente } from "../../types/cliente";
import "../../styles/components/clientes/ClientesForm.css";

interface Props {
  initialData?: Cliente;
  onSubmit: (cliente: Cliente) => void;
  onCancel: () => void;
  loading?: boolean;
  isModal?: boolean;
}

const ClienteForm: React.FC<Props> = ({ 
  initialData, 
  onSubmit, 
  onCancel, 
  loading = false,
  isModal = false 
}) => {
  const [id, setId] = useState(initialData?.id || "");
  const [nombreCliente, setNombreCliente] = useState(initialData?.nombreCliente || "");
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [touched, setTouched] = useState<{[key: string]: boolean}>({});

  const isEditing = !!initialData;

  useEffect(() => {
    if (initialData) {
      setId(initialData.id);
      setNombreCliente(initialData.nombreCliente);
    }
  }, [initialData]);

  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };
    
    switch (field) {
      case 'id':
        if (!value.trim()) {
          newErrors.id = 'El ID es obligatorio';
        } else if (value.length < 2) {
          newErrors.id = 'El ID debe tener al menos 2 caracteres';
        } else {
          delete newErrors.id;
        }
        break;
      case 'nombreCliente':
        if (!value.trim()) {
          newErrors.nombreCliente = 'El nombre del cliente es obligatorio';
        } else if (value.length < 2) {
          newErrors.nombreCliente = 'El nombre debe tener al menos 2 caracteres';
        } else {
          delete newErrors.nombreCliente;
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (field: string, value: string) => {
    switch (field) {
      case 'id':
        setId(value);
        break;
      case 'nombreCliente':
        setNombreCliente(value);
        break;
    }
    
    if (touched[field]) {
      validateField(field, value);
    }
  };

  const handleFieldBlur = (field: string, value: string) => {
    setTouched({ ...touched, [field]: true });
    validateField(field, value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Marcar todos los campos como tocados
    const allTouched = { id: true, nombreCliente: true };
    setTouched(allTouched);
    
    // Validar todos los campos
    const idValid = validateField('id', id);
    const nombreValid = validateField('nombreCliente', nombreCliente);
    
    if (idValid && nombreValid) {
      onSubmit({ id: id.trim(), nombreCliente: nombreCliente.trim() });
    }
  };

  const getFieldClass = (field: string) => {
    const baseClass = 'cliente-form-group';
    if (field === 'id' && isEditing) return `${baseClass} disabled`;
    if (!touched[field]) return baseClass;
    if (errors[field]) return `${baseClass} error`;
    return `${baseClass} valid`;
  };

  return (
    <div className={`cliente-form-container ${isModal ? 'modal' : ''} ${loading ? 'loading' : ''}`}>
      <form onSubmit={handleSubmit} className="cliente-form">
        {isModal && (
          <h2 className="cliente-form-title">
            {isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}
          </h2>
        )}

        {loading && <div className="cliente-form-loading-spinner"></div>}

        <div className={getFieldClass('id')}>
          <label htmlFor="cliente-id" className="cliente-form-label">
            ID del Cliente
            <span className="required-asterisk">*</span>
          </label>
          <input
            id="cliente-id"
            type="text"
            className="cliente-form-input"
            value={id}
            onChange={(e) => handleFieldChange('id', e.target.value)}
            onBlur={(e) => handleFieldBlur('id', e.target.value)}
            disabled={isEditing || loading}
            required
            placeholder={isEditing ? "ID asignado automáticamente" : "Ej: CLI001, EMPRESA01..."}
            autoComplete="off"
          />
          {errors.id && (
            <div className="cliente-form-error-message">{errors.id}</div>
          )}
          {!isEditing && (
            <div className="cliente-form-help">
              El ID debe ser único y no se puede modificar después de crear el cliente
            </div>
          )}
        </div>

        <div className={getFieldClass('nombreCliente')}>
          <label htmlFor="cliente-nombre" className="cliente-form-label">
            Nombre del Cliente
            <span className="required-asterisk">*</span>
          </label>
          <input
            id="cliente-nombre"
            type="text"
            className="cliente-form-input"
            value={nombreCliente}
            onChange={(e) => handleFieldChange('nombreCliente', e.target.value)}
            onBlur={(e) => handleFieldBlur('nombreCliente', e.target.value)}
            disabled={loading}
            required
            placeholder="Ej: Empresa ABC, Juan Pérez..."
            autoComplete="organization"
          />
          {errors.nombreCliente && (
            <div className="cliente-form-error-message">{errors.nombreCliente}</div>
          )}
          <div className="cliente-form-help">
            Nombre completo o razón social del cliente
          </div>
        </div>

        <div className="cliente-form-buttons">
          <button 
            type="submit" 
            className="cliente-form-button submit-button"
            disabled={loading || Object.keys(errors).length > 0}
          >
            {loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear Cliente')}
          </button>
          <button 
            type="button" 
            className="cliente-form-button cancel-button"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClienteForm;