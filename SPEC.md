# Mi Rutina — Especificación funcional

Pantalla a pantalla, con reglas y casos límite. Si una pantalla no está aquí, no existe.

## Vocabulario

Usar siempre estos términos, en código e interfaz, sin mezclarlos.

| Término | Significa |
|---|---|
| **Rutina** | Plan de entrenamiento completo. Ej: "Upper/Lower 2024" |
| **Variante** | Versión de la rutina que se alterna por semanas (semana A/B) |
| **Entreno** | Un día de la rutina. Ej: "Espalda", "Pierna" |
| **Ejercicio** | Movimiento del catálogo global. Ej: "Press banca" |
| **Ejercicio del entreno** | Ese ejercicio dentro de un entreno, con su nota/series/rango |
| **Serie** | Fila: peso + repeticiones |
| **Sesión** | Entreno realizado un día concreto, con los datos registrados |
| **PR** | Peso más alto levantado en un ejercicio, en toda la historia |

---

## Mapa de navegación

```
Inicio (lista de rutinas)
├── Ajustes
├── Mi progreso
│   └── Detalle de registro corporal
└── Rutina
    ├── Editar rutina (nombre, variantes, orden de entrenos)
    └── Entreno
        ├── Editar entreno (nombre, materiales, orden de ejercicios)
        ├── Ejercicio en sesión  ← pantalla principal de uso
        │   └── Historial del ejercicio (gráfica)
        └── Añadir ejercicio (buscador del catálogo)
```

---

## 1. Inicio

- Título "Mi Rutina", botón **"Nueva rutina"**.
- Lista de rutinas: nombre grande; debajo en gris "Creada el 12 mar 2026 · Última sesión hace
  2 días"; si tiene variantes, etiqueta discreta con la actual ("Semana A").
- Abajo: accesos a **Mi progreso** y **Ajustes**.

**Reglas:**

- Sin rutinas → texto centrado "Todavía no tienes ninguna rutina" + botón crear.
- Orden: por fecha de última sesión (más reciente arriba); nunca usadas al final por fecha de
  creación.
- Deslizar tarjeta → **Duplicar**, **Terminar rutina**, **Eliminar**.
- **Terminar rutina** = archivar: baja al final, nombre en gris, no se pueden empezar entrenos
  hasta reactivar. Historial y gráficas intactos. Es lo correcto al cambiar de rutina; eliminar
  es para deshacer un error.
- Rutina archivada: el swipe ya no muestra "Terminar rutina", muestra **Reactivar** (+
  Eliminar). Reactivar la reordena por fecha y permite entrenar de nuevo. En vez de "Creada
  el... · Última sesión...", muestra "Terminada el 12 mar 2026".
- Eliminar pide confirmación, avisa que borra el historial de sesiones. **Los PR no se ven
  afectados** (son universales); si un PR dependía solo de la rutina eliminada, se recalcula y
  puede bajar o desaparecer — explicarlo en el diálogo.

---

## 2. Nueva rutina / Editar rutina

**Campos:**

- **Nombre** (obligatorio).
- **Variantes**: `Sin variantes` (por defecto) / `2` / `3` / `4` semanas. Texto de ayuda: "Tu
  rutina alternará entre 2 versiones distintas, una cada semana." Elegir un número crea las
  variantes A/B/C/D automáticamente, renombrables.

**Al cambiar el número de variantes en una rutina existente:**

- **Aumentar** (2→3): la nueva variante nace vacía, con botón "Copiar entrenos de la
  variante A".
- **Reducir** (3→2): confirmación explícita. Se borran los entrenos de la variante eliminada;
  **las sesiones históricas de esa variante se conservan** en las gráficas, solo dejan de
  poder realizarse.
- **A "Sin variantes"**: se conserva la variante A, se descartan las demás (misma regla).

Al guardar una rutina nueva → pantalla de Rutina en estado vacío, invitando a crear el primer
entreno.

---

## 3. Rutina

**Cabecera:**

- Nombre de la rutina.
- Si tiene variantes: selector de segmentos (A/B/...), activa resaltada. Debajo, gris:
  "Variante sugerida: B"; si el usuario la cambió a mano, "Has cambiado la variante a mano ·
  Volver a la sugerida" (parte final pulsable).
