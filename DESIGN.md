# Mi Rutina — Diseño

Una sola idea: **negro, blanco, grises y nada más**. El rojo existe solo para reps fuera de
rango — y por eso funciona, es el único color de la app.

Referencia mental: ajustes de una cámara profesional, o Actividad de Apple en modo oscuro.
Denso en información, ligero en decoración.

---

## Color

Variables CSS en `:root`, mapeadas en `tailwind.config.js`. Nunca colores literales en
componentes.

| Token | Valor | Uso |
|---|---|---|
| `--bg` | `#000000` | Fondo de la app (negro puro: en OLED el píxel se apaga, sin borde visible con el marco) |
| `--surface` | `#0E0E0E` | Tarjetas y filas de lista |
| `--surface-raised` | `#1A1A1A` | Campos de texto, elementos pulsados, hojas modales |
| `--border` | `#262626` | Separadores/bordes — deben intuirse, no verse |
| `--text` | `#FFFFFF` | Texto principal, números introducidos |
| `--text-secondary` | `#8A8A8A` | Notas, fechas, materiales, etiquetas |
| `--text-tertiary` | `#4D4D4D` | Valores precargados sin tocar, placeholders, texto deshabilitado |
| `--alert` | `#FF3B30` | **Solo** reps fuera de rango y avisos destructivos |

Sin `--success` ni `--warning` ni acentos. Para destacar algo: tamaño, peso tipográfico o
espacio en blanco — nunca color.

Jerarquía de grises: `--text` = lo que el usuario decidió · `--text-secondary` = contexto que
ayuda · `--text-tertiary` = lo que la app propone y aún no está confirmado. Es lo que hace
legible la tabla de series de un vistazo, sudando y sin gafas.

---

## Tipografía

Fuente del sistema, sin descargas:

```css
font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
```

En iPhone resuelve a San Francisco: la app parece nativa sin pesar un byte.

| Escala | Tamaño/interlineado | Peso | Uso |
|---|---|---|---|
| `display` | 34/40 px | 700 | Nombre del ejercicio en sesión |
| `title` | 28/34 px | 700 | Título de pantalla, nombre de rutina |
| `heading` | 20/26 px | 600 | Nombre de entreno en lista |
| `body` | 17/24 px | 400 | Texto general, notas |
| `numeric` | 24/28 px | 600 | Peso y repeticiones |
| `caption` | 13/18 px | 400 | Materiales, fechas, ayudas |
| `label` | 11/14 px | 600, +0,06em | Cabeceras de columna, MAYÚSCULAS |

Todos los números con `font-variant-numeric: tabular-nums` (si no, la columna de pesos baila
al pasar de 9 a 10).

---

## Espaciado y forma

- Rejilla de 4 px; espacios habituales 8/12/16/24/32 px.
- Margen lateral de pantalla: 16 px.
- Radio: 12 px tarjetas, 10 px campos/botones, 20 px hojas modales. Sin círculos completos
  salvo la casilla de serie completada.
- Ancho máximo del contenido: 480 px centrado (evita que se vea absurdo en iPad/escritorio).
- Sin sombras (invisibles en negro, solo ensucian) — la profundidad la da `--surface` vs `--bg`.

---

## Componentes

**Botón principal**: fondo `--text` (blanco), texto `--bg` (negro), 52 px alto, ancho
completo, radio 10 px, peso 600. Al pulsar: opacidad 0,8 + escala 0,98, 120 ms. El único
bloque blanco sólido de la app — por eso destaca.

**Botón secundario**: fondo `--surface-raised`, texto `--text`, borde `--border`, mismas
medidas.

**Botón destructivo**: fondo transparente, texto `--alert`, borde `--border`.

**Campo de texto**: fondo `--surface-raised`, sin borde, 48 px alto, texto `body`, placeholder
`--text-tertiary`. Al enfocar: borde 1 px `--border` aclarado. Sin anillo de foco de color.

**Campo numérico de la tabla de series** (el más importante): 56 px alto, 64 px ancho mínimo,
texto `numeric` centrado, fondo `--surface-raised`, radio 10 px. Texto `--text` si el usuario
lo tocó, `--text-tertiary` si viene precargado. Reps fuera de rango: solo el texto en
`--alert` (nada de fondo/borde/icono rojo — la tabla sigue tranquila). Al enfocar, selecciona
todo el contenido (escribir sobrescribe). `inputmode="decimal"` en peso, `"numeric"` en reps.

