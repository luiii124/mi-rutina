# Mi Rutina — Plan de construcción

Ocho fases, en orden. **No adelantes trabajo de fases posteriores.**

Al terminar cada fase: para, resume qué has hecho y espera confirmación. El usuario prueba en
el móvil entre fase y fase. Es a propósito: descubrir en la fase 3 que algo no funciona en la
mano es infinitamente mejor que descubrirlo al final.

---

## Fase 0 — Esqueleto y PWA

**Objetivo:** que el usuario tenga el icono en la pantalla de inicio de su iPhone el primer día.
Aunque dentro no haya nada.

- Proyecto Vite + React + TypeScript en modo `strict`
- Tailwind con los tokens de `DESIGN.md` en `tailwind.config.js`
- `vite-plugin-pwa` con manifest, service worker e iconos (genera un icono provisional negro
  con una marca blanca)
- React Router con `createHashRouter` y las rutas vacías
- Layout base: fondo negro, ancho máximo 480 px, safe areas respetadas
- Llamada a `navigator.storage.persist()` en el arranque
- Instrucciones en el `README.md` para probarlo en el iPhone (ver más abajo)

**Se da por buena cuando:** el usuario abre la app en Safari desde su móvil, la añade a la
pantalla de inicio, la abre desde el icono, la ve a pantalla completa y en negro, y sigue
abriendo en modo avión.

---

## Fase 1 — Base de datos y copia de seguridad

**Objetivo:** que los datos no se puedan perder. Antes que ninguna funcionalidad.

- Esquema Dexie completo según `DATA_MODEL.md`
- Siembra del catálogo base de ejercicios en el primer arranque
- Módulo `domain/` con la lógica pura: conversión de unidades, rango de repeticiones, PR,
  avance de variante
- Tests de Vitest de esas cuatro funciones
- Pantalla de **Ajustes** funcional: unidad, descanso por defecto, exportar copia, importar
  copia, borrar todo
- Una pantalla temporal de depuración que vuelque el contenido de la base de datos

**Se da por buena cuando:** se pueden crear datos de prueba, exportarlos a un archivo,
borrarlo todo, importar el archivo y comprobar que vuelve exactamente lo mismo.

---

## Fase 2 — Rutinas, entrenos y ejercicios (estructura)

**Objetivo:** poder montar la rutina completa. Sin entrenar todavía.

- Pantalla de **Inicio** con la lista de rutinas
- Crear, editar, duplicar, archivar y eliminar rutinas, incluidas las variantes
- Pantalla de **Rutina** con la lista de entrenos y el selector de variantes
- Crear, editar, duplicar y eliminar entrenos, con las etiquetas de materiales
- Pantalla de **Entreno** con la lista de ejercicios
- **Buscador del catálogo** con búsqueda sin acentos y creación de ejercicios propios
- Configurar el ejercicio en el entreno: nota, series, rango de repeticiones, descanso
- Reordenar entrenos y ejercicios arrastrando

**Se da por buena cuando:** el usuario reproduce su rutina real completa, con sus dos
variantes, sin encontrar nada que no pueda expresar.

---

## Fase 3 — La sesión de entrenamiento

**Objetivo:** el corazón de la app. La pantalla que se usa en el gimnasio.

- "Empezar entreno" crea la sesión
- Pantalla de **Ejercicio en sesión** completa: cabecera, nota, tabla de series
- Precarga de la sesión anterior en gris, que pasa a blanco al tocarla
- Repeticiones fuera de rango en rojo
- Marcar serie completada y ejercicio completado
- Navegación "Anterior / Siguiente ejercicio", con la regla del primero y el último
- Añadir una serie extra sobre la marcha
- "Terminar entreno", con la pregunta por las series sin revisar
- Reanudar una sesión sin terminar
- Avance automático de variante al completar el ciclo

**Se da por buena cuando:** el usuario hace un entreno real de principio a fin sin tener que
mirar la pantalla más de un segundo entre serie y serie.

---

## Fase 4 — Temporizador y notas