- Gris: "Creada el 12 mar 2026".

**Lista de entrenos** (de la variante seleccionada, orden del usuario). Cada tarjeta: nombre
grande; debajo en gris los **materiales** ("Straps · Cinturón"); a la derecha "hace 3 días"
(última sesión de ese entreno) o "Nunca"; si la última sesión quedó a medias, "Sesión sin
terminar".

**Acciones:** botón **"Nuevo entreno"** al final; botón **"Reordenar"** en cabecera
(drag&drop); deslizar entreno → **Duplicar** (pregunta a qué variante si hay más de una) y
**Eliminar**.

Pulsar un entreno → pantalla de Entreno.

---

## 4. Nuevo entreno / Editar entreno

**Campos:**

- **Nombre** (obligatorio). Ej: "Espalda".
- **Materiales** (opcional): etiquetas — escribir + intro añade, con x para quitar. Sugiere
  materiales usados antes.
- **Variante**: visible solo si la rutina tiene variantes.

---

## 5. Entreno

**Cabecera:** nombre; materiales en gris; "Actualizado el 28 jul 2026" (última vez que cambió
la **estructura**: ejercicios/series/notas, no la última sesión) + "Última sesión: 30 jul
2026". Si la última sesión completada tenía nota, tarjeta "Notas de la última sesión" debajo.
Solo se ve la nota de la sesión más reciente: si esa sesión no tuvo nota, no se muestra nada
(no hay que ir a buscar notas de sesiones más antiguas).

**Lista de ejercicios**, en orden: nº + nombre; debajo gris "4 series · 8-12 reps"; miniatura
de foto a la derecha si existe.

**Acciones:**

- Botón principal **"Empezar entreno"** → crea sesión y abre el primer ejercicio. Si ya hay una
  sesión de hoy sin terminar, dice **"Continuar entreno"** y retoma donde se quedó.
- **"Añadir ejercicio"** al final de la lista.
- **"Reordenar"** en cabecera.
- Deslizar ejercicio → **Quitar del entreno** (aclarar que no se borra del catálogo ni pierde
  historial).

**Regla:** se puede abrir un ejercicio sin "Empezar entreno" → modo consulta/edición de
plantilla, no sesión. Diferencia obvia: en sesión la barra inferior dice "Siguiente
ejercicio"; en plantilla, "Editar ejercicio".

---

## 6. Añadir ejercicio (buscador del catálogo)

- Campo de búsqueda arriba, con foco y teclado abiertos.
- Resultados: nombre + grupo muscular en gris. Los creados por el usuario llevan marca
  discreta ("Mío"). Si ya se ha entrenado: "PR 100 kg × 5" debajo del nombre.
- Al final, siempre: **"Crear ejercicio nuevo: «<lo escrito>»"**.

**Reglas:**

- Búsqueda insensible a mayúsculas/acentos ("press banca" encuentra "Press Banca").
- Orden: primero los ya usados (por frecuencia), luego el resto.
- Al seleccionar → formulario de **configuración en este entreno** (sección 7). Nunca se añade
  sin configurar.
- Si el nombre casi coincide con uno existente: aviso "Ya existe «Press banca». ¿Querías ese?"
  antes de crear duplicado.

---

## 7. Configurar ejercicio en el entreno

Se abre al añadir o al editar.

- **Nombre** — editable solo si es ejercicio propio. Los del catálogo base ofrecen "Crear una
  copia con otro nombre" en vez de renombrar.
- **Foto** (opcional) — "Añadir foto" → Hacer foto / Elegir de galería. Es del ejercicio, no
  del entreno: cambiarla afecta a todas las rutinas. Reglas de compresión en `DATA_MODEL.md`.
- **Nota** (opcional, multilínea) — propia de este entreno. Placeholder: "Ej. Banco en el 3,
  agarre justo fuera de los hombros". Se muestra bajo el nombre en sesión.
- **Series** — número 1-10, por defecto 3.
- **Rango de repeticiones** (opcional) — mín/máx. Solo uno relleno = valor exacto (mín=máx).
  Vacío = sin control, reps nunca en rojo.