**Tabla de series**: rejilla `40px 1fr 1fr 48px` (serie/peso/reps/completada). Cabecera
`label` `--text-secondary`: "SERIE · PESO (KG) · REPS". Filas separadas 8 px, sin divisorias.
Casilla de completada: círculo 28 px borde `--border`, al marcar se rellena de blanco con
check negro. Fila completada baja opacidad a 0,55.

**Tarjeta de entreno**: fondo `--surface`, radio 12 px, relleno 16 px. Nombre `heading`
blanco; materiales `caption` `--text-secondary` separados por " · "; fecha a la derecha
`caption` `--text-tertiary`.
```
Espalda                                    hace 3 días
Straps · Cinturón
```

**Badge de PR**: `caption` `--text-secondary`, precedido de "PR" en `label`. Fondo
`--surface-raised`, relleno 4×10 px, radio 6 px ("PR  112,5 kg × 3"). Discreto por defecto;
al **batir un PR** en la sesión, se rellena de blanco con texto negro unos segundos y vuelve a
la normalidad — la única celebración de la app, por eso significa algo.

**Selector de variantes**: control de segmentos, contenedor `--surface-raised` radio 10 px,
segmento activo fondo `--border` texto blanco, inactivos `--text-secondary`.

**Gráfica**: línea 1,5 px `--text`, sin relleno ni degradado. Puntos 3 px blancos; el punto
del PR es anillo blanco hueco de 6 px. Rejilla horizontal `--border` 1 px, sin vertical. Ejes
`caption` `--text-secondary`, fechas cortas ("12 mar"), reduce etiquetas si no caben. Etiqueta
emergente: fondo `--surface-raised`, radio 8 px, con fecha/peso/reps.

**Barra de navegación del ejercicio**: fija abajo, fondo `--bg`, borde superior 1 px
`--border`, relleno inferior `calc(12px + env(safe-area-inset-bottom))`. Un botón = principal,
ancho completo. Dos botones = "Anterior" 35% secundario + "Siguiente" 65% principal, 8 px
entre ellos.

**Barra del temporizador de descanso**: encima de la barra de navegación, 44 px alto, fondo
`--surface-raised`. Izq. cuenta atrás `numeric`; der. "+30 s" y "Saltar" en `caption`. Línea de
progreso 2 px `--text` en el borde inferior, se vacía de derecha a izquierda.

---

## Movimiento

Poco y rápido, nada por encima de 250 ms.

| Interacción | Comportamiento |
|---|---|
| Cambio de pantalla | Deslizamiento lateral 200 ms, `ease-out` |
| Hoja modal | Sube desde abajo, 250 ms |
| Pulsar un botón | Escala 0,98 + opacidad 0,8, 120 ms |
| Marcar una serie | Círculo se rellena en 150 ms + vibración de 10 ms |
| PR batido | Badge se ilumina 400 ms, se mantiene 2 s, se apaga en 400 ms |

Respeta `prefers-reduced-motion`: si está activo, todas las transiciones a 0 ms.

---

## Iconos

Mínimos imprescindibles, trazo 1,5 px, nunca rellenos: volver, cerrar, cámara, más, reordenar,
gráfica, ajustes. SVG en línea o librería ligera. Ningún icono decorativo. Ningún emoji.

---

## Instalación y arranque

- Nombre: "Mi Rutina" (también nombre corto — cabe bajo el icono en iOS).
- Icono: fondo negro, marca blanca simple geométrica. Tamaños 180/192/512 px + versión
  `maskable`.
- `display: "standalone"`, `theme_color: "#000000"`, `background_color: "#000000"`,
  `orientation: "portrait"`.
- Meta obligatorio: `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">`
- Pantalla de arranque en negro puro. Sin logo animado ni barra de carga — la app debe
  aparecer, no presentarse.

---

## Qué hace fea esta app — checklist antes de dar por buena una pantalla

- Cualquier color que no sea negro, blanco, gris o el rojo de alerta
- Degradados, sombras, brillos, cristal esmerilado
- Bordes en más de un grosor
- Más de tres tamaños de texto distintos en una misma pantalla
- Iconos rellenos o de colores
- Emojis
- Animaciones de más de 250 ms
- Texto centrado en párrafos (solo los estados vacíos)
- Contenedores anidados con fondos distintos: máximo dos niveles (`--bg` → `--surface`)
- Rellenar el espacio vacío porque "parece vacío" — el espacio vacío es la mitad del diseño
