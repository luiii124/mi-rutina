# Mi Rutina — Modelo de datos

Base de datos: **IndexedDB** a través de **Dexie.js**. Todo local, en el dispositivo.

## Principios innegociables

1. **Los pesos se guardan siempre en kilogramos**, como número decimal. La unidad del usuario
   es solo presentación.
2. **Las sesiones son inmutables por defecto.** Se crean, no se sobrescriben. Solo se modifican
   si el usuario edita explícitamente una sesión pasada.
3. **Separación entre plantilla y registro.** `WorkoutExercise` es la plantilla (qué pienso
   hacer). `SessionSet` es el registro (qué hice de verdad). Nunca mezcles las dos.
4. **Los identificadores son UUID v4 en texto**, no autoincrementales. Así la importación de
   copias de seguridad no genera colisiones.
5. **Toda entidad lleva `createdAt` y `updatedAt`** en milisegundos epoch (UTC).

---

## Entidades

### `Settings` — una sola fila, id fijo `"settings"`

| Campo | Tipo | Notas |
|---|---|---|
| `id` | `"settings"` | constante |
| `unit` | `'kg' \| 'lb'` | por defecto `'kg'` |
| `defaultRestSeconds` | `number` | por defecto 90 |
| `lastBackupAt` | `number \| null` | epoch ms |
| `schemaVersion` | `number` | para migraciones |

---

### `Exercise` — catálogo global de ejercicios

Compartido entre todas las rutinas. Aquí vive la identidad del ejercicio.

| Campo | Tipo | Notas |
|---|---|---|
| `id` | `string` | uuid |
| `name` | `string` | "Press banca" |
| `nameNormalized` | `string` | minúsculas sin acentos, **indexado**, para el buscador |
| `muscleGroup` | `string \| null` | "Pecho", "Espalda"... solo informativo |
| `photoId` | `string \| null` | referencia a `Photo` |
| `isBuiltIn` | `boolean` | `true` para el catálogo base |
| `usageCount` | `number` | veces que se ha añadido a un entreno, para ordenar la búsqueda |
| `createdAt` / `updatedAt` | `number` | |

Índices: `id`, `nameNormalized`, `isBuiltIn`.

---

### `Routine` — rutina

| Campo | Tipo | Notas |
|---|---|---|
| `id` | `string` | uuid |
| `name` | `string` | |
| `variantCount` | `1 \| 2 \| 3 \| 4` | `1` significa sin variantes |
| `variantNames` | `string[]` | longitud = `variantCount`. Por defecto `["A","B",...]` |
| `currentVariantIndex` | `number` | 0-based. La variante **sugerida** por la app |
| `manualVariantIndex` | `number \| null` | si el usuario la fijó a mano; `null` = automático |
| `cycleCompletedWorkoutIds` | `string[]` | entrenos ya hechos del ciclo actual |
| `createdAt` / `updatedAt` | `number` | |
| `archivedAt` | `number \| null` | para "terminar" una rutina sin borrarla |

---

### `Workout` — entreno (un día de la rutina)

| Campo | Tipo | Notas |
|---|---|---|
| `id` | `string` | uuid |
| `routineId` | `string` | **indexado** |
| `variantIndex` | `number` | 0-based |
| `name` | `string` | "Espalda" |
| `materials` | `string[]` | `["Straps", "Cinturón"]` |
| `order` | `number` | posición dentro de su variante |
| `createdAt` / `updatedAt` | `number` | `updatedAt` = último cambio de **estructura** |

Índice compuesto: `[routineId+variantIndex]`.

---

### `WorkoutExercise` — plantilla del ejercicio dentro de un entreno

| Campo | Tipo | Notas |
|---|---|---|
| `id` | `string` | uuid |
| `workoutId` | `string` | **indexado** |
| `exerciseId` | `string` | **indexado**, apunta al catálogo |
| `order` | `number` | |
| `note` | `string \| null` | propia de este entreno |
| `targetSets` | `number` | 1-10 |
| `repMin` | `number \| null` | `null` = sin control de rango |
| `repMax` | `number \| null` | |
| `restSeconds` | `number \| null` | `null` = usa el valor por defecto de Ajustes |
| `createdAt` / `updatedAt` | `number` | |