- Barra del temporizador de descanso, con +30 s, saltar y pausar
- Vibración al terminar el descanso
- Descanso por ejercicio, con el valor por defecto de Ajustes como respaldo
- Nota de sesión
- El temporizador debe seguir contando bien si la app pasa a segundo plano: guarda el instante
  de inicio y calcula la diferencia al volver, **no** confíes en un `setInterval`

**Se da por buena cuando:** el usuario bloquea el móvil 40 segundos en mitad de un descanso, lo
desbloquea y el tiempo restante es el correcto.

---

## Fase 5 — Historial, PR y gráficas

- Caché de `PersonalRecord` y su recálculo
- Badge de PR en la pantalla del ejercicio
- Iluminación del badge al batir un PR
- Pantalla de **Historial del ejercicio**: gráfica de líneas, selector de rutina, selector de
  periodo, lista de sesiones
- Editar una sesión pasada, con recálculo del PR

**Se da por buena cuando:** tras varias sesiones la gráfica muestra la progresión correcta, y
corregir un peso mal anotado actualiza el PR sin dejar rastro incoherente.

---

## Fase 6 — Fotos

Va después del historial a propósito: es la parte que más puede romper el almacenamiento, y
conviene meterla cuando el resto ya funciona.

- Añadir foto a un ejercicio, con cámara o galería
- Compresión obligatoria a 1280 px y calidad 0,75
- Miniatura en la lista y visor a pantalla completa
- Liberación de las URL de objeto al desmontar
- Pantalla de almacenamiento en Ajustes: espacio usado y recompresión de fotos antiguas

**Se da por buena cuando:** con 30 fotos de ejercicios la base de datos ocupa menos de 10 MB y
la app no se ralentiza al abrir un entreno.

---

## Fase 7 — Mi progreso

- Añadir y editar registros corporales
- Gráficas de peso corporal y de porcentaje de grasa, separadas
- Marcas de inicio y fin de rutina sobre la gráfica
- Fotos corporales, con varias por registro
- Comparador de dos registros lado a lado

**Se da por buena cuando:** con seis registros repartidos en tres meses la evolución se lee de
un vistazo y el comparador funciona con fotos de distinta orientación.

---

## Fase 8 — Pulido

- Repasar toda la app contra la lista "Qué hace fea esta app" de `DESIGN.md`
- Estados vacíos de todas las pantallas
- Icono definitivo
- Comprobar los tamaños táctiles de 44 px
- Comprobar `prefers-reduced-motion`
- Aviso de copia de seguridad pendiente a los 30 días
- Recorrido completo en el iPhone real: crear rutina, entrenar tres veces, ver gráfica, exportar
  copia, borrar todo, importar copia

---

## Cómo probarlo en el iPhone durante el desarrollo

1. En el PC: `npm run dev -- --host`
2. Vite muestra una dirección de red del tipo `http://192.168.1.42:5173`
3. El iPhone debe estar en la misma red wifi que el PC
4. Abrir esa dirección en Safari del iPhone
5. Botón de compartir → "Añadir a pantalla de inicio"

**Aviso importante:** el service worker de una PWA necesita HTTPS o `localhost`. Con la
dirección de red en desarrollo, la app funciona pero **el modo sin conexión no**. Para probar
el funcionamiento offline de verdad hay que desplegarla.

**Despliegue** (gratis, y necesario a partir de la Fase 0): subir el repositorio a GitHub y
conectarlo a Netlify o Vercel. Cada `git push` publica una versión nueva con HTTPS, y ahí sí
funciona todo. Esa es la dirección que el usuario debe añadir a su pantalla de inicio de forma
permanente.

---

## Fuera del alcance de la v1

No lo construyas. Si el usuario lo pide, recuérdale que está en esta lista.

- Superseries y series descendentes
- RPE, RIR, tiempo bajo tensión
- Plantillas de rutinas prehechas
- Cardio, pasos, calorías
- Compartir rutinas con otras personas
- Integración con Apple Health
- Apple Watch
- 1RM estimado
- Sincronización en la nube
- Modo claro
- Varios idiomas

---

## Ideas surgidas durante el desarrollo

Claude Code: apunta aquí cualquier idea que se te ocurra mientras construyes, en lugar de
implementarla.

- (vacío)
