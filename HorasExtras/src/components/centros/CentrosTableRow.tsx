import React, {useState, useRef, useEffect} from "react";
import type { CentroPorMesCompleto } from "../../types/centros";

interface CentrosTableRowProps {
    centro : CentroPorMesCompleto;
    onVerInfo: () => void;
    onVerCargos:  () => void;
    onVerEjecucion: () => void;
    onEditar: () => void;
}

const formatearFecha = (fecha: string) => {
  const date = new Date(fecha);
  const dia = String(date.getDate()).padStart(2, '0');
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const año = date.getFullYear();
  return `${dia}/${mes}/${año}`;
};

const formatearHoras = (hours: number) =>{
    if(hours === 0) return "0:00";
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}:${m.toString().padStart(2, "0")}`;
};

const formatearMoneda = (valor: number) =>{
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits:0
    }). format(valor);
};

const CentrosTableRow: React.FC<CentrosTableRowProps> = ({
    centro,
    onVerInfo,
    onVerCargos,
    onVerEjecucion,
    onEditar
}) => {
    const [menuAbierto, setMenuAbierto] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const totalHoras = centro.trabajadores.reduce((sum, t) => sum + t.totalHoras,0);
    const totalTrabajadores = centro.trabajadores.length;

    useEffect(() =>{
        const handleClickOutSide = (event: MouseEvent) =>{
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setMenuAbierto(false);
            }
        };

        if (menuAbierto) {
            document.addEventListener('mousedown', handleClickOutSide);
        }

        return () =>{
            document.removeEventListener('mousedown', handleClickOutSide)
        };
    }, [menuAbierto]);

    const handleMenuClick = (accion: () => void) =>{
        accion();
        setMenuAbierto(false);
    };

    return (
        <tr style={{
            borderBottom: '1px solid #e2e8f0',
            transition: 'background 0.2s ease'
        }}
            onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
        >
            {/* ID */}
            <td style={cellStyle}>
                <span style={{
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    color: '#64748b',
                    fontWeight:'600'
                }}>
                    {centro.centroId.slice(0, 8)}
                </span>
            </td>

            {/* Nombre Centro */}
            <td style={{ ...cellStyle, textAlign: 'left', fontWeight: '600', color:'#1e293b'}}>
                {centro.centroNombre}
            </td>

            {/* Trabajadores */}
            <td style={cellStyle}>
                <span style={{
                    background: totalTrabajadores > 0 ? '#dbeafe' : '#f1f5f9',
                    color: totalTrabajadores > 0 ? '#1e40af' : '#64748b',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontWeight: '600',
                    fontSize: '0.85rem'
                }}>
                    {totalTrabajadores}
                </span>
            </td>

            {/* Fecha Inicio */}
            <td style = {{ ...cellStyle, fontSize: '0.85rem', color: '#475569'}}>
                {formatearFecha(centro.fechaInicio)}
            </td>

            {/* Fecha Final */}
            <td style={{ ...cellStyle, fontSize: '0.85rem', color:'#475569'}}>
                {centro.fechaFinal ? formatearFecha(centro.fechaFinal): (
                    <span style={{color: '#059669', fontWeight:'600'}}>Vigente</span>
                )}
            </td>

            {/* Horas */}
            <td style={{...cellStyle, fontWeight:'600', color: '#1e40af'}}>
                {formatearHoras(totalHoras)}
            </td>

            {/* Mano de Obra */}
            <td style={{ ...cellStyle, fontWeight: '600', color:'#059669'}}>
                {formatearMoneda(centro.manoObraTotal || 0)}
            </td>

            {/* Menu de Acciones */}
            <td style={{ ...cellStyle, position:'relative'}}>
                <button
                    ref={buttonRef}
                    onClick={() => setMenuAbierto(!menuAbierto)}
                    style={{
                        background: menuAbierto ? '#e2e8f0' : 'transparent',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px 10px',
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                        color: '#475569',
                        transition: 'all 0.2s ease',
                        fontWeight: '700'
                    }}
                    onMouseOver={(e) =>{
                        if(!menuAbierto) e.currentTarget.style.background= '#f1f5f9';
                    }}
                    onMouseOut={(e) =>{
                        if(!menuAbierto) e.currentTarget.style.background = 'transparent';
                    }}
                    title="Acciones"
                >
                    :
                </button>

                {/* Menu Desplegable */}
                {menuAbierto && (

                
                <div
                    ref={menuRef}
                    style={{
                        position: 'absolute',
                        right: '10px',
                        top: '100%',
                        marginTop: '5px',
                        background: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                        zIndex: 1000,
                        minWidth: '180px',
                        overflow: 'hidden'
                    }}
                >
                    <button
                        onClick={() => handleMenuClick(onVerInfo)}
                        style={menuItemStyle}
                        onMouseOver={(e) => e.currentTarget.style.background = '#fof9ff'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                    >
                        <span style={{marginRight: '10px'}}>📊</span>
                        Ver Informacion
                    </button>

                    <button
                        onClick={() => handleMenuClick(onVerCargos)}
                        style={menuItemStyle}
                        onMouseOver={(e) => e.currentTarget.style.background = '#fff7ed'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                    >
                        <span style={{marginRight: '10px'}}>👷</span>
                        Ver Cargos
                    </button>

                    <button
                        onClick={() => handleMenuClick(onVerEjecucion)}
                        style={menuItemStyle}
                        onMouseOver={(e) => e.currentTarget.style.background = '#faf5ff'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                    >
                        <span style={{ marginRight: '10px'}}>📈</span>
                        Ver Ejecucion
                    </button>

                    <div style={{
                        height: '1px',
                        background:'#e2e8f0',
                        margin: '4px 0'
                    }} />

                    <button
                        onClick={() => handleMenuClick(onEditar)}
                        style={menuItemStyle}
                        onMouseOver={(e) => e.currentTarget.style.background = '#eff6ff'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                    >
                        <span style={{ marginRight: '10px'}}>✏️</span>
                        Editar Centro
                    </button>

                </div>
                )}
            </td>
        </tr>
    )
}
// Estilos reutilizables
const cellStyle: React.CSSProperties = {
  padding: '15px 12px',
  textAlign: 'center',
  fontSize: '0.9rem',
  color: '#334155'
};

const menuItemStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  border: 'none',
  background: 'white',
  textAlign: 'left',
  cursor: 'pointer',
  fontSize: '0.9rem',
  fontWeight: '500',
  color: '#334155',
  display: 'flex',
  alignItems: 'center',
  transition: 'background 0.2s ease'
};

export default CentrosTableRow;