---

### `Session` — un entreno realizado un día concreto

| Campo | Tipo | Notas |
|---|---|---|
| `id` | `string` | uuid |
| `routineId` | `string` | **indexado**, desnormalizado a propósito |
| `workoutId` | `string` | **indexado** |
| `variantIndex` | `number` | copia del momento, por si luego cambia |
| `startedAt` | `number` | epoch ms |
| `completedAt` | `number \| null` | `null` = sesión sin terminar |
| `note` | `string \| null` | nota de la sesión completa |

Índice compuesto: `[workoutId+startedAt]`.

`routineId` se guarda aunque sea deducible desde `workoutId`. Es deliberado: las gráficas
filtran por rutina y hacerlo con un salto menos de consulta compensa.

---

### `SessionSet` — una serie registrada

La tabla que más crece. Es donde vive todo el historial real.

| Campo | Tipo | Notas |
|---|---|---|
| `id` | `string` | uuid |
| `sessionId` | `string` | **indexado** |
| `workoutExerciseId` | `string` | **indexado** |
| `exerciseId` | `string` | **indexado**, desnormalizado para el PR y las gráficas |
| `routineId` | `string` | **indexado**, desnormalizado para las gráficas por rutina |
| `setIndex` | `number` | 0-based |
| `weightKg` | `number \| null` | **siempre en kg** |
| `reps` | `number \| null` | |
| `isCompleted` | `boolean` | la marca ✓ |
| `isPrefilled` | `boolean` | `true` mientras el usuario no lo haya tocado |
| `performedAt` | `number` | copia de `session.startedAt`, para ordenar sin join |

Índice compuesto: `[exerciseId+performedAt]` — es la consulta más frecuente de toda la app
(historial y gráfica de un ejercicio). Y `[exerciseId+routineId]` para la gráfica por rutina.

---

### `BodyEntry` — registro corporal

| Campo | Tipo | Notas |
|---|---|---|
| `id` | `string` | uuid |
| `date` | `string` | `YYYY-MM-DD`, **único e indexado** |
| `weightKg` | `number \| null` | |
| `bodyFatPct` | `number \| null` | |
| `photoIds` | `string[]` | |
| `note` | `string \| null` | |
| `createdAt` / `updatedAt` | `number` | |

`date` es texto `YYYY-MM-DD` y no un timestamp: evita que un registro se mueva de día al
cambiar de zona horaria o con el horario de verano.

---

### `Photo` — imágenes

| Campo | Tipo | Notas |
|---|---|---|
| `id` | `string` | uuid |
| `blob` | `Blob` | JPEG comprimido |
| `width` / `height` | `number` | |
| `bytes` | `number` | para la pantalla de almacenamiento |
| `kind` | `'exercise' \| 'body'` | |
| `createdAt` | `number` | |

**Reglas de compresión, obligatorias:**

- Antes de guardar, redimensionar con `canvas` para que el lado mayor sea **1280 px** como
  máximo, y exportar a JPEG con calidad **0,75**.
- Una foto de iPhone sin comprimir ocupa 3-5 MB. Comprimida, unos 150-250 KB. Sin esta regla,
  veinte fotos de ejercicios llenan la cuota de IndexedDB de Safari y la app deja de guardar.
- Al mostrar la miniatura, usar `URL.createObjectURL` y **liberar el objeto** con
  `URL.revokeObjectURL` al desmontar el componente. Si no, hay fuga de memoria.

---

### `PersonalRecord` — caché del PR

Es una caché derivada de `SessionSet`. Se puede reconstruir entera desde cero en cualquier
momento; existe solo por velocidad.

| Campo | Tipo | Notas |
|---|---|---|
| `exerciseId` | `string` | clave primaria |
| `weightKg` | `number` | el peso más alto jamás levantado |
| `reps` | `number` | repeticiones de esa misma serie |
| `sessionId` | `string` | dónde ocurrió |
| `routineId` | `string` | |
| `achievedAt` | `number` | |

**Cuándo se actualiza:**

- Al guardar una serie con peso y repeticiones: si `weightKg` supera el PR actual, se
  reemplaza.
