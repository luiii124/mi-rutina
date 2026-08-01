# Mi Rutina — Riesgos y decisiones discutibles

Lo que puede salir mal y lo que conviene revisar cuando la app lleve un mes en uso.

---

## Riesgos técnicos

### 1. Safari puede borrar los datos de la PWA — **el riesgo grave**

iOS elimina el almacenamiento de sitios web que no se visitan durante unas semanas. Aplica
también a las PWA instaladas, aunque con menos agresividad.

Consecuencia: seis meses de historial desaparecen sin aviso.

Mitigación, ya incorporada al plan:

- `navigator.storage.persist()` en el arranque
- Exportar e importar copia de seguridad desde la Fase 1
- Aviso a los 30 días sin copia

Es un riesgo que se reduce, no se elimina. **El usuario debería exportar una copia una vez al
mes y guardarla en iCloud Drive.** Es el precio de no tener Mac.

### 2. Cuota de almacenamiento

Safari concede aproximadamente 1 GB por origen, pero puede ser menos. Las fotos son el
consumidor real.

Mitigación: compresión obligatoria (1280 px, calidad 0,75) y pantalla de almacenamiento con
recompresión. Con esos ajustes, 100 fotos ocupan unos 20 MB. Suficiente margen.

### 3. El teclado de iOS tapa la tabla de series

Al enfocar un campo abajo de la pantalla, el teclado puede ocultarlo. Es el problema clásico de
las webs en iPhone.

Mitigación: usar `scrollIntoView({ block: 'center' })` al enfocar un campo, y `visualViewport`
para ajustar el desplazamiento. Probar de verdad en el móvil en la Fase 3, no darlo por hecho.

### 4. El temporizador en segundo plano

`setInterval` se detiene o se ralentiza cuando la app pasa a segundo plano en iOS.

Mitigación: guardar el instante de inicio del descanso y calcular la diferencia al volver a
primer plano (evento `visibilitychange`). Ya está en la Fase 4.

### 5. Actualizaciones del service worker

Con Workbox, el usuario puede quedarse con una versión antigua en caché sin enterarse.

Mitigación: configurar `registerType: 'autoUpdate'` y mostrar un aviso discreto "Hay una
versión nueva, tócame para actualizar" cuando haya un service worker esperando.

---

## Decisiones de producto que conviene revisar más adelante

Ninguna es un error. Todas son elecciones deliberadas que pueden dejar de convencer con el uso.

### A. Pasarse del rango de repeticiones se marca en rojo

**Decisión tomada:** rojo tanto por arriba como por abajo.

**Objeción:** si el rango es 8-12 y haces 14, eso es una buena señal — significa que toca subir
peso. Pintarlo del mismo color que "no has llegado" mezcla dos mensajes opuestos, y con el
tiempo el rojo deja de significar nada porque salta demasiado.

**Cómo cambiarlo si un día molesta:** toda la interfaz consulta la función
`estaFueraDeRango()` de `domain/`. Basta con devolver un estado de tres valores
(`dentro` / `pasado` / `corto`) y darle a `pasado` otro tratamiento. Una tarde de trabajo.

### B. PR = peso máximo levantado

**Decisión tomada:** el peso más alto de la historia, mostrado con sus repeticiones.

**Objeción:** 100 kg × 1 y 90 kg × 10 son esfuerzos muy distintos, y el primero gana aunque el
segundo sea más fuerza real. Con el tiempo el PR se congela en una serie pesada puntual y deja
de reflejar el progreso.

**Cómo cambiarlo:** añadir un 1RM estimado (fórmula de Epley: `peso × (1 + reps/30)`) como
segundo dato bajo el PR. La tabla `PersonalRecord` ya guarda las repeticiones, así que se puede
calcular sobre los datos existentes sin migración. Está en la lista de "fuera del alcance de
la v1" a propósito, para no complicar la primera versión.

### C. Precargar los valores de la sesión anterior

**Decisión tomada:** los campos vienen rellenos en gris con los datos de la última vez.

**Objeción:** es cómodo, pero si el usuario termina el entreno sin revisar unos cuantos campos,
la app guarda una sesión que no ocurrió. Y esos datos falsos van directos a la gráfica.

**Mitigación ya incluida:** el campo `isPrefilled`, el gris frente al blanco, y la pregunta al
terminar si quedan muchas series sin tocar. Si aun así aparecen datos raros en las gráficas
después de un mes de uso, la alternativa es dejar los campos vacíos y mostrar la sesión
anterior como una línea de referencia encima.

### D. El nombre "Mi Rutina"

Es descriptivo pero genérico. Para una PWA de uso personal da igual, y es lo que hay decidido.
Solo importaría si algún día se publica en la App Store, donde competiría con decenas de apps
de nombre parecido y sería invisible en las búsquedas.

### E. Cuatro variantes como máximo

Cubre bloques de 2, 3 y 4 semanas, que es lo habitual. Un mesociclo de 6 semanas no cabe.
Ampliarlo es trivial (`variantCount` es un número), pero la interfaz del selector de segmentos
se hace ilegible pasando de 4. Si se necesitan más, habría que cambiar el selector por un
desplegable.

---

## Lo que se descartó y por qué

| Idea | Motivo del descarte |
|---|---|
| App nativa SwiftUI | Requiere Mac, que el usuario no tiene |
| React Native + Expo | Requiere 99 $/año de cuenta Apple para instalarla de forma permanente |
| Sincronización en la nube | Exige servidor, cuentas y mantenimiento. Es una app personal |
| Medidas corporales dentro de cada rutina | Duplicaría los datos si dos rutinas se solapan. Se hicieron globales |
| Nota y series compartidas entre rutinas | El mismo ejercicio se usa distinto en cada rutina |
| Guardar los pesos en la unidad del usuario | Cambiar de unidad degradaría los datos por redondeos sucesivos |
| Variantes por semana natural del calendario | Se desincroniza en cuanto se descansa una semana |
| Fusionar al importar una copia | Duplicaría sesiones de forma imposible de deshacer |
