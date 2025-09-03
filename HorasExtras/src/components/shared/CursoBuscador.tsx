// src/components/shared/CursoBuscador.tsx
import React, { useState, useEffect, useRef } from "react";
import type { Curso } from "../../types/curso"; // CORREGIDO: import desde cursos.ts, no curso.ts

interface Props {
  cursos: Curso[];
  value: number;
  onChange: (cursoId: number, curso?: Curso) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

const CursoBuscador: React.FC<Props> = ({
  cursos,
  value,
  onChange,
  label = "Curso",
  required = false,
  disabled = false,
  placeholder = "Buscar curso por nombre...",
}) => {
  // CORREGIDO: Inicializar con string vacío para evitar undefined
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const [filteredCursos, setFilteredCursos] = useState<Curso[]>(cursos);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filtrar cursos por término de búsqueda
  useEffect(() => {
    // CORREGIDO: Asegurar que searchTerm nunca sea undefined
    const termino = searchTerm || "";
    if (!termino.trim()) {
      setFilteredCursos(cursos);
    } else {
      const filtered = cursos.filter(
        (curso) =>
          curso.nombre?.toLowerCase().includes(termino.toLowerCase()) ||
          (curso.descripcion && curso.descripcion.toLowerCase().includes(termino.toLowerCase())) ||
          curso.id.toString().includes(termino)
      );
      setFilteredCursos(filtered);
    }
  }, [searchTerm, cursos]);

  // Obtener el curso seleccionado actual
  const cursoSeleccionado = cursos.find((c) => c.id === value);

  // Mostrar el nombre del curso seleccionado en el input
  useEffect(() => {
    if (cursoSeleccionado && cursoSeleccionado.nombre) {
      setSearchTerm(cursoSeleccionado.nombre);
    } else if (value === 0) {
      setSearchTerm("");
    }
  }, [value, cursoSeleccionado]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value || ""; // CORREGIDO: Asegurar que nunca sea undefined
    setSearchTerm(newValue);
    setIsOpen(true);
    
    // Si se borra el texto, resetear la selección
    if (!newValue.trim()) {
      onChange(0);
    }
  };

  const handleCursoSelect = (curso: Curso) => {
    setSearchTerm(curso.nombre || ""); // CORREGIDO: Asegurar que nunca sea undefined
    setIsOpen(false);
    onChange(curso.id, curso);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  return (
    <div className="curso-buscador-container" ref={containerRef} style={{ position: 'relative' }}>
      {label && (
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
          📚 {label} {required && <span style={{ color: 'red' }}>*</span>}
        </label>
      )}
      
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          value={searchTerm || ""} // CORREGIDO: Asegurar que nunca sea undefined
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={disabled ? "Verificando..." : placeholder}
          disabled={disabled}
          required={required}
          style={{
            width: '100%',
            padding: '10px 40px 10px 12px',
            borderWidth: '2px',
            borderStyle: 'solid',
            borderColor: isOpen ? '#3b82f6' : '#e1e8ed', // CORREGIDO: Evitar conflicto border/borderColor
            borderRadius: '8px',
            fontSize: '1rem',
            backgroundColor: disabled ? '#f8f9fa' : 'white',
            cursor: disabled ? 'not-allowed' : 'text',
            transition: 'border-color 0.3s ease'
          }}
        />
        
        {/* Icono de búsqueda */}
        <div style={{
          position: 'absolute',
          right: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#6b7280',
          fontSize: '1.2rem'
        }}>
          📚
        </div>
      </div>

      {/* Dropdown de cursos */}
      {isOpen && !disabled && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: '0',
          right: '0',
          backgroundColor: 'white',
          border: '2px solid #e1e8ed',
          borderTop: 'none',
          borderRadius: '0 0 8px 8px',
          maxHeight: '300px',
          overflowY: 'auto',
          zIndex: 1000,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          {filteredCursos.length === 0 ? (
            <div 
              key="no-results" // CORREGIDO: Agregar key
              style={{
                padding: '12px 15px',
                color: '#6b7280',
                textAlign: 'center',
                fontStyle: 'italic'
              }}
            >
              {(searchTerm || "").trim() ? 'No se encontraron cursos' : 'No hay cursos disponibles'}
            </div>
          ) : (
            filteredCursos.map((curso) => (
              <div
                key={`curso-${curso.id}`} // CORREGIDO: Key único y descriptivo
                onClick={() => handleCursoSelect(curso)}
                style={{
                  padding: '12px 15px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #f3f4f6',
                  backgroundColor: curso.id === value ? '#f0f9ff' : 'transparent',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (curso.id !== value) {
                    (e.target as HTMLElement).style.backgroundColor = '#f9fafb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (curso.id !== value) {
                    (e.target as HTMLElement).style.backgroundColor = 'transparent';
                  }
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  gap: '10px'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontWeight: '600',
                      fontSize: '1rem',
                      color: '#1f2937',
                      marginBottom: '4px'
                    }}>
                      📚 {curso.nombre || `Curso ${curso.id}`}
                    </div>
                    
                    {curso.descripcion && (
                      <div style={{
                        fontSize: '0.9rem',
                        color: '#6b7280',
                        marginBottom: '4px'
                      }}>
                        {curso.descripcion}
                      </div>
                    )}
                    
                    <div style={{
                      fontSize: '0.8rem',
                      color: '#6b7280'
                    }}>
                      <span>ID: {curso.id}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Información del curso seleccionado */}
      {cursoSeleccionado && !isOpen && (
        <div style={{
          marginTop: '8px',
          padding: '8px 12px',
          backgroundColor: '#f0f9ff',
          border: '1px solid #bfdbfe',
          borderRadius: '6px',
          fontSize: '0.9rem'
        }}>
          <div>
            <strong>📚 {cursoSeleccionado.nombre || `Curso ${cursoSeleccionado.id}`}</strong>
            {cursoSeleccionado.descripcion && (
              <div style={{ color: '#6b7280', fontSize: '0.8rem', marginTop: '4px' }}>
                {cursoSeleccionado.descripcion}
              </div>
            )}
          </div>
          <div style={{ 
            fontSize: '0.8rem', 
            color: '#6b7280', 
            marginTop: '4px'
          }}>
            <span>ID: {cursoSeleccionado.id}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CursoBuscador;