- **Empate a peso**: gana la serie con **más repeticiones**. Si también empatan, se conserva
  el registro más antiguo (el PR original).
- Al **editar** una sesión pasada o al **borrar** una rutina, el PR de los ejercicios afectados
  se **recalcula desde cero** consultando todas sus `SessionSet`. No intentes ajustarlo de
  forma incremental: es una fuente segura de errores.
- Una serie con `weightKg` a `null` o `reps` a 0 nunca cuenta para el PR.

---

## Algoritmos

### Conversión de unidades

```
kgToLb(kg) = kg * 2.20462262185
lbToKg(lb) = lb / 2.20462262185
```

- Al **mostrar** en libras: redondear a 0,5 lb.
- Al **mostrar** en kilos: redondear a 0,5 kg (o a 0,25 si el valor lo requiere).
- Al **introducir** en libras: convertir a kg y guardar el valor completo, **sin redondear**.
  Redondear al guardar hace que el valor se degrade cada vez que se cambia de unidad.
- El campo acepta tanto coma como punto decimal.

### Repeticiones fuera de rango

```
estaFueraDeRango(reps, repMin, repMax):
    si repMin es null o repMax es null → false
    si reps es null o reps == 0 → false
    devolver reps < repMin o reps > repMax
```

Toda la interfaz llama a **esta única función**. Cambiar la política (por ejemplo, que pasarse
del rango deje de ser rojo) debe ser modificar solo esta función.

### Avance automático de variante

Solo aplica si `routine.variantCount > 1`.

```
alCompletarSesión(sesión):
    rutina = rutina de la sesión
    si rutina.variantCount == 1 → salir

    si sesión.workoutId no está en rutina.cycleCompletedWorkoutIds:
        añadirlo

    entrenosDeLaVariante = entrenos de la rutina con variantIndex == rutina.currentVariantIndex

    si todos los ids de entrenosDeLaVariante están en cycleCompletedWorkoutIds:
        rutina.currentVariantIndex = (rutina.currentVariantIndex + 1) % rutina.variantCount
        rutina.cycleCompletedWorkoutIds = []
        rutina.manualVariantIndex = null
```

**Variante mostrada** = `manualVariantIndex ?? currentVariantIndex`.

Cuando el usuario elige una variante a mano, se guarda en `manualVariantIndex` y se muestra el
aviso "Has cambiado la variante a mano". Pulsar "Volver a la sugerida" pone `manualVariantIndex`
a `null`.

**Por qué así y no por fechas:** contar semanas naturales se desincroniza en cuanto el usuario
descansa una semana, se va de viaje o entrena en desorden — que es lo normal. Contar entrenos
completados sigue el ritmo real de la persona.

**Caso límite:** si se añade un entreno nuevo a la variante en curso cuando el ciclo ya estaba
casi completo, ese entreno queda pendiente y el ciclo simplemente tarda más en cerrarse. Es el
comportamiento correcto.

### Precarga de la sesión anterior

Al abrir un ejercicio en modo sesión:

```
paraCadaSerie i de 0 a targetSets-1:
    si ya existe un SessionSet de esta sesión con setIndex == i → usarlo
    si no:
        buscar la última sesión anterior de este workoutExerciseId
        si existe y tiene una serie con setIndex == i:
            crear SessionSet con su weightKg y reps, isPrefilled = true
        si no:
            crear SessionSet vacío, isPrefilled = false
```

Cuando el usuario modifica un campo, `isPrefilled` pasa a `false`. La interfaz pinta en gris
las series con `isPrefilled = true` y en blanco las demás.

### Datos de la gráfica de un ejercicio

```
puntosDeLaGráfica(exerciseId, routineId, desde, hasta):
    series = SessionSet donde exerciseId coincide
                          y routineId coincide
                          y performedAt entre desde y hasta
                          y weightKg no es null
    agrupar por día de performedAt
    por cada grupo:
        punto = { fecha, pesoMáximo, repsDeEsaSerie }
    ordenar por fecha ascendente
```

Si un ejercicio se repite dos veces el mismo día (dos sesiones), se agrupan en un solo punto
con el peso máximo del día.

### Tramo activo de una rutina

