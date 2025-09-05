// src/components/shared/PageIndicator.tsx
import React from 'react';
import { useLocation } from 'react-router-dom';

interface PageInfo {
  title: string;
  subtitle: string;
  icon: string;
  color: string;
}

interface PageIndicatorProps {
  customTitle?: string;
  customSubtitle?: string;
  customIcon?: string;
  customColor?: string;
  showBreadcrumbs?: boolean;
}

const PageIndicator: React.FC<PageIndicatorProps> = ({
  customTitle,
  customSubtitle,
  customIcon,
  customColor,
  showBreadcrumbs = false
}) => {
  const location = useLocation();

  const pageMap: { [key: string]: PageInfo } = {
    '/': {
      title: 'Dashboard Principal',
      subtitle: 'Bienvenido al sistema de gestión de horas extras',
      icon: '🏠',
      color: '#667eea'
    },
    '/trabajadores': {
      title: 'Gestión de Trabajadores',
      subtitle: 'Administra la información de tu equipo de trabajo',
      icon: '👥',
      color: '#10b981'
    },
    '/centros': {
      title: 'Centros de Trabajo',
      subtitle: 'Administra los diferentes centros y ubicaciones',
      icon: '🏢',
      color: '#3b82f6'
    },
    '/registros': {
      title: 'Registros de Trabajo',
      subtitle: 'Consulta y analiza los registros de horas trabajadas',
      icon: '📊',
      color: '#8b5cf6'
    },
    '/estadisticas': {
      title: 'Estadísticas y Reportes',
      subtitle: 'Visualiza análisis detallados del rendimiento laboral',
      icon: '📈',
      color: '#f59e0b'
    },
    '/horarios': {
      title: 'Gestión de Horarios',
      subtitle: 'Asigna y administra los horarios de los trabajadores',
      icon: '⏰',
      color: '#ef4444'
    },
    '/clientes': {
      title: 'Gestión de Clientes',
      subtitle: 'Administra la información de todos los clientes',
      icon: '👔',
      color: '#6366f1'
    },
    '/cursos': {
      title: 'Gestión de Cursos',
      subtitle: 'Administra los cursos de capacitación y formación del personal',
      icon: '🎓',
      color: '#059669'
    },
    '/ausencias': {
      title: 'Gestión de Ausencias',
      subtitle: 'Consulta y administra las ausencias de los trabajadores',
      icon: '🏥',
      color: '#dc2626'
    }
  };

  // Buscar información de la página actual
  const getCurrentPageInfo = (): PageInfo => {
    // Primero buscar coincidencia exacta
    if (pageMap[location.pathname]) {
      return pageMap[location.pathname];
    }

    // Buscar por prefijo para rutas anidadas
    const pathKey = Object.keys(pageMap).find(key => 
      key !== '/' && location.pathname.startsWith(key)
    );

    if (pathKey) {
      const baseInfo = pageMap[pathKey];
      // Personalizar para sub-rutas
      const pathSegments = location.pathname.split('/').filter(Boolean);
      let title = baseInfo.title;
      let subtitle = baseInfo.subtitle;

      if (pathSegments.length > 1) {
        const action = pathSegments[pathSegments.length - 1];
        switch (action) {
          case 'crear':
          case 'nuevo':
          case 'nueva':
            title = `${baseInfo.title} - Crear Nuevo`;
            subtitle = 'Completa el formulario para crear un nuevo registro';
            break;
          case 'editar':
            title = `${baseInfo.title} - Editar`;
            subtitle = 'Modifica la información del registro seleccionado';
            break;
          case 'lote':
            title = `${baseInfo.title} - Modo Lote`;
            subtitle = 'Crea múltiples registros de una vez';
            break;
          case 'estadisticas':
            if (pathSegments[0] === 'ausencias') {
              title = `${baseInfo.title} - Estadísticas`;
              subtitle = 'Análisis estadístico de horas por tipo de ausencia';
            } else {
              title = `${baseInfo.title} - Estadísticas`;
              subtitle = 'Análisis estadístico detallado';
            }
            break;
          default:
            if (pathSegments.includes('intensidad')) {
              title = `${baseInfo.title} - Intensidad Horaria`;
              subtitle = 'Configura la intensidad horaria del trabajador';
            }
        }
      }

      return { ...baseInfo, title, subtitle };
    }

    // Default fallback
    return {
      title: 'Página no encontrada',
      subtitle: 'La página solicitada no existe',
      icon: '❓',
      color: '#9ca3af'
    };
  };

  const pageInfo = getCurrentPageInfo();
  const finalInfo = {
    title: customTitle || pageInfo.title,
    subtitle: customSubtitle || pageInfo.subtitle,
    icon: customIcon || pageInfo.icon,
    color: customColor || pageInfo.color
  };

  if (!showBreadcrumbs && location.pathname === '/') {
    return null; // No mostrar en el dashboard si no se solicita explícitamente
  }

  return (
    <div style={{
      background: `linear-gradient(135deg, ${finalInfo.color}15, ${finalInfo.color}08)`,
      borderBottom: `3px solid ${finalInfo.color}30`,
      padding: '20px 0',
      marginBottom: '20px'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 20px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '15px'
        }}>
          <div style={{
            background: `linear-gradient(135deg, ${finalInfo.color}, ${finalInfo.color}dd)`,
            color: 'white',
            width: '60px',
            height: '60px',
            borderRadius: '15px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem',
            boxShadow: `0 8px 20px ${finalInfo.color}40`
          }}>
            {finalInfo.icon}
          </div>
          <div>
            <h1 style={{
              margin: '0 0 5px 0',
              fontSize: '1.8rem',
              fontWeight: '700',
              color: '#333',
              lineHeight: 1.2
            }}>
              {finalInfo.title}
            </h1>
            <p style={{
              margin: 0,
              fontSize: '1rem',
              color: '#666',
              lineHeight: 1.4
            }}>
              {finalInfo.subtitle}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageIndicator;