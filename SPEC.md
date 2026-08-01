# Mi Rutina — Especificación funcional

Pantalla a pantalla, con reglas y casos límite. Si una pantalla no está aquí, no existe.

## Vocabulario

Usa siempre estos términos, en el código y en la interfaz. No los mezcles.

| Término | Significa |
|---|---|
| **Rutina** | Un plan de entrenamiento completo. Ej: "Upper/Lower 2024" |
| **Variante** | Una versión de la rutina que se alterna por semanas. Ej: semana A / semana B |
| **Entreno** | Un día de la rutina. Ej: "Espalda", "Pierna" |
| **Ejercicio** | Un movimiento del catálogo global. Ej: "Press banca" |
| **Ejercicio del entreno** | Ese ejercicio dentro de un entreno concreto, con su nota, series y rango |
| **Serie** | Una fila de la tabla: peso + repeticiones |
| **Sesión** | Un entreno realizado un día concreto, con los datos registrados |
| **PR** | El peso más alto levantado en un ejercicio, en toda la historia |

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

Lo primero que ve el usuario al abrir la app.

**Contenido:**

- Título "Mi Rutina" arriba.
- Botón grande **"Nueva rutina"**.
- Lista de rutinas existentes. Cada tarjeta muestra:
  - Nombre de la rutina (grande)
  - Debajo, en gris pequeño: "Creada el 12 mar 2026 · Última sesión hace 2 días"
  - Si la rutina tiene variantes: una etiqueta discreta con la variante actual ("Semana A")
- Abajo, dos accesos secundarios: **Mi progreso** y **Ajustes**.

**Reglas:**

- Si no hay ninguna rutina, la lista se sustituye por un texto centrado: "Todavía no tienes
  ninguna rutina" y el botón de crear.
- Las rutinas se ordenan por fecha de última sesión, la más reciente arriba. Las que nunca se
  han usado van al final, ordenadas por fecha de creación.
- Deslizar una tarjeta hacia la izquierda revela **Duplicar**, **Terminar rutina** y
  **Eliminar**.
- **Terminar rutina** la archiva: baja al final de la lista, se muestra con el nombre en gris y
  ya no se pueden empezar entrenos desde ella hasta reactivarla. Su historial y sus gráficas se
  conservan enteros. Es lo que hay que usar al cambiar de rutina; eliminar es para deshacer un
  error.
- En una rutina archivada, deslizar la tarjeta hacia la izquierda ya no muestra "Terminar
  rutina": en su lugar muestra **Reactivar** (y Eliminar). Reactivar la sube de nuevo a su
  posición según fecha de última sesión y vuelve a permitir empezar entrenos desde ella.
- Eliminar una rutina pide confirmación y advierte de que se borrará también su historial de
  sesiones. **Los PR no se ven afectados**: se conservan porque son universales y su origen
  puede estar en otra rutina. Si un PR provenía únicamente de la rutina eliminada, ese PR se
  recalcula y puede bajar o desaparecer. Explícalo en el diálogo de confirmación con una frase.

---

## 2. Nueva rutina / Editar rutina

Formulario simple.

**Campos:**

- **Nombre** (obligatorio, texto libre)
- **Variantes**: selector con las opciones `Sin variantes`, `2 semanas`, `3 semanas`,
  `4 semanas`. Por defecto: `Sin variantes`.
  - Debajo, un texto explicativo en gris: "Tu rutina alternará entre 2 versiones distintas,
    una cada semana."
  - Si se elige un número, se crean automáticamente esas variantes, nombradas A, B, C, D.
  - El usuario puede renombrar cada variante (ej. "Fuerza" / "Hipertrofia").

**Reglas al cambiar el número de variantes en una rutina existente:**

- **Aumentar** (de 2 a 3): la nueva variante se crea vacía, y se ofrece un botón
  "Copiar entrenos de la variante A" para no empezar de cero.
- **Reducir** (de 3 a 2): pedir confirmación explícita. Los entrenos de la variante eliminada
  se borran. Las **sesiones históricas de esa variante se conservan** y siguen apareciendo en
  las gráficas; simplemente ya no se pueden realizar más.
