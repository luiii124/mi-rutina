# Mi Rutina — Plan de construcción

Ocho fases, en orden. **No adelantar trabajo de fases posteriores.**

Al terminar cada fase: parar, resumir, esperar confirmación. El usuario prueba en el móvil
entre fases — a propósito, para descubrir en la fase 3 que algo no funciona en la mano, no al
final.

---

## Fase 0 — Esqueleto y PWA

**Objetivo:** icono en la pantalla de inicio del iPhone el primer día, aunque esté vacío.

- Vite + React + TypeScript `strict`
- Tailwind con los tokens de `DESIGN.md`
- `vite-plugin-pwa` con manifest, service worker e iconos (icono provisional negro con marca
  blanca)
- React Router `createHashRouter` con rutas vacías
- Layout base: fondo negro, ancho máx. 480 px, safe areas respetadas
- `navigator.storage.persist()` en el arranque
- Instrucciones en `README.md` para probar en el iPhone (ver abajo)

**Se da por buena cuando:** se instala desde Safari, abre a pantalla completa en negro desde el
icono, y sigue abriendo en modo avión.

---

## Fase 1 — Base de datos y copia de seguridad

**Objetivo:** que los datos no se puedan perder, antes que cualquier funcionalidad.

- Esquema Dexie completo según `DATA_MODEL.md`
- Siembra del catálogo base al primer arranque
- `domain/`: conversión de unidades, rango de repeticiones, PR, avance de variante (lógica
  pura)
- Tests Vitest de esas cuatro funciones
- Ajustes funcional: unidad, descanso por defecto, exportar/importar copia, borrar todo
- Pantalla temporal de depuración que vuelca el contenido de la BD

**Se da por buena cuando:** se pueden crear datos de prueba, exportar, borrar todo, importar y
recuperar exactamente lo mismo.

---

## Fase 2 — Rutinas, entrenos y ejercicios (estructura)

**Objetivo:** montar la rutina completa, sin entrenar todavía.

- Inicio con lista de rutinas
- Crear/editar/duplicar/archivar/eliminar rutinas, incluidas variantes
- Rutina: lista de entrenos + selector de variantes
- Crear/editar/duplicar/eliminar entrenos, con etiquetas de materiales
- Entreno: lista de ejercicios
- Buscador del catálogo (sin acentos) + creación de ejercicios propios
- Configurar ejercicio en el entreno: nota, series, rango de reps, descanso
- Reordenar entrenos y ejercicios arrastrando

**Se da por buena cuando:** el usuario reproduce su rutina real completa (dos variantes) sin
encontrar nada que no pueda expresar.

---

## Fase 3 — La sesión de entrenamiento

**Objetivo:** el corazón de la app, la pantalla que se usa en el gimnasio.

- "Empezar entreno" crea la sesión
- Pantalla de Ejercicio en sesión: cabecera, nota, tabla de series
- Precarga de la sesión anterior en gris, pasa a blanco al tocarla
- Reps fuera de rango en rojo
- Marcar serie/ejercicio completado
- Navegación Anterior/Siguiente ejercicio, con regla del primero y el último
- Añadir serie extra sobre la marcha
- "Terminar entreno", con pregunta por series sin revisar
- Reanudar sesión sin terminar
- Avance automático de variante al completar el ciclo

**Se da por buena cuando:** el usuario hace un entreno real de principio a fin sin mirar la
pantalla más de un segundo entre serie y serie.

---

## Fase 4 — Temporizador y notas

- Temporizador de descanso: +30 s, saltar, pausar
- Tono corto al terminar el descanso, generado por la app (sin vibración: decisión explícita
  del usuario). Una PWA no puede pausar audio de otras apps
- Descanso por ejercicio, con el valor de Ajustes como respaldo
- Nota de sesión
- El temporizador debe seguir bien en segundo plano: guardar el instante de inicio y calcular
  la diferencia al volver, **no** confiar en `setInterval`

**Se da por buena cuando:** bloquear el móvil 40 s en mitad de un descanso y al desbloquear el
tiempo restante es correcto.

---

## Fase 5 — Historial, PR y gráficas

- Caché de `PersonalRecord` y su recálculo
- Badge de PR en la pantalla del ejercicio, iluminado al batir un PR
- Historial del ejercicio: gráfica de líneas, selector de rutina, selector de periodo, lista de
  sesiones
- Editar una sesión pasada, con recálculo del PR

**Se da por buena cuando:** tras varias sesiones la gráfica muestra la progresión correcta, y
corregir un peso mal anotado actualiza el PR sin dejar rastro incoherente.

---

## Fase 6 — Fotos

Va después del historial a propósito: es lo que más puede romper el almacenamiento, mejor con
el resto ya funcionando.

- Añadir foto a un ejercicio (cámara o galería)
- Compresión obligatoria a 1280 px, calidad 0,75
- Miniatura en lista + visor a pantalla completa
- Liberar URLs de objeto al desmontar
- Ajustes → almacenamiento: espacio usado, recompresión de fotos antiguas

**Se da por buena cuando:** con 30 fotos la BD ocupa menos de 10 MB y no se ralentiza al abrir
un entreno.

---

## Fase 7 — Mi progreso

- Añadir/editar registros corporales
- Gráficas de peso corporal y % de grasa, separadas
- Marcas de inicio/fin de rutina sobre la gráfica
- Fotos corporales, varias por registro
- Comparador de dos registros lado a lado

**Se da por buena cuando:** con seis registros en tres meses la evolución se lee de un vistazo
y el comparador funciona con fotos de distinta orientación.

---

## Fase 8 — Pulido

- Repasar toda la app contra "Qué hace fea esta app" (`DESIGN.md`)
- Estados vacíos de todas las pantallas
- Icono definitivo
- Tamaños táctiles de 44 px
- `prefers-reduced-motion`
- Aviso de copia de seguridad pendiente a los 30 días
- Recorrido completo en el iPhone real: crear rutina, entrenar tres veces, ver gráfica,
  exportar copia, borrar todo, importar copia

---

## Cómo probarlo en el iPhone durante el desarrollo

1. PC: `npm run dev -- --host`
2. Vite muestra una dirección de red tipo `http://192.168.1.42:5173`
3. iPhone en la misma wifi que el PC
4. Abrir esa dirección en Safari del iPhone
5. Compartir → "Añadir a pantalla de inicio"

**Aviso:** el service worker necesita HTTPS o `localhost`. Por red local en desarrollo la app
funciona pero el modo sin conexión no — para probarlo de verdad hay que desplegar.

**Despliegue** (gratis, necesario desde la Fase 0): repo en GitHub conectado a Netlify o
Vercel. Cada `git push` publica una versión nueva con HTTPS, ahí sí funciona todo. Esa es la
dirección que va en la pantalla de inicio de forma permanente.

---

## Fuera del alcance de la v1

No construir. Si el usuario lo pide, recordarle que está en esta lista.

Superseries y series descendentes · RPE/RIR/tiempo bajo tensión · Plantillas de rutinas
prehechas · Cardio, pasos, calorías · Compartir rutinas · Integración con Apple Health · Apple
Watch · 1RM estimado · Sincronización en la nube · Modo claro · Varios idiomas

---

## Ideas surgidas durante el desarrollo

Claude Code: apunta aquí cualquier idea que surja mientras construyes, en vez de
implementarla.

- (vacío)
