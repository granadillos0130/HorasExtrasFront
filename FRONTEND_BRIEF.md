# Brief de Refactorización — HorasExtrasFront (React + TypeScript)

## Contexto
Frontend en React 19 + TypeScript + Vite para el sistema de gestión de horas
extra. Ya tiene buena estructura de carpetas (api/, components/, hooks/,
pages/, types/, utils/, styles/), pero hay archivos vacíos, código muerto,
un archivo accidental de git en la raíz, y páginas/componentes muy grandes
que probablemente mezclan lógica de negocio con presentación.

## Paso 0 — Limpieza inmediata (antes que nada)
- Borrar el archivo `et --hard b236f85` en la raíz del repo — es un output de
  `git log` guardado por accidente (probablemente un comando de git mal
  ejecutado que quedó comiteado). No tiene ninguna función.
- Confirmar (ya se verificó) que no hay referencias a la empresa original en
  ningún archivo .ts/.tsx/.json/.html — está limpio, solo hacer un grep final
  de verificación al terminar todo el refactor.

## Paso 1 — Archivos vacíos (decidir: completar o borrar)
Estos 4 archivos existen pero están vacíos (0 bytes) — probablemente quedaron
de un refactor anterior sin terminar o nunca se implementaron:
- src/hooks/useRegistros.ts
- src/hooks/useEstadisticas.ts
- src/constants/centros.ts
- src/utils/registros/registrosUtils.ts

Para cada uno: revisar si algo en el proyecto los importa (grep de imports).
Si nada los importa, borrarlos. Si algo los importa pero está vacío, avisar
en el reporte para decidir si hay que implementarlos o quitar la importación.

## Paso 2 — Inventario general (SOLO REPORTE, no modificar todavía)
Antes de refactorizar nada, haz un inventario igual al que hicimos en el
backend, cubriendo components/, pages/, hooks/, utils/, api/:

1. **Archivos/componentes grandes o que mezclan responsabilidades**
   — especialmente revisar los .tsx de más de 20-25K (varios ya se ven
   grandes: EditarRegistroPage.tsx ~40K, RegistrosForm.tsx y
   RegistrosLoteForm.tsx ~32K cada uno, TrabajadorAusenciasPage.tsx ~28K,
   RegistroCard.tsx ~24K). Para cada uno, identificar si mezcla:
   - Lógica de fetching/estado que debería estar en un hook custom
   - Lógica de cálculo/formato que debería estar en utils/
   - JSX puro de presentación
2. **Código muerto** — componentes, hooks, funciones exportadas, o archivos
   completos sin ningún import en el resto del proyecto.
3. **Duplicación real** — lógica repetida entre componentes similares
   (por ejemplo, si varios forms repiten la misma validación o el mismo
   patrón de manejo de fechas/horas).
4. **Tipado** — cualquier uso de `any` que se pueda tipar mejor, y cualquier
   inconsistencia entre los types/ definidos y lo que realmente devuelve
   la API (ya que el back cambió con el refactor de Fase 1 y 2 — confirmar
   que los DTOs del front siguen alineados con las respuestas reales del
   backend refactorizado).
5. **Estilos** — la carpeta styles/ (504K) es grande; reportar si hay CSS
   duplicado entre components/pages/shared que se pueda consolidar.

## Paso 3 — Refactor (después de que yo revise el inventario del Paso 2)
No ejecutes este paso todavía — dame el reporte del Paso 2 primero y yo
decido el orden de ataque, igual que hicimos con el backend.

## Reglas generales (igual que en el backend)
- No cambiar comportamiento observable de la UI sin que yo lo apruebe
  explícitamente — un refactor de estructura no debe cambiar cómo se ve
  o se comporta ninguna pantalla.
- Si encuentras algo que parece bug real (no solo desorden), documéntalo
  en el reporte en vez de corregirlo silenciosamente.
- Build limpio (`npm run build` o `tsc -b`) con 0 errores después de
  cualquier cambio que hagas.
- Ya estás parado en la branch `refactor/portafolio-cleanup` de ESTE repo
  (el frontend, HorasExtrasFront) — es una branch local e independiente de
  cualquier branch con el mismo nombre que exista en otros repos (como el
  backend, AppHorasExtrasApi). No necesitas crear ni cambiar de branch, y
  no necesitas acceder a ningún otro repo o carpeta para nada de este brief.
