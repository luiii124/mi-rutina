# Mi Rutina — Contexto del proyecto

Fuente de verdad permanente. Léelo entero antes de tocar código. Si contradice a otro
documento, gana este archivo.

---

## Qué es

App de entrenamiento personal para gimnasio: rutinas → entrenos (torso, espalda, pierna...) →
ejercicios. En sesión se anota peso y reps de cada serie. Guarda todo el historial para
gráficas de progresión y PR por ejercicio.

Un solo usuario, sin cuentas, sin servidor, sin internet.

---

## Formato: PWA instalable

Se construye como **Progressive Web App**: web que el usuario añade a la pantalla de inicio
del iPhone desde Safari y se comporta como app nativa (icono propio, pantalla completa, sin
internet). Motivo: el usuario desarrolla en Windows, no tiene Mac, no puede compilar iOS
nativo — la PWA es la única vía instalable sin Mac ni coste.

**Implicaciones permanentes:**

- Dispositivo objetivo: **iPhone/Safari en modo standalone**, pensado para 390×844 px. No
  optimizar para escritorio, pero no romper en pantallas anchas (centrado, máx. 480 px).
- 100% funcional **sin internet** tras la primera carga.
- **Cero dependencias de red en runtime**: nada de Google Fonts, CDNs, APIs externas,
  analytics, telemetría. Todo empaquetado.
- Respetar *safe areas* de iOS (`env(safe-area-inset-*)`), sobre todo abajo (barra del
  ejercicio).

---

## Stack

| Pieza | Elección | Por qué |
|---|---|---|
| Build | Vite | Rápido, config mínima, soporte PWA maduro |
| Lenguaje | TypeScript `strict` | Modelo de datos con muchas relaciones; sin tipos se rompe |
| UI | React 18 | |
| Estilos | Tailwind CSS | Paleta/espaciado consistentes |
| Rutas | React Router (`createHashRouter`) | Evita problemas de rutas en standalone y hosting estático |
| BD | Dexie.js sobre IndexedDB | Blobs de fotos + consultas de historial por ejercicio |
| Gráficas | Recharts | Integración con React, suficiente para líneas |
| PWA | `vite-plugin-pwa` (Workbox) | Manifest + service worker |
| Reordenar | `@dnd-kit/core` + `@dnd-kit/sortable` | Drag&drop de entrenos/ejercicios, sin red |
| Tests | Vitest | Solo lógica pura |

No añadir librerías fuera de esta lista sin justificar. En concreto: nada de estado global
(Redux/Zustand/Jotai) — Dexie + `useLiveQuery` ya da reactividad y basta.

---

## Decisiones cerradas — no replantear ni proponer alternativas

1. **Solo modo oscuro**: negro/blanco/grises. Único color de la app: rojo, solo para reps
   fuera de rango.
2. **Reps fuera de rango en rojo por arriba y por abajo** (rango 8-12 → 6 y 14 ambos rojos).
   Aislado en una función (ver `RIESGOS.md`) para poder cambiarlo fácil.
3. **Unidad global** kg/lb en Ajustes. Se **almacena siempre en kg**; conversión solo al
   mostrar/introducir.
4. **PR = peso más alto jamás levantado** en ese ejercicio, con sus reps ("112,5 kg × 3").
   **Universal**: sobre todas las rutinas y sesiones.
5. **Gráficas separadas por rutina**. Eje X: fechas de sesión. Eje Y: peso máximo de ese
   ejercicio en esa sesión.
6. **Ejercicios compartidos entre rutinas** (nombre, foto, PR, historial), pero **nota, nº de
   series y rango de reps son propios de cada rutina**.
7. **Medidas corporales (peso, % grasa, fotos) son globales**, en "Mi progreso", no cuelgan de
   ninguna rutina.
8. **Ejercicio en sesión precarga la última sesión** en gris; el usuario sobrescribe.
9. **Variantes avanzan automáticamente**, corregible a mano desde la cabecera de rutina.
10. **En la v1**: temporizador de descanso, notas rápidas de sesión, marcar ejercicio
    completado (entreno se marca solo cuando todos lo están).

---

## Reglas de trabajo

- **Antes de cada fase**: leer `ROADMAP.md`, confirmar la fase actual. Construir en **orden**,
  sin adelantar trabajo de fases posteriores.
- **Al terminar cada fase**: parar, resumir, esperar confirmación — el usuario prueba en el
  móvil entre fases.
- **Si algo no está especificado**: preguntar antes de inventar (mejor una pregunta que rehacer
  trabajo). Decisiones menores de implementación (nombre de variable, estructura de carpeta):
  decidir y seguir.
- **Tests** (Vitest, solo lógica pura y crítica): conversión kg↔lb, cálculo de PR, detección de
  reps fuera de rango, avance automático de variante. Nada de tests de componentes ni e2e.
- **Commits**: uno por unidad coherente, mensaje en español, imperativo y corto (ej. "Añade
  temporizador de descanso configurable por ejercicio").

---

## Qué NO hacer

- Login, registro, cuentas, nada que requiera servidor.
- Sincronización en la nube, backend, BD remota.
- Anuncios, suscripciones, paywalls, analítica.
- Funciones "estaría bien tener" fuera de `SPEC.md` — anotarlas en la lista de ideas al final
  de `ROADMAP.md` y seguir.
- `localStorage` para datos de entrenamiento (solo IndexedDB/Dexie; `localStorage` solo para
  preferencias triviales de UI si hiciera falta).
- Convertir pesos a libras en la base de datos — siempre en kg.
- Borrar/sobrescribir sesiones históricas — inmutables salvo edición explícita del usuario.
- Emojis en la interfaz.

---

## Riesgo crítico permanente

iOS Safari **puede borrar los datos de una PWA** si no se abre durante semanas. No es
hipotético. Mitigaciones obligatorias (Fase 1):

1. `navigator.storage.persist()` en el primer arranque.
2. Exportar/importar copia de seguridad en JSON (fotos incluidas en base64), guardable en
   Archivos/iCloud Drive.

Pasados 30 días sin copia, Ajustes muestra un aviso discreto (sin popups agresivos).

---

## Estructura de archivos sugerida

```
src/
  db/           esquema Dexie, migraciones, semillas del catálogo
  domain/       lógica pura: PR, rangos, variantes, conversión de unidades
  hooks/        hooks de datos sobre Dexie
  components/   componentes reutilizables (botón, campo, tabla de series...)
  screens/      una carpeta por pantalla
  styles/       tokens de Tailwind y globales
  pwa/          manifest, iconos, registro del service worker
```

`domain/` no importa React ni Dexie: lógica pura y testeable.

---

## Documentos del proyecto

- `SPEC.md` — qué hace la app, pantalla a pantalla, reglas y casos límite
- `DATA_MODEL.md` — entidades, campos, relaciones, algoritmos
- `DESIGN.md` — paleta, tipografía, espaciado, componentes
- `ROADMAP.md` — fases en orden con criterios de aceptación
- `RIESGOS.md` — decisiones discutibles y alternativas
- `DESARROLLO.md` — cuándo desplegar a Netlify, cómo probar en local con HTTPS, cómo prefiere
  trabajar el usuario. Léelo antes de `git push`