- **Pasar a "Sin variantes"**: se conserva la variante A y se descartan las demás, con la misma
  regla anterior.

**Al guardar una rutina nueva**, la app lleva directamente a la pantalla de Rutina con un
estado vacío que invita a crear el primer entreno.

---

## 3. Rutina

El usuario ve aquí sus entrenos.

**Cabecera:**

- Nombre de la rutina.
- Si tiene variantes: un selector de segmentos con las variantes (A / B / ...). La variante
  activa está resaltada. Bajo el selector, en gris pequeño: "Variante sugerida: B". Si el
  usuario selecciona manualmente una variante distinta de la sugerida, el texto pasa a
  "Has cambiado la variante a mano · Volver a la sugerida", donde la última parte es pulsable.
- En gris pequeño: "Creada el 12 mar 2026".

**Lista de entrenos** (de la variante seleccionada), en el orden definido por el usuario. Cada
tarjeta muestra:

- **Nombre del entreno**, grande. Ej: "Espalda"
- Debajo, en gris pequeño, los **materiales** separados por puntos medios: "Straps · Cinturón"
- A la derecha, en gris muy tenue: "hace 3 días" (fecha de la última sesión de ese entreno) o
  "Nunca" si no se ha hecho.
- Si la última sesión quedó a medias, un indicador discreto: "Sesión sin terminar".

**Acciones:**

- Botón **"Nuevo entreno"** al final de la lista.
- Botón **"Reordenar"** en la cabecera: activa el modo de arrastrar y soltar sobre la lista.
- Deslizar un entreno hacia la izquierda: **Duplicar** (útil para copiarlo a otra variante) y
  **Eliminar**.

**Reglas:**

- Al pulsar un entreno se entra en la pantalla de Entreno.
- "Duplicar" pregunta a qué variante copiarlo si la rutina tiene más de una.

---

## 4. Nuevo entreno / Editar entreno

**Campos:**

- **Nombre** (obligatorio). Ej: "Espalda"
- **Materiales** (opcional): campo donde se van añadiendo etiquetas. El usuario escribe
  "Straps" y pulsa intro; aparece como etiqueta con una x para quitarla. La app recuerda los
  materiales usados antes y los sugiere al escribir.
- **Variante**: solo visible si la rutina tiene variantes. Indica a qué variante pertenece.

---

## 5. Entreno

**Cabecera:**

- Nombre del entreno.
- Materiales en gris debajo.
- En gris pequeño: "Actualizado el 28 jul 2026" — esta fecha se refiere a la última vez que se
  **modificó la estructura** del entreno (ejercicios, series, notas), no a la última sesión.
  Junto a ella: "Última sesión: 30 jul 2026".

**Lista de ejercicios** en su orden. Cada fila muestra:

- Número de orden y nombre del ejercicio.
- Debajo, en gris: "4 series · 8-12 reps".
- A la derecha, la miniatura de la foto si existe.

**Acciones:**

- Botón principal abajo: **"Empezar entreno"**. Crea una sesión nueva y abre el primer
  ejercicio.
  - Si ya hay una sesión sin terminar de hoy, el botón dice **"Continuar entreno"** y retoma
    donde se quedó.
- Botón **"Añadir ejercicio"** al final de la lista.
- Botón **"Reordenar"** en la cabecera.
- Deslizar un ejercicio hacia la izquierda: **Quitar del entreno**. Aclara en la confirmación
  que el ejercicio no se borra del catálogo ni pierde su historial.

**Reglas:**

- Se puede entrar a un ejercicio sin haber pulsado "Empezar entreno": en ese caso se abre en
  modo consulta/edición de la plantilla, no en modo sesión. La diferencia debe ser obvia:
  en modo sesión la barra inferior muestra "Siguiente ejercicio"; en modo plantilla muestra
  "Editar ejercicio".

---

## 6. Añadir ejercicio (buscador del catálogo)

Pantalla que se abre desde "Añadir ejercicio".

**Contenido:**

