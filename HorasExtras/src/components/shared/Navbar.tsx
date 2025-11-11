import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../../api/authService';

interface NavItem {
  id: string;
  title: string;
  path: string;
  icon: string;
  description: string;
}

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  const currentUser = authService.getCurrentUser();

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
      id: "cursos",
      title: "Cursos",
      path: "/cursos",
      icon: "🎓",
      description: "Gestión de cursos"
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

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="mobile-header" style={{
        display: 'none',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '15px 20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: 'white',
            fontWeight: '700',
            fontSize: '1.3rem'
          }}>
            <span>⚡</span>
            <span>HorasExtras</span>
          </div>
          <button
            onClick={toggleMobileSidebar}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: '2px solid rgba(255,255,255,0.3)',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1.2rem'
            }}
          >
            ☰
          </button>
        </div>
      </div>

      {/* Overlay para mobile */}
      {isMobileOpen && (
        <div
          onClick={toggleMobileSidebar}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 999,
            display: 'none'
          }}
          className="mobile-overlay"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: isCollapsed ? '80px' : '280px',
          background: 'linear-gradient(180deg, #1e1e2e 0%, #2d2d44 100%)',
          boxShadow: '4px 0 20px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.3s ease',
          zIndex: 1000,
          overflowY: 'auto',
          overflowX: 'hidden'
        }}
      >
        {/* Header con logo */}
        <div style={{
          padding: '20px',
          borderBottom: '2px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: '70px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}>
          <Link
            to="/"
            style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: 'white',
              fontWeight: '700',
              fontSize: isCollapsed ? '1.5rem' : '1.3rem',
              transition: 'all 0.3s ease'
            }}
          >
            <span>⚡</span>
            {!isCollapsed && <span>HorasExtras</span>}
          </Link>
          
          <button
            onClick={toggleSidebar}
            className="collapse-btn"
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: '2px solid rgba(255,255,255,0.3)',
              color: 'white',
              padding: '6px 10px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '1rem',
              transition: 'all 0.3s ease'
            }}
          >
            {isCollapsed ? '→' : '←'}
          </button>
        </div>

        {/* User Info */}
        {currentUser && (
          <div style={{
            padding: isCollapsed ? '15px 10px' : '20px',
            borderBottom: '2px solid rgba(255,255,255,0.1)',
            background: 'rgba(102, 126, 234, 0.1)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: 'white'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.3rem',
                flexShrink: 0
              }}>
                👤
              </div>
              {!isCollapsed && (
                <div style={{
                  overflow: 'hidden'
                }}>
                  <div style={{
                    fontWeight: '600',
                    fontSize: '0.95rem',
                    marginBottom: '2px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {currentUser.nombre}
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    opacity: 0.7,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {currentUser.cargoDesempenado || 'Trabajador'}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav style={{
          flex: 1,
          padding: '20px 10px',
          overflowY: 'auto'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            {navItems.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                style={{
                  textDecoration: 'none',
                  color: 'white',
                  padding: isCollapsed ? '12px 10px' : '12px 16px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.3s ease',
                  background: isActive(item.path)
                    ? 'linear-gradient(135deg, #667eea, #764ba2)'
                    : 'transparent',
                  border: '2px solid',
                  borderColor: isActive(item.path)
                    ? 'rgba(255,255,255,0.3)'
                    : 'transparent',
                  position: 'relative',
                  justifyContent: isCollapsed ? 'center' : 'flex-start'
                }}
                onMouseOver={(e) => {
                  if (!isActive(item.path)) {
                    e.currentTarget.style.background = 'rgba(102, 126, 234, 0.2)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isActive(item.path)) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'transparent';
                  }
                }}
                title={isCollapsed ? item.title : ''}
              >
                <span style={{ 
                  fontSize: '1.3rem',
                  flexShrink: 0
                }}>
                  {item.icon}
                </span>
                {!isCollapsed && (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                  }}>
                    <span style={{
                      fontWeight: '600',
                      fontSize: '0.95rem'
                    }}>
                      {item.title}
                    </span>
                    {isActive(item.path) && (
                      <span style={{
                        fontSize: '0.7rem',
                        opacity: 0.8
                      }}>
                        {item.description}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </nav>

        {/* Logout Button */}
        <div style={{
          padding: '20px 10px',
          borderTop: '2px solid rgba(255,255,255,0.1)'
        }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: isCollapsed ? '12px 10px' : '12px 16px',
              background: 'rgba(239, 68, 68, 0.9)',
              color: 'white',
              border: '2px solid rgba(255,255,255,0.3)',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              gap: '12px',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(220, 38, 38, 1)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.9)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>🚪</span>
            {!isCollapsed && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      <style>
        {`
          /* Responsive */
          @media (max-width: 768px) {
            .mobile-header {
              display: flex !important;
            }
            
            .collapse-btn {
              display: none !important;
            }
            
            .sidebar {
              transform: translateX(-100%);
              width: 280px !important;
            }
            
            .sidebar.mobile-open {
              transform: translateX(0);
            }
            
            .mobile-overlay {
              display: block !important;
            }
          }

          /* Scrollbar personalizado */
          .sidebar::-webkit-scrollbar {
            width: 6px;
          }

          .sidebar::-webkit-scrollbar-track {
            background: rgba(255,255,255,0.05);
          }

          .sidebar::-webkit-scrollbar-thumb {
            background: rgba(255,255,255,0.2);
            border-radius: 3px;
          }

          .sidebar::-webkit-scrollbar-thumb:hover {
            background: rgba(255,255,255,0.3);
          }
        `}
      </style>
    </>
  );
};

export default Sidebar;