Necesario para dibujar las marcas verticales de la pantalla "Mi progreso". No se guarda como
campo: se calcula.

```
tramoDeLaRutina(routineId):
    inicio = startedAt de la sesión más antigua de esa rutina
    fin    = archivedAt si no es null
             en otro caso, startedAt de la sesión más reciente
    si no hay ninguna sesión → la rutina no se dibuja
```

Una rutina se marca como archivada (`archivedAt`) desde el menú de la rutina, con la opción
"Terminar rutina". Una rutina archivada baja al final de la lista de Inicio, se muestra con el
nombre en `--text-secondary` y no se puede empezar un entreno desde ella hasta reactivarla.
Su historial y sus gráficas siguen intactos.

### Sugerencias de materiales

No hay tabla de materiales. Al escribir en el campo, se consultan todos los `Workout` de la
base de datos, se aplanan sus arrays `materials`, se eliminan duplicados sin distinguir
mayúsculas y se filtran por lo escrito. Con decenas de entrenos es instantáneo y evita una
tabla más que mantener sincronizada.

---

## Catálogo base de ejercicios

Al primer arranque se siembran ejercicios con `isBuiltIn = true`. Unos 60, agrupados por
músculo, con nombres en español:

- **Pecho**: press banca, press inclinado con barra, press inclinado con mancuernas, press
  plano con mancuernas, aperturas en polea, aperturas en máquina, fondos en paralelas, press
  en máquina
- **Espalda**: dominadas, jalón al pecho, jalón agarre neutro, remo con barra, remo con
  mancuerna, remo en máquina, remo en polea baja, pullover en polea, face pull
- **Hombro**: press militar con barra, press militar con mancuernas, elevaciones laterales,
  elevaciones laterales en polea, elevaciones frontales, pájaros, press Arnold
- **Bíceps**: curl con barra, curl con mancuernas, curl martillo, curl inclinado, curl
  predicador, curl en polea
- **Tríceps**: extensiones en polea, extensiones tras nuca, press francés, fondos en banco,
  patada de tríceps
- **Pierna**: sentadilla, sentadilla frontal, prensa, hack squat, zancadas, búlgaras, peso
  muerto, peso muerto rumano, curl femoral tumbado, curl femoral sentado, extensiones de
  cuádriceps, hip thrust, abductores, aductores, gemelo de pie, gemelo sentado
- **Core**: plancha, elevaciones de piernas, rueda abdominal, crunch en polea

El usuario **no puede editar ni borrar** los del catálogo base, pero sí crear una copia con
otro nombre. Los que crea él llevan `isBuiltIn = false` y son totalmente editables.

---

## Copia de seguridad

**Formato del archivo exportado:**

```json
{
  "app": "mi-rutina",
  "schemaVersion": 1,
  "exportedAt": 1754049600000,
  "settings": { },
  "exercises": [ ],
  "routines": [ ],
  "workouts": [ ],
  "workoutExercises": [ ],
  "sessions": [ ],
  "sessionSets": [ ],
  "bodyEntries": [ ],
  "photos": [ { "id": "...", "kind": "exercise", "dataUrl": "data:image/jpeg;base64,..." } ]
}
```

**Reglas:**

- Las fotos van en base64 dentro del mismo archivo. Es un archivo grande (varios MB) pero
  autocontenido, y eso es lo que importa.
- Al importar: validar `app` y `schemaVersion`, mostrar un resumen del contenido, y solo
  entonces **borrar todo y sustituir**. Nunca fusionar: fusionar duplicaría sesiones y sería
  imposible de deshacer.
- Antes de sustituir, la app genera una copia automática de los datos actuales en IndexedDB,
  bajo una clave aparte, recuperable durante 7 días.
- El nombre del archivo incluye la fecha: `mi-rutina-2026-08-01.json`.

---

## Migraciones

Dexie versiona el esquema. Cada cambio incrementa la versión y añade un bloque
`.version(n).stores({...}).upgrade(tx => {...})`.

**Nunca** cambies el significado de un campo existente. Si un campo necesita otra semántica,
crea uno nuevo y migra los datos. Un usuario con seis meses de historial no puede perderlo por
un cambio de esquema.