- Campo de búsqueda arriba, con el foco puesto y el teclado abierto.
- Lista de resultados. Cada resultado muestra el nombre y, en gris, el grupo muscular.
  - Los ejercicios **creados por el usuario** llevan una marca discreta ("Mío").
  - Debajo del nombre, si ya lo ha entrenado alguna vez: "PR 100 kg × 5".
- Al final de la lista, siempre visible: **"Crear ejercicio nuevo: «<lo que ha escrito>»"**.

**Reglas:**

- La búsqueda es insensible a mayúsculas y a acentos ("press banca" encuentra "Press Banca").
- Ordena: primero los que el usuario ya ha usado alguna vez (por frecuencia), después el resto.
- Al seleccionar un ejercicio, se abre el formulario de **configuración en este entreno**
  (siguiente sección). Nunca se añade directamente sin configurar.
- Si el nombre que escribe coincide casi exactamente con uno existente, muestra un aviso antes
  de crear el duplicado: "Ya existe «Press banca». ¿Querías ese?".

---

## 7. Configurar ejercicio en el entreno

Se abre al añadir un ejercicio al entreno, o al editarlo.

**Campos:**

- **Nombre del ejercicio** — solo editable si es un ejercicio propio del usuario. Los del
  catálogo base no se renombran; en su lugar se ofrece "Crear una copia con otro nombre".
- **Foto** (opcional) — botón "Añadir foto" que ofrece **Hacer foto** o **Elegir de la galería**.
  La foto es del ejercicio, no del entreno: cambiarla afecta a todas las rutinas.
  Ver reglas de compresión en `DATA_MODEL.md`.
- **Nota** (opcional, multilínea) — propia de este entreno. Placeholder: "Ej. Banco en el 3,
  agarre justo fuera de los hombros". Se muestra bajo el nombre en la pantalla de sesión.
- **Series** — número, de 1 a 10. Por defecto 3.
- **Rango de repeticiones** (opcional) — dos números, mínimo y máximo. Si solo se rellena uno,
  se toma como valor exacto (equivale a mínimo = máximo). Si se deja vacío, no hay control de
  rango y las repeticiones nunca se pintan de rojo.
- **Descanso** (opcional) — segundos entre series, para el temporizador. Por defecto 90 s.
  Un selector rápido con 60 / 90 / 120 / 180 y la opción de escribir otro valor.

---

## 8. Ejercicio en sesión — **la pantalla más importante**

Es donde el usuario pasa el 90% de su tiempo, de pie, con el móvil en una mano y sudando. Debe
poder usarse con el pulgar y sin precisión.

**Estructura de arriba abajo:**

1. **Cabecera fija**: "Ejercicio 3 de 6" en gris pequeño, y a la derecha un botón para salir
   del entreno. Debajo, el **nombre del ejercicio** en grande.
2. **Badge de PR**: si existe, una línea discreta bajo el nombre: "PR 112,5 kg × 3". Es
   pulsable y abre el historial del ejercicio.
3. **Foto** (si existe): miniatura ancha y baja. Al pulsarla se abre a pantalla completa.
4. **Nota** (si existe): texto en gris, hasta 3 líneas, con "ver más" si es larga.
5. **Tabla de series** — el elemento central:

   | Serie | Peso | Reps | ✓ |
   |---|---|---|---|
   | 1 | 80 | 10 | ○ |
   | 2 | 80 | 9 | ○ |

   - La columna "Serie" es solo el número.
   - "Peso" y "Reps" son campos numéricos grandes. Al pulsarlos se abre el teclado numérico
     (`inputmode="decimal"` para peso, `inputmode="numeric"` para reps).
   - La cabecera de la columna Peso muestra la unidad activa: "Peso (kg)".
   - Si hay rango definido, sobre la tabla se muestra: "Objetivo: 8-12 reps".
   - Un número de repeticiones **fuera del rango se muestra en rojo**, tanto por encima como
     por debajo. Solo el número cambia de color, nada más.
   - La columna ✓ marca la serie como hecha y arranca el temporizador de descanso.
   - Botón discreto "Añadir serie" bajo la tabla, para cuando el usuario improvisa una serie
     extra. La serie añadida solo afecta a esta sesión, no cambia la plantilla, y se muestra
     un enlace "Guardar también en la rutina" por si quiere que sea permanente.

