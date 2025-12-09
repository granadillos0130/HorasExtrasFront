import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authService } from "../../api/authService";

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const currentUser = authService.getCurrentUser();

  const menuItems = [
    {
      id: "trabajadores",
      title: "Trabajadores",
      icon: "👥",
      path: "/trabajadores"
    },
    {
      id: "centros",
      title: "Centros de Trabajo",
      icon: "🏢",
      path: "/centros"
    },
    {
      id: "registros",
      title: "Registros",
      icon: "📊",
      path: "/registros"
    },
    {
      id: "estadisticas",
      title: "Estadísticas",
      icon: "📈",
      path: "/estadisticas"
    },
    {
      id: "horarios",
      title: "Horarios",
      icon: "⏰",
      path: "/horarios"
    },
    {
      id: "clientes",
      title: "Clientes",
      icon: "👔",
      path: "/clientes"
    },
    {
      id: "ausencias",
      title: "Ausencias",
      icon: "🚫",
      path: "/ausencias"
    },
    {
      id: "cursos",
      title: "Cursos",
      icon: "🎓",
      path: "/cursos"
    }
  ];

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  return (
    <div style={{
      ...sidebarStyle,
      width: isCollapsed ? "80px" : "280px"
    }}>
      <div style={headerStyle}>
        <div style={logoContainerStyle}>
          <span style={logoIconStyle}>⏱️</span>
          <h2 style={{
            ...logoTextStyle,
            opacity: isCollapsed ? 0 : 1
          }}>
            HorasExtras
          </h2>
        </div>
        <button
          style={toggleButtonStyle}
          onClick={() => setIsCollapsed(!isCollapsed)}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
          }}
        >
          {isCollapsed ? "→" : "←"}
        </button>
      </div>

      <div style={userSectionStyle}>
        <div style={userAvatarStyle}>
          {currentUser?.nombre?.charAt(0).toUpperCase() || "U"}
        </div>
        <div style={{
          ...userInfoStyle,
          opacity: isCollapsed ? 0 : 1
        }}>
          <div style={userNameStyle}>
            {currentUser?.nombre|| "Usuario"}
          </div>
          <div style={userRoleStyle}>
            {currentUser?.cargoDesempenado || "Trabajador"}
          </div>
        </div>
      </div>

      <nav style={navStyle}>
        <div style={navSectionStyle}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <div
                key={item.id}
                style={{
                  ...menuItemStyle,
                  color: isActive ? "#fff" : "rgba(255, 255, 255, 0.7)",
                  background: isActive ? "rgba(255, 255, 255, 0.1)" : "transparent",
                  borderLeft: isActive ? "3px solid #3b82f6" : "3px solid transparent",
                  fontWeight: isActive ? "600" : "500"
                }}
                onClick={() => navigate(item.path)}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                <span style={menuIconStyle}>{item.icon}</span>
                <span style={{
                  ...menuTextStyle,
                  opacity: isCollapsed ? 0 : 1
                }}>
                  {item.title}
                </span>
              </div>
            );
          })}
        </div>
      </nav>

      <div style={footerStyle}>
        <button
          style={logoutButtonStyle}
          onClick={handleLogout}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)";
            e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.5)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
            e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.3)";
          }}
        >
          <span style={logoutIconStyle}>🚪</span>
          <span style={{
            ...logoutTextStyle,
            opacity: isCollapsed ? 0 : 1
          }}>
            Cerrar Sesión
          </span>
        </button>
      </div>
    </div>
  );
};

// Estilos reutilizables
const sidebarStyle: React.CSSProperties = {
  height: "100vh",
  background: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)",
  position: "fixed",
  left: 0,
  top: 0,
  display: "flex",
  flexDirection: "column",
  boxShadow: "4px 0 20px rgba(0, 0, 0, 0.15)",
  transition: "width 0.3s ease",
  zIndex: 1000,
  overflow: "hidden"
};

const headerStyle: React.CSSProperties = {
  padding: "24px 20px",
  borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "12px"
};

const logoContainerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  flex: 1,
  overflow: "hidden"
};

const logoIconStyle: React.CSSProperties = {
  fontSize: "28px",
  minWidth: "28px"
};

const logoTextStyle: React.CSSProperties = {
  color: "#fff",
  fontSize: "20px",
  fontWeight: "700",
  whiteSpace: "nowrap",
  transition: "opacity 0.3s ease"
};

const toggleButtonStyle: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.1)",
  border: "none",
  color: "#fff",
  width: "32px",
  height: "32px",
  borderRadius: "8px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "16px",
  transition: "all 0.2s ease",
  minWidth: "32px"
};

const userSectionStyle: React.CSSProperties = {
  padding: "20px",
  borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
  display: "flex",
  alignItems: "center",
  gap: "12px"
};

const userAvatarStyle: React.CSSProperties = {
  width: "40px",
  height: "40px",
  borderRadius: "50%",
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#fff",
  fontWeight: "600",
  fontSize: "16px",
  minWidth: "40px"
};

const userInfoStyle: React.CSSProperties = {
  flex: 1,
  overflow: "hidden",
  transition: "opacity 0.3s ease"
};

const userNameStyle: React.CSSProperties = {
  color: "#fff",
  fontSize: "14px",
  fontWeight: "600",
  marginBottom: "4px",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis"
};

const userRoleStyle: React.CSSProperties = {
  color: "rgba(255, 255, 255, 0.6)",
  fontSize: "12px",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis"
};

const navStyle: React.CSSProperties = {
  flex: 1,
  padding: "20px 0",
  overflowY: "auto",
  overflowX: "hidden"
};

const navSectionStyle: React.CSSProperties = {
  marginBottom: "8px"
};

const menuItemStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "12px 20px",
  cursor: "pointer",
  transition: "all 0.2s ease",
  textDecoration: "none",
  fontSize: "14px"
};

const menuIconStyle: React.CSSProperties = {
  fontSize: "20px",
  minWidth: "20px",
  textAlign: "center"
};

const menuTextStyle: React.CSSProperties = {
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  transition: "opacity 0.3s ease"
};

const footerStyle: React.CSSProperties = {
  padding: "20px",
  borderTop: "1px solid rgba(255, 255, 255, 0.1)"
};

const logoutButtonStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  background: "rgba(239, 68, 68, 0.1)",
  border: "1px solid rgba(239, 68, 68, 0.3)",
  borderRadius: "8px",
  color: "#ef4444",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "600",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  transition: "all 0.2s ease"
};

const logoutIconStyle: React.CSSProperties = {
  fontSize: "18px"
};

const logoutTextStyle: React.CSSProperties = {
  transition: "opacity 0.3s ease"
};

export default Sidebar;