- **Descanso** (opcional) — segundos entre series, por defecto 90. Selector rápido 60/90/120/180
  + valor libre.

---

## 8. Ejercicio en sesión — **la pantalla más importante**

Donde el usuario pasa el 90% del tiempo, de pie, un pulgar, sudando. Sin precisión.

**De arriba abajo:**

1. **Cabecera fija**: izq. "← Anterior" (si no es el primero) + "Ejercicio 3 de 6" en gris;
   der. "Salir" (vuelve al entreno sin terminar la sesión). Debajo, **nombre del ejercicio**
   grande.
2. **Badge de PR** (si existe): "PR 112,5 kg × 3", pulsable, abre el historial.
3. **Foto** (si existe): miniatura ancha y baja, pulsable a pantalla completa.
4. **Nota** (si existe): gris, hasta 3 líneas, "ver más" si es larga.
5. **Serie actual** — elemento central, **una sola serie a la vez** en tarjeta (no tabla):
   - Cabecera: "Serie 2" +, si hay rango, "Objetivo: 8-12 reps".
   - Dos campos numéricos grandes lado a lado: **Peso** (kg/lb según unidad) y **Reps**
     (`inputmode="decimal"`/`"numeric"`).
   - Precargados en **gris** con el valor de la sesión anterior; al tocarlos pasan a
     **blanco** y cuentan como propios de esta sesión.
   - Reps fuera de rango en **rojo**, por encima o por debajo. Solo cambia el color del número.
   - Bajo la tarjeta: enlace "Añadir serie" para una extra sobre la marcha (no toca la
     plantilla; "Guardar también en la rutina" la hace permanente). **Solo visible en la
     última serie.**
6. **Barra inferior de tres botones** (respeta safe area):
   - **Descanso** — marca la serie hecha y arranca cuenta atrás (descanso del ejercicio o el
     de Ajustes por defecto). Al llegar a cero, pasa sola a la siguiente serie.
   - **Siguiente serie** — marca hecha y avanza sin esperar (para quien no usa temporizador).
   - **Siguiente ejercicio** — avanza sin esperar. En el último ejercicio de la sesión es
     **"Terminar entreno"** (destacado en blanco cuando todas las series están marcadas).

   Durante el descanso, la tarjeta de serie se sustituye por el contador grande ("01:23") +
   **+30 s**, **pausar/reanudar**, **saltar**. Al llegar a cero suena un tono corto generado
   por la app (sin vibración). Una PWA no puede pausar ni silenciar audio de otra app en
   segundo plano — limitación del navegador, no decisión de diseño.
7. **Nota de sesión**: enlace "Añadir nota de hoy" (nota de la sesión completa, no del
   ejercicio).

**Guardado:**

- Todo se guarda automáticamente al salir de cada campo. Nunca hay botón "guardar".
- Precargados en gris → blanco al tocarlos, cuentan como propios.
- Si se termina el entreno con series en gris sin tocar, **se guardan igual con el valor
  precargado** (lo normal es repetir peso). Pero si al pulsar "Terminar entreno" hay más de la
  mitad sin revisar, pregunta: "Hay 8 series que no has revisado. ¿Las guardo tal cual o las
  descarto?". **Guardar**: cuentan para PR y gráfica como cualquier otra. **Descartar**: borra
  solo esas series concretas.
- Serie **hecha** = pulsar "Descanso" o "Siguiente serie" sobre ella (no hay casilla aparte).
  Ejercicio **completado** = todas sus series hechas.
- Todos los ejercicios completados → entreno se marca completo solo, "Terminar entreno" pasa a
  estado destacado.

**Casos límite:**

- App cerrada a mitad de sesión → al reabrir el entreno, botón dice "Continuar entreno",
  retoma en el ejercicio donde estaba.
- Sesión sin terminar de +24h → al abrir la rutina, pregunta una vez: "Tienes un entreno de
  espalda sin terminar del martes. ¿Lo doy por terminado o lo descarto?". **Terminado**: guarda
  con las series que tenga (precargadas sin revisar incluidas), cuentan para PR/gráficas.
  **Descartar**: borra la sesión entera.
