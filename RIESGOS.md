# Mi Rutina — Riesgos y decisiones discutibles

Qué puede salir mal, y qué conviene revisar cuando la app lleve un mes en uso.

---

## Riesgos técnicos

### 1. Safari puede borrar los datos de la PWA — riesgo grave

iOS elimina el almacenamiento de sitios no visitados en semanas; aplica también a PWAs
instaladas, aunque con menos agresividad. Consecuencia: seis meses de historial desaparecen
sin aviso.

Mitigación ya incorporada: `navigator.storage.persist()` en el arranque, exportar/importar
copia desde la Fase 1, aviso a los 30 días sin copia. Se reduce, no se elimina — **el usuario
debería exportar una copia al mes y guardarla en iCloud Drive**. Es el precio de no tener Mac.

### 2. Cuota de almacenamiento

Safari concede ~1 GB por origen (puede ser menos); las fotos son el consumidor real.
Mitigación: compresión obligatoria (1280 px, calidad 0,75) + pantalla de almacenamiento con
recompresión. Así, 100 fotos ocupan ~20 MB — margen suficiente.

### 3. El teclado de iOS tapa la tabla de series

Al enfocar un campo bajo en pantalla, el teclado puede taparlo (problema clásico de web en
iPhone). Mitigación: `scrollIntoView({ block: 'center' })` al enfocar + `visualViewport` para
ajustar. Probar de verdad en el móvil en la Fase 3, no darlo por hecho.

### 4. El temporizador en segundo plano

`setInterval` se detiene o ralentiza con la app en segundo plano en iOS. Mitigación: guardar
el instante de inicio del descanso y calcular la diferencia al volver (`visibilitychange`).
Ya en la Fase 4.

### 5. Actualizaciones del service worker

Con Workbox, el usuario puede quedarse en una versión antigua en caché sin enterarse.
Mitigación: `registerType: 'autoUpdate'` + aviso discreto "Hay una versión nueva, tócame para
actualizar" cuando haya un service worker esperando.

---

## Decisiones de producto que conviene revisar más adelante

Ninguna es un error — son elecciones deliberadas que pueden dejar de convencer con el uso.

### A. Pasarse del rango de reps se marca en rojo (por arriba y por abajo)

**Objeción:** con rango 8-12, hacer 14 es buena señal (toca subir peso); pintarlo igual que
"no llegaste" mezcla dos mensajes opuestos y banaliza el rojo.

**Cómo cambiarlo:** toda la interfaz llama a `estaFueraDeRango()` en `domain/`. Basta con
devolver un estado de tres valores (`dentro`/`pasado`/`corto`) y tratar `pasado` distinto —
una tarde de trabajo.

### B. PR = peso máximo levantado

**Objeción:** 100 kg×1 y 90 kg×10 son esfuerzos muy distintos y el primero gana aunque el
segundo sea más fuerza real; el PR puede congelarse en una serie puntual y dejar de reflejar
progreso.

**Cómo cambiarlo:** añadir 1RM estimado (Epley: `peso × (1 + reps/30)`) como segundo dato bajo
el PR — `PersonalRecord` ya guarda las reps, se calcula sin migración. Fuera del alcance de la
v1 a propósito, para no complicar la primera versión.

### C. Precargar los valores de la sesión anterior

**Objeción:** cómodo, pero si el usuario no revisa algunos campos al terminar, se guarda una
sesión que no ocurrió — y esos datos falsos van directos a la gráfica.

**Mitigación ya incluida:** `isPrefilled`, gris vs. blanco, y la pregunta al terminar si
quedan muchas series sin tocar. Si tras un mes de uso aparecen datos raros en las gráficas, la
alternativa es dejar los campos vacíos y mostrar la sesión anterior como línea de referencia.

### D. El nombre "Mi Rutina"

Descriptivo pero genérico — da igual para uso personal, es lo decidido. Solo importaría si se
publicara en la App Store, donde sería invisible entre apps de nombre parecido.

### E. Cuatro variantes como máximo

Cubre bloques de 2/3/4 semanas (lo habitual); un mesociclo de 6 no cabe. Ampliar es trivial
(`variantCount` es un número), pero el selector de segmentos se hace ilegible pasando de 4 —
habría que cambiarlo por un desplegable.

---

## Lo que se descartó y por qué

| Idea | Motivo del descarte |
|---|---|
| App nativa SwiftUI | Requiere Mac, que el usuario no tiene |
| React Native + Expo | Requiere cuenta Apple de pago (99 $/año) para instalación permanente |
| Sincronización en la nube | Exige servidor, cuentas y mantenimiento — es una app personal |
| Medidas corporales dentro de cada rutina | Duplicaría datos si dos rutinas se solapan; se hicieron globales |
| Nota y series compartidas entre rutinas | El mismo ejercicio se usa distinto en cada rutina |
| Guardar pesos en la unidad del usuario | Cambiar de unidad degradaría los datos por redondeos sucesivos |
| Variantes por semana natural del calendario | Se desincroniza en cuanto se descansa una semana |
| Fusionar al importar una copia | Duplicaría sesiones de forma imposible de deshacer |
