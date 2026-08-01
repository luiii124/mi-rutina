# Mi Rutina — Diseño

Una sola idea rige todo: **negro, blanco, grises y nada más**. El rojo existe únicamente para
avisar de repeticiones fuera de rango, y por eso funciona: es el único color de toda la app.

Referencia mental: los ajustes de una cámara profesional o la app Actividad de Apple en modo
oscuro. Denso en información, ligero en decoración.

---

## Color

Definir como variables CSS en `:root` y mapearlas en `tailwind.config.js`. Nunca escribir
colores literales en los componentes.

| Token | Valor | Uso |
|---|---|---|
| `--bg` | `#000000` | Fondo de la app. Negro puro: en pantalla OLED el píxel se apaga y no hay borde visible entre la app y el marco del iPhone |
| `--surface` | `#0E0E0E` | Tarjetas y filas de lista |
| `--surface-raised` | `#1A1A1A` | Campos de texto, elementos pulsados, hojas modales |
| `--border` | `#262626` | Separadores y bordes. Debe intuirse, no verse |
| `--text` | `#FFFFFF` | Texto principal, números introducidos |
| `--text-secondary` | `#8A8A8A` | Notas, fechas, materiales, etiquetas |
| `--text-tertiary` | `#4D4D4D` | Valores precargados sin tocar, marcas de posición, texto deshabilitado |
| `--alert` | `#FF3B30` | **Solo** repeticiones fuera de rango y avisos destructivos |

No hay `--success`, ni `--warning`, ni ningún acento. Si hace falta destacar algo, se usa
tamaño, peso tipográfico o espacio en blanco — nunca color.

**Los tres grises de texto tienen un trabajo concreto:**

- `--text` = lo que el usuario ha decidido
- `--text-secondary` = contexto que ayuda
- `--text-tertiary` = lo que la app propone y él todavía no ha confirmado

Esa jerarquía es lo que hace legible la tabla de series de un vistazo, sudando y sin gafas.

---

## Tipografía

Fuente del sistema, sin descargas:

```css
font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
```

En iPhone esto resuelve a San Francisco, que es exactamente lo que queremos: la app parece
nativa sin pesar un byte.

| Escala | Tamaño / interlineado | Peso | Uso |
|---|---|---|---|
| `display` | 34 / 40 px | 700 | Nombre del ejercicio en sesión |
| `title` | 28 / 34 px | 700 | Título de pantalla, nombre de rutina |
| `heading` | 20 / 26 px | 600 | Nombre de entreno en la lista |
| `body` | 17 / 24 px | 400 | Texto general, notas |
| `numeric` | 24 / 28 px | 600 | Peso y repeticiones en la tabla |
| `caption` | 13 / 18 px | 400 | Materiales, fechas, ayudas |
| `label` | 11 / 14 px | 600, +0,06em | Cabeceras de columna, en MAYÚSCULAS |

**Todos los números usan `font-variant-numeric: tabular-nums`.** Sin esto, la columna de pesos
baila al cambiar de 9 a 10 y la tabla se ve sucia.

---

## Espaciado y forma

- Rejilla de **4 px**. Los espacios habituales son 8, 12, 16, 24 y 32 px.
- Margen lateral de pantalla: **16 px**.
- Radio de esquina: **12 px** en tarjetas, **10 px** en campos y botones, **20 px** en hojas
  modales. Nada de círculos completos salvo en la casilla de serie completada.
- Ancho máximo del contenido: **480 px**, centrado. En un iPhone no se nota; evita que la app
  se vea absurda si se abre en un iPad o en el navegador de escritorio.
- **Sin sombras.** En un fondo negro no se ven y solo ensucian. La profundidad se transmite con
  `--surface` frente a `--bg`.

---

## Componentes

### Botón principal

Fondo `--text` (blanco), texto `--bg` (negro), 52 px de alto, ancho completo, radio 10 px,
peso 600. Al pulsar: opacidad 0,8 y escala 0,98 durante 120 ms.

Es el elemento más llamativo de la app justamente porque es el único bloque blanco sólido.

### Botón secundario

Fondo `--surface-raised`, texto `--text`, borde `--border`, mismas medidas.

### Botón destructivo

Fondo transparente, texto `--alert`, borde `--border`.

### Campo de texto

Fondo `--surface-raised`, sin borde, 48 px de alto, texto `body`, marca de posición en
`--text-tertiary`. Al enfocar, borde de 1 px en `--border` aclarado. **Sin anillo de foco de
color.**

### Campo numérico de la tabla de series

El componente más importante de la app.

- 56 px de alto, 64 px de ancho mínimo, texto `numeric` centrado.
- Fondo `--surface-raised`, radio 10 px.
- Texto en `--text` si el usuario lo ha tocado, en `--text-tertiary` si viene precargado.
- Repeticiones fuera de rango: texto en `--alert`. **Solo el texto.** Nada de fondo rojo, ni
  borde rojo, ni icono. La tabla debe seguir siendo tranquila.
- Al enfocarlo, selecciona todo el contenido para que escribir sobrescriba directamente.
- `inputmode="decimal"` en peso, `inputmode="numeric"` en repeticiones.