- Cambio de unidad kg↔lb a mitad de sesión: valores ya introducidos se convierten y redondean
  a 0,5 lb en pantalla. Los datos guardados no cambian.

---

## 9. Historial del ejercicio

Desde el badge de PR o un botón en la pantalla del ejercicio.

- Nombre del ejercicio arriba.
- **PR** destacado: "112,5 kg × 3" + fecha y rutina donde se logró, en gris.
- **Gráfica de líneas**: eje X fechas de sesión, eje Y peso máximo de ese ejercicio en esa
  sesión. Línea blanca fina, puntos pequeños; al pulsar un punto, etiqueta con fecha/peso/reps.
  Cuadrícula tenue, sin leyenda ni colores.
- **Selector de rutina** sobre la gráfica: por defecto la rutina de origen; desplegable para
  otras rutinas donde aparece el ejercicio. Las gráficas **no se mezclan** entre rutinas.
- **Lista de sesiones** debajo (más reciente primero): fecha + series en línea compacta
  "80×10 · 80×9 · 75×8"; nota de la sesión en gris debajo si existe.
- Cada fila es pulsable → **editar una sesión pasada** (peso mal anotado). Editar recalcula el
  PR.

**Casos límite:**

- Menos de 2 sesiones → sin gráfica: "Necesitas al menos dos sesiones para ver la progresión" +
  lista directamente.
- Muchas sesiones → gráfica muestra por defecto los últimos 6 meses, selector 3m/6m/1a/Todo.

---

## 10. Mi progreso

Sección global, independiente de las rutinas.

- Botón **"Añadir registro"** arriba.
- **Gráfica de peso corporal**: eje X fechas, eje Y kg. Si hay % de grasa, segunda gráfica
  debajo (nunca superpuesta).
- Sobre la gráfica: marcas verticales tenues en inicio/fin de cada rutina, con nombre pequeño.
- **Lista de registros** por fecha (más reciente primero): fecha, peso, % grasa, miniaturas de
  fotos.
- Botón **"Comparar fotos"**: elige dos registros, los muestra lado a lado.

**Formulario de registro:** Fecha (hoy por defecto), Peso corporal (opcional), % de grasa
(opcional), Fotos (opcional, varias, cámara o galería), Nota (opcional).

**Reglas:**

- Todos los campos opcionales, pero no se guarda un registro totalmente vacío.
- Un registro por día: si ya existe, se edita en vez de crear otro.
- Fotos corporales nunca se suben a ningún sitio, ni aparecen fuera de esta sección.

---

## 11. Ajustes

- **Unidad de peso** kg/lb. Aviso: "Solo cambia cómo se muestran los pesos. Tu historial no se
  altera."
- **Descanso por defecto**: segundos para ejercicios nuevos.
- **Copia de seguridad**:
  - **"Exportar copia"** → genera `mi-rutina-2026-08-01.json` y abre el diálogo de compartir
    de iOS (Archivos/iCloud Drive).
  - **"Importar copia"** → selecciona archivo, **sustituye** todos los datos, con doble
    confirmación y resumen previo ("Este archivo contiene 3 rutinas y 142 sesiones, del 12 mar
    al 30 jul").
  - "Última copia: hace 45 días" — en rojo si pasan de 30 días.
- **Almacenamiento**: espacio usado, nº de fotos, botón "Liberar espacio" (recomprimir fotos
  antiguas).
- **Borrar todos los datos**: aviso + Cancelar/Confirmar.
- Versión de la app al pie.

---

## Comportamientos generales

- Ningún dato se pierde por navegar — salir de una pantalla guarda lo escrito.
- Toda acción destructiva pide confirmación y explica qué se pierde.
- Sin animaciones largas: 150-200 ms como mucho.
- Arranque en menos de un segundo desde el icono, incluso sin red.
- `navigator.vibrate(10)` al marcar una serie. En ningún sitio más — al terminar el descanso
  suena un tono, sin vibración (ver sección 8).
- Accesibilidad mínima: todo elemento pulsable ≥44×44 px; campos numéricos abren el teclado
  correcto.
