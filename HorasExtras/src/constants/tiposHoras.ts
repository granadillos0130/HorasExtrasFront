

export const TIPOS_HORAS_CONFIG = {
  normales: {
    key: 'normales' as const,
    nombre: 'Horas Normales',
    icono: '🕘',
    color: '#10b981',
    descripcion: 'Horas trabajadas en jornada normal (x1.0)'
  },
  extrasdiurnas: {
    key: 'extrasdiurnas' as const,
    nombre: 'Extras Diurnas',
    icono: '☀️',
    color: '#f59e0b',
    descripcion: 'Horas extras trabajadas de día (x1.25)'
  },
  extrasnocturnas: {
    key: 'extrasnocturnas' as const,
    nombre: 'Extras Nocturnas',
    icono: '🌙',
    color: '#6366f1',
    descripcion: 'Horas extras trabajadas de noche (x1.75)'
  },
  dominicalesdiurnas: {
    key: 'dominicalesdiurnas' as const,
    nombre: 'Dominicales Diurnas',
    icono: '📅',
    color: '#ef4444',
    descripcion: 'Horas trabajadas domingos de día (x2.0)'
  },
  dominicalesnocturnas: {
    key: 'dominicalesnocturnas' as const,
    nombre: 'Dominicales Nocturnas',
    icono: '🌜',
    color: '#8b5cf6',
    descripcion: 'Horas trabajadas domingos de noche (x2.1)'
  },
   desplazamientonormal: {
    key: 'desplazamientonormal',
    nombre: 'Desplazamiento Normal',
    icono: '🚗',
    color: '#06b6d4',
    descripcion: 'Horas de desplazamiento dentro de jornada (x1.0)'
  },
  desplazamientoextradiurno: {
    key: 'desplazamientoextradiurno',
    nombre: 'Desplazamiento Extra Diurno',
    icono: '🚙',
    color: '#f97316',
    descripcion: 'Horas de desplazamiento extra diurno (x1.25)'
  },
  desplazamientoextranocturno: {
    key: 'desplazamientoextranocturno',
    nombre: 'Desplazamiento Extra Nocturno',
    icono: '🚕',
    color: '#7c3aed',
    descripcion: 'Horas de desplazamiento extra nocturno (x1.75)'
  }
};