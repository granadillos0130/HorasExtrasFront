# HorasExtrasFront

Frontend en React + TypeScript para el sistema de gestión de horas extra,
ausencias, compensados, turnos rotativos y control biométrico de asistencia.
Consume la API de [AppHorasExtrasApi](https://github.com/granadillos0130/AppHorasExtrasApi).

Proyecto de portafolio construido originalmente durante una pasantía y luego
reestructurado para separar lógica de negocio de presentación, eliminar
código muerto y quedar libre de datos/URLs de la empresa original.

## Stack

- **React 19** + **TypeScript**
- **Vite** como bundler y servidor de desarrollo
- **React Router** para navegación
- **Axios** para consumo de la API
- **Chart.js** para visualización de estadísticas
- **ExcelJS / SheetJS** para exportación de reportes

## Arquitectura

```
api/          → servicios de conexión a la API (uno por dominio: centros,
                trabajadores, ausencias, compensados, registros, etc.)
components/   → componentes reutilizables organizados por dominio
hooks/        → lógica de fetching y estado extraída de los componentes
                (patrón: el componente queda con JSX, el hook con la lógica)
pages/        → páginas/rutas de la aplicación
types/        → contratos TypeScript compartidos con las respuestas de la API
utils/        → funciones puras de formato y cálculo (fechas, horas, etc.)
styles/       → CSS organizado por página/componente
```

La convención del proyecto: los componentes y páginas no hacen fetching
directo ni cálculos de negocio — esa lógica vive en un hook custom
(`hooks/`), dejando el componente enfocado solo en JSX y presentación.

## Dominios principales

- **Trabajadores** — datos personales, EPS/ARL/pensión/banco/clínica (con
  historial de vigencia), edición completa desde la UI.
- **Centros de trabajo** — asignación de trabajadores, estadísticas de mano
  de obra por centro/mes.
- **Registros de trabajo diario** — creación individual y por lote, cálculo
  de horas normales/extras/dominicales, vista de calendario y consolidados.
- **Ausencias** — vacaciones, incapacidades y permisos.
- **Compensados** — tiempo libre pagado con horas de un banco de horas.
- **Horarios** — catálogo de horarios rotativos y asignación por trabajador.
- **Cursos y diagnósticos** — catálogos de apoyo para otros módulos.

## Configuración local

1. Clona el repo e instala dependencias:
   ```bash
   cd HorasExtras
   npm install
   ```
2. Crea un archivo `.env.local` en la raíz de `HorasExtras/` con la URL de
   tu backend local:
   ```
   VITE_API_URL=http://localhost:5117/api
   ```
   (ajusta el puerto al que use tu instancia de
   [AppHorasExtrasApi](https://github.com/granadillos0130/AppHorasExtrasApi))
3. Corre el servidor de desarrollo:
   ```bash
   npm run dev
   ```
4. Abre `http://localhost:5173`.

Necesitas el backend corriendo (con su propia base de datos configurada)
para que las llamadas a la API funcionen — este frontend no incluye datos
mock.

## Scripts

- `npm run dev` — servidor de desarrollo con hot reload
- `npm run build` — build de producción
- `npm run lint` — ESLint sobre todo el proyecto