import React from 'react';
import type { Preoperacional } from '../../types/preoperacional';
import { FallasChip } from './FallasChip';

interface PreoperacionalRowProps {
    preoperacional: Preoperacional;
    onViewDetails?: (preoperacional: Preoperacional)=> void;
}

export const PreoperacionalRow: React.FC<PreoperacionalRowProps> =({
    preoperacional,
    onViewDetails
}) =>{
    const rowStyle: React.CSSProperties = {
        borderBottom: '1px solid #e0e0e0',
        transition: 'background-color 0.2s',
        cursor: onViewDetails ? 'pointer' : 'default'
    };

    const cellStyle: React.CSSProperties = {
        padding: '16px 12px',
        verticalAlign: 'middle'
    };

    const estadoBadgeStyle: React.CSSProperties = {
        padding: '6px 12px',
        borderRadius: '16px',
        fontSize: '13px',
        fontWeight: '600',
        display: 'inline-block',
        ...(preoperacional.estado === 'OK'
            ?{backgroundColor: '#d4edda', color: '#155724'}
            : preoperacional.estado === 'Con Fallas'
            ? {backgroundColor: '#f8d7da', color:'#721c24'}
            : {backgroundColor: '#fff3cd', color: '#856404'}
        )
    };

    const diaStyle: React.CSSProperties = {
        textTransform: 'capitalize',
        fontWeight: '500',
        color: '#555'
    }

    const placaStyle: React.CSSProperties = {
        fontFamily: 'monospace',
        fontWeight: 'bold',
        fontSize: '14px',
        color: '#333'
    };

    const handleRowClick = () =>{
        if (onViewDetails) {
            onViewDetails(preoperacional);
        }
    };

    const handleRowHover = (e: React.MouseEvent<HTMLTableRowElement>) =>{
        if (onViewDetails) {
            e.currentTarget.style.backgroundColor = '#f8f9fa';
        }
    };

    const handleRowLeave = (e: React.MouseEvent<HTMLTableRowElement>) =>{
        e.currentTarget.style.background = 'transparent';
    };

    return (
        <tr 
          style={rowStyle}
          onClick={handleRowClick}
          onMouseEnter={handleRowHover}
          onMouseLeave={handleRowLeave}
        >
            <td style={cellStyle}>
                <div>
                    <div style={{ fontWeight: '600', marginBottom: '4px'}}>
                        {preoperacional.vehiculo}
                    </div>
                    <div style={placaStyle}>{preoperacional.placa}</div>
                </div>
            </td>
            <td style={cellStyle}>
                <div style={diaStyle}>{preoperacional.diaSemana}</div>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px'}}>
                    {new Date(preoperacional.fecha).toLocaleDateString('es-CO')}
                </div>
            </td>
            <td style={cellStyle}>
                <div>{preoperacional.mes}</div>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px'}}>
                    {preoperacional.semanaInspeccion}
                </div>
            </td>
            <td style={cellStyle}>
                <span style={estadoBadgeStyle}>{preoperacional.estado}</span>
            </td>
            <td style={cellStyle}>
                <FallasChip fallas={preoperacional.fallas} />
            </td>
        </tr>
    )

}