6. **Temporizador de descanso**: cuando se marca una serie, aparece una barra fina sobre la
   navegación inferior con la cuenta atrás ("01:23") y botones para +30 s, saltar y pausar. Al
   llegar a cero vibra el móvil (`navigator.vibrate`) y la barra se pone en blanco un instante.
   No usar sonido ni notificaciones push en la v1.
7. **Nota de sesión**: un enlace pequeño "Añadir nota de hoy" que abre un campo de texto. La
   nota es de la sesión completa, no del ejercicio.
8. **Navegación inferior fija**, respetando la safe area:
   - Primer ejercicio: solo **"Siguiente ejercicio →"**, ocupando todo el ancho.
   - Ejercicios intermedios: **"← Anterior"** a la izquierda (más estrecho) y
     **"Siguiente ejercicio →"** a la derecha (más ancho).
   - Último ejercicio: **"← Anterior"** y **"Terminar entreno"**. El botón de siguiente no
     existe, no aparece desactivado.

**Reglas de guardado:**

- **Todo se guarda automáticamente** al salir de cada campo. Nunca hay un botón "guardar".
- Los valores precargados de la sesión anterior se muestran en **gris**. En cuanto el usuario
  toca el campo, pasan a **blanco** y cuentan como valor propio de esta sesión.
- Si el usuario termina el entreno dejando series en gris sin tocar, esas series **se guardan
  igualmente con el valor precargado**, porque lo normal es repetir el mismo peso. Pero al
  pulsar "Terminar entreno", si hay más de la mitad de las series sin tocar, la app pregunta:
  "Hay 8 series que no has revisado. ¿Las guardo tal cual o las descarto?". **Guardar tal cual**
  las deja como una serie más: cuentan para el PR y aparecen en la gráfica igual que cualquier
  otra. **Descartar** borra de la base de datos solo esas series concretas (las que seguían sin
  revisar); las demás series de la sesión no se tocan.
- Un ejercicio se considera **completado** cuando todas sus series están marcadas con ✓.
- Cuando **todos** los ejercicios de la sesión están completados, el entreno se marca como
  completo automáticamente y "Terminar entreno" cambia a un estado destacado.

**Casos límite:**

- Si el usuario cierra la app a mitad de sesión, al volver a entrar en ese entreno el botón
  dice "Continuar entreno" y se retoma en el ejercicio donde estaba.
- Si una sesión sin terminar tiene más de 24 horas, al abrir la rutina se pregunta una sola
  vez: "Tienes un entreno de espalda sin terminar del martes. ¿Lo doy por terminado o lo
  descarto?". **Dar por terminado** guarda la sesión con las series que tenga (incluidas las
  precargadas sin revisar, igual que arriba) y cuentan para PR y gráficas. **Descartar** borra
  la sesión entera y todas sus series.
- Si el usuario cambia la unidad de kg a lb en mitad de una sesión, los valores ya introducidos
  se convierten y se muestran redondeados a 0,5 lb. Los datos guardados no cambian.

---

## 9. Historial del ejercicio

Se abre desde el badge de PR o desde un botón en la pantalla del ejercicio.

**Contenido:**

- Nombre del ejercicio arriba.
- **PR** destacado: "112,5 kg × 3", y debajo en gris la fecha y la rutina donde se logró.
- **Gráfica de líneas**:
  - Eje horizontal: fechas de las sesiones.
  - Eje vertical: el peso máximo levantado en ese ejercicio en esa sesión.
  - Línea blanca fina, puntos pequeños. Al pulsar un punto aparece una etiqueta con la fecha,
    el peso y las repeticiones de esa serie.
  - Cuadrícula muy tenue. Sin leyenda, sin colores.
