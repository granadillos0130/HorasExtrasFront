// src/components/shared/Navbar.tsx
import React, { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface NavItem {
  id: string;
  title: string;
  path: string;
  icon: string;
  description: string;
}

const Navbar: React.FC = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems: NavItem[] = [
    {
      id: "dashboard",
      title: "Inicio",
      path: "/",
      icon: "🏠",
      description: "Dashboard principal"
    },
    {
      id: "trabajadores",
      title: "Trabajadores",
      path: "/trabajadores",
      icon: "👥",
      description: "Gestión de trabajadores"
    },
    {
      id: "centros",
      title: "Centros",
      path: "/centros",
      icon: "🏢",
      description: "Centros de trabajo"
    },
    {
      id: "registros",
      title: "Registros",
      path: "/registros",
      icon: "📊",
      description: "Registros de trabajo"
    },
    {
      id: "estadisticas",
      title: "Estadísticas",
      path: "/estadisticas",
      icon: "📈",
      description: "Reportes y análisis"
    },
    {
      id: "horarios",
      title: "Horarios",
      path: "/horarios",
      icon: "⏰",
      description: "Gestión de horarios"
    },
    {
      id: "clientes",
      title: "Clientes",
      path: "/clientes",
      icon: "👔",
      description: "Gestión de clientes"
    },
    {
      id: "ausencias",
      title: "Ausencias",
      path: "/ausencias",
      icon: "🏥",
      description: "Gestión de ausencias"
    }
  ];

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Generar breadcrumbs basado en la ruta actual
  const breadcrumbs = useMemo(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const crumbs = [{ title: 'Inicio', path: '/', icon: '🏠' }];
    
    let currentPath = '';
    pathSegments.forEach((segment) => {
      currentPath += `/${segment}`;
      const navItem = navItems.find(item => item.path === currentPath);
      if (navItem) {
        crumbs.push({
          title: navItem.title,
          path: currentPath,
          icon: navItem.icon
        });
      } else {
        // Para rutas específicas como /trabajadores/editar/123
        const parentPath = `/${segment}`;
        const parentItem = navItems.find(item => item.path === parentPath);
        if (parentItem && crumbs.length === 1) {
          crumbs.push({
            title: parentItem.title,
            path: parentPath,
            icon: parentItem.icon
          });
        }
        // Agregar sub-página
        if (pathSegments.indexOf(segment) > 0) {
          const actionNames: { [key: string]: string } = {
            'crear': '➕ Crear',
            'editar': '✏️ Editar',
            'nuevo': '➕ Nuevo',
            'nueva': '➕ Nueva',
            'lote': '📊 Lote',
            'intensidad': '⚡ Intensidad',
            'estadisticas': '📊 Estadísticas'
          };
          const actionName = actionNames[segment] || `📄 ${segment}`;
          crumbs.push({
            title: actionName,
            path: currentPath,
            icon: ''
          });
        }
      }
    });
    
    return crumbs;
  }, [location.pathname, navItems]);

  const currentPageInfo = useMemo(() => {
    const currentItem = navItems.find(item => isActive(item.path));
    return currentItem || navItems[0];
  }, [location.pathname, navItems]);

  return (
    <>
      {/* Navbar principal */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backdropFilter: 'blur(10px)',
        borderBottom: '2px solid rgba(255,255,255,0.1)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: '70px'
        }}>
          {/* Logo/Brand */}
          <Link 
            to="/" 
            style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: 'white',
              fontWeight: '700',
              fontSize: '1.4rem',
              textShadow: '1px 1px 3px rgba(0,0,0,0.3)'
            }}
          >
            <div style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '8px 12px',
              borderRadius: '12px',
              fontSize: '1.2rem',
              backdropFilter: 'blur(5px)',
              border: '1px solid rgba(255,255,255,0.3)'
            }}>
              ⚡
            </div>
            <span>HorasExtras</span>
          </Link>

          {/* Navigation Links - Desktop */}
          <div style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center'
          }} className="desktop-nav">
            {navItems.slice(1).map((item) => (
              <Link
                key={item.id}
                to={item.path}
                style={{
                  textDecoration: 'none',
                  color: 'white',
                  padding: '10px 16px',
                  borderRadius: '12px',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.3s ease',
                  background: isActive(item.path) 
                    ? 'rgba(255,255,255,0.25)' 
                    : 'rgba(255,255,255,0.1)',
                  border: isActive(item.path)
                    ? '2px solid rgba(255,255,255,0.4)'
                    : '2px solid transparent',
                  backdropFilter: 'blur(5px)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseOver={(e) => {
                  if (!isActive(item.path)) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isActive(item.path)) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                <span>{item.title}</span>
                {isActive(item.path) && (
                  <div style={{
                    position: 'absolute',
                    bottom: '-2px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '60%',
                    height: '3px',
                    background: 'linear-gradient(90deg, #43e97b, #38f9d7)',
                    borderRadius: '2px'
                  }} />
                )}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            style={{
              display: 'none',
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '2px solid rgba(255,255,255,0.3)',
              padding: '10px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '1.2rem',
              backdropFilter: 'blur(5px)',
              transition: 'all 0.3s ease'
            }}
            className="mobile-menu-btn"
          >
            {isMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div style={{
            background: 'rgba(0,0,0,0.95)',
            backdropFilter: 'blur(10px)',
            padding: '20px',
            borderTop: '1px solid rgba(255,255,255,0.1)'
          }} className="mobile-nav">
            <div style={{
              display: 'grid',
              gap: '12px',
              maxWidth: '400px',
              margin: '0 auto'
            }}>
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  style={{
                    textDecoration: 'none',
                    color: 'white',
                    padding: '16px 20px',
                    borderRadius: '12px',
                    background: isActive(item.path)
                      ? 'linear-gradient(135deg, #43e97b, #38f9d7)'
                      : 'rgba(255,255,255,0.1)',
                    border: '2px solid rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <span style={{ fontSize: '1.3rem' }}>{item.icon}</span>
                  <div>
                    <div style={{ 
                      fontWeight: '600', 
                      fontSize: '1.1rem',
                      marginBottom: '2px'
                    }}>
                      {item.title}
                    </div>
                    <div style={{ 
                      fontSize: '0.85rem', 
                      opacity: 0.8 
                    }}>
                      {item.description}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Breadcrumbs - Solo mostrar si no estamos en el dashboard principal */}
      {location.pathname !== '/' && (
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(0,0,0,0.1)',
          padding: '12px 0',
          position: 'sticky',
          top: '70px',
          zIndex: 999
        }}>
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '0 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.path}>
                {index > 0 && (
                  <span style={{
                    color: '#9ca3af',
                    fontSize: '0.9rem',
                    fontWeight: '500'
                  }}>
                    →
                  </span>
                )}
                {index === breadcrumbs.length - 1 ? (
                  // Última miga (página actual) - no es enlace
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#667eea',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    background: 'linear-gradient(135deg, #667eea15, #764ba215)',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid #667eea30'
                  }}>
                    {crumb.icon && <span style={{ fontSize: '0.9rem' }}>{crumb.icon}</span>}
                    <span>{crumb.title}</span>
                  </div>
                ) : (
                  // Migas anteriores - son enlaces
                  <Link
                    to={crumb.path}
                    style={{
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: '#6b7280',
                      fontWeight: '500',
                      fontSize: '0.9rem',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.color = '#667eea';
                      e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.color = '#6b7280';
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    {crumb.icon && <span style={{ fontSize: '0.9rem' }}>{crumb.icon}</span>}
                    <span>{crumb.title}</span>
                  </Link>
                )}
              </React.Fragment>
            ))}
            
            {/* Información adicional de la página actual */}
            <div style={{
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '0.85rem',
              color: '#6b7280'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: '600',
                color: '#4b5563'
              }}>
                {currentPageInfo.description}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS para responsive */}
      <style>
        {`
          @media (max-width: 768px) {
            .desktop-nav {
              display: none !important;
            }
            .mobile-menu-btn {
              display: block !important;
            }
          }
          
          @media (min-width: 769px) {
            .mobile-nav {
              display: none !important;
            }
          }

          /* Responsive para breadcrumbs */
          @media (max-width: 640px) {
            /* Ocultar descripción en móvil */
            .breadcrumb-description {
              display: none !important;
            }
            /* Breadcrumbs más compactos en móvil */
            .breadcrumbs-container {
              padding: 8px 15px !important;
              font-size: 0.8rem !important;
            }
          }

          /* Animaciones mejoradas */
          .mobile-nav {
            animation: slideDown 0.3s ease-out;
          }

          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          /* Efectos hover suaves para enlaces de navegación */
          .nav-link {
            position: relative;
            overflow: hidden;
          }

          .nav-link::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            transition: left 0.5s;
          }

          .nav-link:hover::before {
            left: 100%;
          }

          /* Scroll suave para navegación */
          html {
            scroll-behavior: smooth;
          }

          /* Mejora de accesibilidad */
          .nav-link:focus {
            outline: 2px solid #43e97b;
            outline-offset: 2px;
          }

          /* Loading state para breadcrumbs */
          .breadcrumb-loading {
            background: linear-gradient(90deg, #f3f4f6, #e5e7eb, #f3f4f6);
            background-size: 200% 100%;
            animation: loading 1.5s infinite;
          }

          @keyframes loading {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}
      </style>
    </>
  );
};

export default Navbar;