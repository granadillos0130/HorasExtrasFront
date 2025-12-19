import React from 'react';

interface FallasChipProps{
    fallas: string[];
}

export const FallasChip: React.FC<FallasChipProps> = ({ fallas }) =>{
    const containerStyle: React.CSSProperties = {
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
        alignItems: 'center'
    };

    const chipStyle: React.CSSProperties = {
        backgroundColor: '#fee',
        color: '#c33',
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '500',
        border: '1px solid #fcc'
    };

    const emptyStyle: React.CSSProperties = {
        color: '#28a745',
        fontSize: '14px',
        fontWeight: '500'
    };

    if (fallas.length === 0) {
        return <span style={emptyStyle}>✓ Sin fallas</span>
    }

    return (
        <div style={containerStyle}>
            {fallas.map((falla, index) =>(
                <span key={index} style={chipStyle}>
                    {falla}
                </span>
            ))}
        </div>
    );
};