- **Selector de rutina** sobre la gráfica: por defecto muestra la rutina desde la que se ha
  entrado. Un desplegable permite ver otras rutinas donde también aparece este ejercicio.
  Las gráficas **no se mezclan**: se ve una rutina cada vez.
- **Lista de sesiones** debajo de la gráfica, de la más reciente a la más antigua. Cada fila:
  fecha, y las series de esa sesión en una línea compacta: "80×10 · 80×9 · 75×8". La nota de
  esa sesión, si existe, aparece en gris debajo.
- Cada fila de la lista es pulsable y permite **editar una sesión pasada** (por si se anotó mal
  un peso). Editar recalcula el PR.

**Casos límite:**

- Con menos de 2 sesiones no se dibuja la gráfica: se muestra "Necesitas al menos dos sesiones
  para ver la progresión" y directamente la lista.
- Si un ejercicio tiene muchísimas sesiones, la gráfica muestra por defecto los últimos 6 meses,
  con un selector de 3 meses / 6 meses / 1 año / Todo.

---

## 10. Mi progreso

Sección global e independiente de las rutinas.

**Contenido:**

- Botón **"Añadir registro"** arriba.
- **Gráfica de peso corporal**: eje horizontal las fechas, eje vertical los kg. Si hay datos de
  % de grasa, una segunda gráfica debajo, nunca superpuesta en el mismo eje.
- Sobre la gráfica, marcas verticales muy tenues en las fechas de inicio y fin de cada rutina,
  con el nombre en pequeño. Así el usuario ve qué rutina estaba haciendo en cada tramo.
- **Lista de registros** por fecha, de más reciente a más antiguo. Cada fila: fecha, peso,
  % de grasa y las miniaturas de las fotos.
- Botón **"Comparar fotos"**: elige dos registros y los muestra lado a lado.

**Formulario de registro:**

- **Fecha** (por defecto hoy)
- **Peso corporal** (opcional)
- **% de grasa** (opcional)
- **Fotos** (opcional, varias): hacer foto o elegir de la galería
- **Nota** (opcional)

**Reglas:**

- Todos los campos son opcionales, pero no se guarda un registro completamente vacío.
- Solo puede haber un registro por día. Si ya existe uno, se edita en lugar de crear otro.
- Las fotos corporales son sensibles: **nunca** se suben a ningún sitio, y no aparecen en
  miniaturas fuera de esta sección.

---

## 11. Ajustes

- **Unidad de peso**: kg / lb. Advertencia bajo el selector: "Solo cambia cómo se muestran los
  pesos. Tu historial no se altera."
- **Descanso por defecto**: segundos que se aplican a los ejercicios nuevos.
- **Copia de seguridad**:
  - Botón **"Exportar copia"** → genera un archivo `mi-rutina-2026-08-01.json` y lanza el
    diálogo de compartir de iOS para guardarlo en Archivos o iCloud Drive.
  - Botón **"Importar copia"** → selecciona un archivo y **sustituye** todos los datos, con
    doble confirmación y un resumen previo ("Este archivo contiene 3 rutinas y 142 sesiones,
    del 12 mar al 30 jul").
  - Debajo: "Última copia: hace 45 días". Si pasan de 30 días, el texto se muestra en rojo.
- **Almacenamiento**: espacio usado, número de fotos, y un botón "Liberar espacio" que ofrece
  recomprimir las fotos antiguas.
- **Borrar todos los datos**, con confirmación escribiendo la palabra "BORRAR".
- Versión de la app al pie.

---

## Comportamientos generales

- **Ningún dato se pierde nunca por navegar.** Salir de una pantalla guarda lo escrito.
- **Toda acción destructiva pide confirmación** y explica exactamente qué se pierde.
- **Nada de animaciones largas.** Transiciones de 150-200 ms como mucho.
- **La app arranca en menos de un segundo** desde el icono, incluso sin red.
- **Retroalimentación táctil** (`navigator.vibrate(10)`) al marcar una serie y al terminar el
  descanso. En ningún sitio más.
- **Accesibilidad mínima**: todo elemento pulsable mide al menos 44×44 px, y los campos
  numéricos abren el teclado correcto.