### Tabla de series

Rejilla de cuatro columnas: `40px 1fr 1fr 48px` → serie, peso, repeticiones, completada.

- Cabecera con estilo `label` en `--text-secondary`: `SERIE · PESO (KG) · REPS`.
- Filas separadas por 8 px, sin líneas divisorias.
- La casilla de completada es un círculo de 28 px con borde `--border`. Al marcarla se rellena
  de blanco con una marca de verificación negra dentro.
- Una fila con la serie completada baja su opacidad a 0,55. Así se ve de un vistazo por dónde
  vas.

### Tarjeta de entreno

Fondo `--surface`, radio 12 px, relleno de 16 px.

```
Espalda                                    hace 3 días
Straps · Cinturón
```

Nombre en `heading` blanco. Materiales en `caption` `--text-secondary`, separados por " · ".
Fecha alineada a la derecha en `caption` `--text-tertiary`.

### Badge de PR

Texto en `caption`, `--text-secondary`, precedido de las letras "PR" en `label`. Fondo
`--surface-raised`, relleno de 4×10 px, radio 6 px.

```
PR  112,5 kg × 3
```

Discreto por defecto. Cuando el usuario **acaba de batir un PR** en esta sesión, el badge se
rellena de blanco con texto negro durante unos segundos y luego vuelve a su estado normal.
Ese cambio de fondo es la única celebración de la app, y por eso significa algo.

### Selector de variantes

Control de segmentos: contenedor `--surface-raised` con radio 10 px, y el segmento activo con
fondo `--border` y texto blanco. Los inactivos en `--text-secondary`.

### Gráfica

- Línea de 1,5 px en `--text` (blanco), sin relleno bajo la curva, sin degradados.
- Puntos de 3 px, blancos. El punto del PR es un anillo blanco de 6 px, hueco.
- Rejilla horizontal en `--border` a 1 px, sin rejilla vertical.
- Ejes en `caption` `--text-secondary`. El eje horizontal muestra las fechas de forma corta
  ("12 mar"), reduciendo etiquetas si no caben.
- Etiqueta emergente: fondo `--surface-raised`, radio 8 px, con fecha, peso y repeticiones.

### Barra de navegación del ejercicio

Fija abajo, fondo `--bg` con un borde superior de 1 px en `--border`. Relleno inferior
`calc(12px + env(safe-area-inset-bottom))`.

- Un solo botón: principal, ancho completo.
- Dos botones: el de "Anterior" ocupa el 35% y es secundario, el de "Siguiente" el 65% y es
  principal, separados por 8 px.

### Barra del temporizador de descanso

Aparece justo encima de la barra de navegación. 44 px de alto, fondo `--surface-raised`.
A la izquierda la cuenta atrás en `numeric`, a la derecha "+30 s" y "Saltar" en `caption`.
Una línea de progreso de 2 px en `--text` recorre el borde inferior y se vacía de derecha a
izquierda.

---

## Movimiento

Poco y rápido. Nada por encima de 250 ms.

| Interacción | Comportamiento |
|---|---|
| Cambio de pantalla | Deslizamiento lateral de 200 ms, curva `ease-out` |
| Hoja modal | Sube desde abajo, 250 ms |
| Pulsar un botón | Escala 0,98 y opacidad 0,8, 120 ms |
| Marcar una serie | El círculo se rellena en 150 ms + vibración de 10 ms |
| PR batido | El badge se ilumina 400 ms, se mantiene 2 s, se apaga en 400 ms |

Respeta `prefers-reduced-motion`: si está activo, todas las transiciones pasan a 0 ms.

---

## Iconos

Los mínimos imprescindibles, y siempre en trazo de 1,5 px, nunca rellenos: volver, cerrar,
cámara, más, reordenar, gráfica, ajustes. Dibujados a mano como SVG en línea o con una
librería ligera. Ningún icono decorativo. Ningún emoji.

---

## Instalación y arranque

- **Nombre**: "Mi Rutina". **Nombre corto**: "Mi Rutina" (cabe bajo el icono en iOS).
- **Icono**: fondo negro con una marca blanca simple y geométrica. Tamaños 180, 192, 512 px,
  más una versión `maskable`.
- `display: "standalone"`, `theme_color: "#000000"`, `background_color: "#000000"`,
  `orientation: "portrait"`.
- Meta obligatorio en el HTML:
  `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">`
- **Pantalla de arranque en negro puro.** Sin logotipo animado, sin barra de carga. La app
  debe aparecer, no presentarse.

---

## Qué hace fea esta app

Lista de comprobación antes de dar por buena cualquier pantalla:

- Cualquier color que no sea negro, blanco, gris o el rojo de alerta
- Degradados, sombras, brillos, cristal esmerilado
- Bordes en más de un grosor
- Más de tres tamaños de texto distintos en una misma pantalla
- Iconos rellenos o de colores
- Emojis
- Animaciones de más de 250 ms
- Texto centrado en párrafos (solo se centran los estados vacíos)
- Contenedores anidados con fondos distintos: como mucho dos niveles (`--bg` → `--surface`)
- Rellenar el espacio vacío porque parece vacío. El espacio vacío es la mitad del diseño
