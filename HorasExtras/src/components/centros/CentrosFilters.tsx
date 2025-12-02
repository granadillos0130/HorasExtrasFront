import React from "react";

interface CentrosFiltersProps {
    añoSeleccionado: number;
    mesSeleccionado: number | null;
    busqueda: string;
    onAñoChange: (año: number) => void;
    onMesChange: (mes: number | null) => void;
    onBusquedaChange: (texto:string) => void;
    onCrearCentro: () => void;
}

const MESES = [
    {valor: null, nombre: "Todos los meses"},
    {valor:1, nombre:"Enero"},
    {valor:2, nombre:"Febrero"},
    {valor:3, nombre:"Marzo"},
    {valor:4, nombre:"Abril"},
    {valor:5, nombre:"Mayo"},
    {valor:6, nombre:"Junio"},
    {valor:7, nombre:"Julio"},
    {valor:8, nombre:"Agosto"},
    {valor:9, nombre:"Septiembre"},
    {valor:10, nombre:"Octubre"},
    {valor:11, nombre:"Noviembre"},
    {valor:12, nombre:"Diciembre"},
];

const AÑOS = [2023,2024,2025,2026,2027,2028];

const CentrosFilters: React.FC<CentrosFiltersProps> =({
    añoSeleccionado,
    mesSeleccionado,
    busqueda,
    onAñoChange,
    onMesChange,
    onBusquedaChange,
    onCrearCentro
}) => {
    return(
        <div style={{
            background: 'white',
            padding: '20px 30px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            marginBottom: '20px'
        }}>
            {/*Fila 1: Filtros de Año,Mes y boton Crear*/}
            <div style={{
                display:'flex',
                gap: '15px',
                alignItems:'center',
                marginBottom: '15px',
                flexWrap: 'wrap'
            }}>
                {/* Seleccion de año*/}
                <div style={{flex: '0 0 150px'}}>
                    <label style={{
                        display: 'block',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        color:'#475569',
                        marginBottom: '6px'
                    }}>
                        Año
                    </label>
                    <select
                        value={añoSeleccionado}
                        onChange={(e) => onAñoChange(Number(e.target.value))}
                        style={{
                            width: '100%',
                            padding:'10px 12px',
                            border: '1px solid #cbd5e1',
                            borderRadius: '8px',
                            fontSize: '0.95rem',
                            background: '#f8fafc',
                            cursor: 'pointer',
                            fontWeight: '500'
                        }}
                    >
                        {AÑOS.map(año =>(
                            <option key={año} value={año}>{año}</option>
                        ))}
                    </select>
                </div>

                {/* Selector del Mes */}
                <div style={{ flex: '0 0 180px' }}>
                    <label style={{
                        display: 'block',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        color: '#475569',
                        marginBottom: '6px'
                    }}>
                        Mes
                    </label>
                    <select
                        value={mesSeleccionado ?? ''}
                        onChange={(e) =>{
                            const valor = e.target.value === '' ? null : Number(e.target.value);
                            onMesChange(valor);
                        }}
                        style ={{
                            width: '100%',
                            padding: '10px 12px',
                            border: '1px solid #cbd5e1',
                            borderRadius: '8px',
                            fontSize: '0.95rem',
                            background: '#f8fafc',
                            cursor: 'pointer',
                            fontWeight: '500'
                        }}
                    >   
                        {MESES.map(mes => (
                            <option key={mes.valor ?? 'todos'} value={mes.valor ?? ''}>
                                {mes.nombre}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Spacer para empujar el boton a la derecha */}
                <div style={{flex: 1}} />

                {/* Boton crear Centro */}
                <button
                    onClick={onCrearCentro}
                    style={{
                        background: '#059669',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.95rem',
                        display: 'flex',
                        gap: '8px',
                        transition: 'background 0.2s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#047857'}
                    onMouseOut={(e) => e.currentTarget.style.background = '#059669'}
                >
                    <span>+</span>
                    Nuevo Centro
                </button>
            </div>

            {/* Fila 2: Buscador */}
            <div>
                <label style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    color: '#475569',
                    marginBottom: '6px'
                }}>
                    Buscar
                </label>
                <input 
                    type="text"
                    placeholder="Buscar por ID o nombre del centro..."
                    value={busqueda}
                    onChange={(e) => onBusquedaChange(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '10px 15px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        fontSize: '0.95rem',
                        background: '#f8fafc'
                    }}
                />
            </div>
        </div>
    );
};

export default CentrosFilters;