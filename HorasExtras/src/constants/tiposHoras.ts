

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
  }
};