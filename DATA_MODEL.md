# Mi Rutina — Modelo de datos

BD: **IndexedDB** vía **Dexie.js**. Todo local, en el dispositivo.

## Principios innegociables

1. **Pesos siempre en kilogramos** (decimal). La unidad del usuario es solo presentación.
2. **Sesiones inmutables por defecto.** Se crean, no se sobrescriben, salvo edición explícita
   de una sesión pasada.
3. **Plantilla vs. registro, separados.** `WorkoutExercise` = plantilla (qué pienso hacer).
   `SessionSet` = registro (qué hice de verdad). No mezclar.
4. **IDs = UUID v4 en texto**, no autoincrementales, para que importar copias no colisione.
5. **Toda entidad lleva `createdAt`/`updatedAt`** en ms epoch (UTC).

---

## Entidades

### `Settings` — fila única, id fijo `"settings"`

| Campo | Tipo | Notas |
|---|---|---|
| `id` | `"settings"` | constante |
| `unit` | `'kg' \| 'lb'` | por defecto `'kg'` |
| `defaultRestSeconds` | `number` | por defecto 90 |
| `lastBackupAt` | `number \| null` | epoch ms |
| `schemaVersion` | `number` | para migraciones |

### `Exercise` — catálogo global, compartido entre rutinas

| Campo | Tipo | Notas |
|---|---|---|
| `id` | `string` | uuid |
| `name` | `string` | "Press banca" |
| `nameNormalized` | `string` | minúsculas sin acentos, **indexado**, para el buscador |
| `muscleGroup` | `string \| null` | solo informativo |
| `photoId` | `string \| null` | referencia a `Photo` |
| `isBuiltIn` | `boolean` | `true` = catálogo base |
| `usageCount` | `number` | veces añadido a un entreno, para ordenar la búsqueda |
| `createdAt` / `updatedAt` | `number` | |

Índices: `id`, `nameNormalized`, `isBuiltIn`.

### `Routine` — rutina

| Campo | Tipo | Notas |
|---|---|---|
| `id` | `string` | uuid |
| `name` | `string` | |
| `variantCount` | `1\|2\|3\|4` | `1` = sin variantes |
| `variantNames` | `string[]` | longitud = `variantCount`, por defecto `["A","B",...]` |
| `currentVariantIndex` | `number` | 0-based, variante **sugerida** |
| `manualVariantIndex` | `number \| null` | fijada a mano; `null` = automático |
| `cycleCompletedWorkoutIds` | `string[]` | entrenos ya hechos del ciclo actual |
| `createdAt` / `updatedAt` | `number` | |
| `archivedAt` | `number \| null` | "terminar" rutina sin borrarla |

### `Workout` — entreno (día de la rutina)

| Campo | Tipo | Notas |
|---|---|---|
| `id` | `string` | uuid |
| `routineId` | `string` | **indexado** |
| `variantIndex` | `number` | 0-based |
| `name` | `string` | "Espalda" |
| `materials` | `string[]` | `["Straps","Cinturón"]` |
| `order` | `number` | posición en su variante |
| `createdAt` / `updatedAt` | `number` | `updatedAt` = último cambio de **estructura** |

Índice compuesto: `[routineId+variantIndex]`.

### `WorkoutExercise` — plantilla del ejercicio en un entreno

| Campo | Tipo | Notas |
|---|---|---|
| `id` | `string` | uuid |
| `workoutId` | `string` | **indexado** |
| `exerciseId` | `string` | **indexado**, apunta al catálogo |
| `order` | `number` | |
| `note` | `string \| null` | propia de este entreno |
| `targetSets` | `number` | 1-10 |
| `repMin` / `repMax` | `number \| null` | `null` = sin control de rango |
| `restSeconds` | `number \| null` | `null` = usa el valor por defecto de Ajustes |
| `createdAt` / `updatedAt` | `number` | |

### `Session` — entreno realizado un día concreto

| Campo | Tipo | Notas |
|---|---|---|
| `id` | `string` | uuid |
| `routineId` | `string` | **indexado**, desnormalizado a propósito |
| `workoutId` | `string` | **indexado** |
| `variantIndex` | `number` | copia del momento, por si cambia después |
| `startedAt` | `number` | epoch ms |
| `completedAt` | `number \| null` | `null` = sin terminar |
| `note` | `string \| null` | nota de la sesión completa |

Índice compuesto: `[workoutId+startedAt]`. `routineId` se guarda aunque sea deducible desde
`workoutId`: las gráficas filtran por rutina y ahorra un salto de consulta.

### `SessionSet` — una serie registrada (la tabla que más crece)

| Campo | Tipo | Notas |
|---|---|---|
| `id` | `string` | uuid |
| `sessionId` | `string` | **indexado** |
| `workoutExerciseId` | `string` | **indexado** |
| `exerciseId` | `string` | **indexado**, desnormalizado para PR/gráficas |
| `routineId` | `string` | **indexado**, desnormalizado para gráficas por rutina |
| `setIndex` | `number` | 0-based |
| `weightKg` | `number \| null` | **siempre en kg** |
| `reps` | `number \| null` | |
| `isCompleted` | `boolean` | la marca ✓ |
| `isPrefilled` | `boolean` | `true` mientras no la toque el usuario |
| `performedAt` | `number` | copia de `session.startedAt`, para ordenar sin join |

Índices compuestos: `[exerciseId+performedAt]` (consulta más frecuente: historial/gráfica de
un ejercicio) y `[exerciseId+routineId]` (gráfica por rutina).

### `BodyEntry` — registro corporal

| Campo | Tipo | Notas |
|---|---|---|
| `id` | `string` | uuid |
| `date` | `string` | `YYYY-MM-DD`, **único e indexado** |
| `weightKg` / `bodyFatPct` | `number \| null` | |
| `photoIds` | `string[]` | |
| `note` | `string \| null` | |
| `createdAt` / `updatedAt` | `number` | |

`date` es texto, no timestamp: evita que el registro salte de día por cambio de zona
horaria/horario de verano.

### `Photo` — imágenes

| Campo | Tipo | Notas |
|---|---|---|
| `id` | `string` | uuid |
| `blob` | `Blob` | JPEG comprimido |
| `width` / `height` | `number` | |
| `bytes` | `number` | para la pantalla de almacenamiento |
| `kind` | `'exercise'\|'body'` | |
| `createdAt` | `number` | |

**Compresión obligatoria:** redimensionar con `canvas` a máx. **1280 px** en el lado mayor,
JPEG calidad **0,75**. Sin comprimir, una foto de iPhone pesa 3-5 MB (comprimida, 150-250 KB);
20 fotos sin comprimir llenarían la cuota de IndexedDB de Safari. Al mostrar miniatura, usar
`URL.createObjectURL` y `URL.revokeObjectURL` al desmontar (si no, fuga de memoria).

### `PersonalRecord` — caché del PR

Derivada de `SessionSet`, reconstruible desde cero en cualquier momento; existe solo por
velocidad.

| Campo | Tipo | Notas |
|---|---|---|
| `exerciseId` | `string` | clave primaria |
| `weightKg` | `number` | peso más alto jamás levantado |
| `reps` | `number` | reps de esa misma serie |
| `sessionId` / `routineId` | `string` | dónde ocurrió |
| `achievedAt` | `number` | |

**Actualización:** al guardar una serie con peso+reps, si `weightKg` supera el PR, se
reemplaza. **Empate a peso**: gana más repeticiones; si también empatan, se conserva el
registro más antiguo. Al **editar** una sesión pasada o **borrar** una rutina, el PR afectado
se **recalcula desde cero** sobre todas sus `SessionSet` (nunca ajustar incrementalmente).
Serie con `weightKg` null o `reps` 0 nunca cuenta.

---

## Algoritmos

### Conversión de unidades

```
kgToLb(kg) = kg * 2.20462262185
lbToKg(lb) = lb / 2.20462262185
```

- Mostrar en libras: redondear a 0,5 lb. Mostrar en kilos: redondear a 0,5 kg (0,25 si hace
  falta).
- Introducir en libras: convertir a kg y guardar **sin redondear** (redondear al guardar
  degrada el valor en cada cambio de unidad).
- El campo acepta coma o punto decimal.

### Repeticiones fuera de rango

```
estaFueraDeRango(reps, repMin, repMax):
    si repMin o repMax es null → false
    si reps es null o 0 → false
    devolver reps < repMin o reps > repMax
```

Toda la interfaz llama a **esta única función**. Cambiar la política es modificar solo esto.

### Avance automático de variante

Solo si `routine.variantCount > 1`.

```
alCompletarSesión(sesión):
    rutina = rutina de la sesión
    si rutina.variantCount == 1 → salir
    si sesión.workoutId no está en cycleCompletedWorkoutIds → añadirlo
    entrenosDeLaVariante = entrenos con variantIndex == currentVariantIndex
    si todos sus ids están en cycleCompletedWorkoutIds:
        currentVariantIndex = (currentVariantIndex + 1) % variantCount
        cycleCompletedWorkoutIds = []
        manualVariantIndex = null
```

Variante mostrada = `manualVariantIndex ?? currentVariantIndex`. Elegir una a mano fija
`manualVariantIndex` y muestra "Has cambiado la variante a mano"; "Volver a la sugerida" lo
pone a `null`.

**Por qué por entrenos y no por fechas:** contar semanas naturales se desincroniza en cuanto se
descansa una semana, hay viaje o se entrena en desorden (lo normal). Contar entrenos
completados sigue el ritmo real.

**Caso límite:** añadir un entreno nuevo a la variante en curso cuando el ciclo casi había
cerrado deja ese entreno pendiente y el ciclo tarda más en cerrar — es correcto.

### Precarga de la sesión anterior

Al abrir un ejercicio en modo sesión:

```
paraCadaSerie i de 0 a targetSets-1:
    si ya existe SessionSet de esta sesión con setIndex==i → usarlo
    si no:
        buscar la última sesión anterior de este workoutExerciseId
        si tiene serie con setIndex==i → crear SessionSet con su weightKg/reps, isPrefilled=true
        si no → crear SessionSet vacío, isPrefilled=false
```

Al modificar un campo, `isPrefilled` pasa a `false`. La interfaz pinta en gris las series con
`isPrefilled=true`, en blanco las demás.

### Datos de la gráfica de un ejercicio

```
puntosDeLaGráfica(exerciseId, routineId, desde, hasta):
    series = SessionSet con exerciseId, routineId, performedAt en rango, weightKg != null
    agrupar por día → { fecha, pesoMáximo, repsDeEsaSerie }
    ordenar por fecha ascendente
```

Si el ejercicio se repite el mismo día (dos sesiones), se agrupan en un punto con el peso
máximo del día.

### Tramo activo de una rutina

Para las marcas verticales de "Mi progreso". No se guarda, se calcula:

```
tramoDeLaRutina(routineId):
    inicio = startedAt de la sesión más antigua
    fin = archivedAt si existe, si no startedAt de la sesión más reciente
    sin sesiones → la rutina no se dibuja
```

Una rutina archivada (`archivedAt`, vía "Terminar rutina") baja al final de Inicio, nombre en
`--text-secondary`, no se puede entrenar hasta reactivar. Historial y gráficas intactos.

### Sugerencias de materiales

Sin tabla de materiales: al escribir, se consultan todos los `Workout`, se aplanan sus
`materials`, se deduplican sin distinguir mayúsculas y se filtran por lo escrito. Instantáneo
con decenas de entrenos, evita una tabla más que sincronizar.

---

## Catálogo base de ejercicios

Sembrado al primer arranque, `isBuiltIn = true`, ~60 en español por grupo muscular:

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

El usuario no puede editar ni borrar el catálogo base, solo crear una copia con otro nombre.
Los suyos llevan `isBuiltIn = false` y son totalmente editables.

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

- Fotos en base64 dentro del mismo archivo: pesa varios MB pero es autocontenido.
- Al importar: validar `app`/`schemaVersion`, mostrar resumen, y solo entonces **borrar todo y
  sustituir**. Nunca fusionar (duplicaría sesiones, imposible de deshacer).
- Antes de sustituir, se genera copia automática de los datos actuales bajo clave aparte en
  IndexedDB, recuperable 7 días.
- Nombre de archivo con fecha: `mi-rutina-2026-08-01.json`.

---

## Migraciones

Dexie versiona el esquema: cada cambio incrementa la versión y añade
`.version(n).stores({...}).upgrade(tx => {...})`.

**Nunca** cambiar el significado de un campo existente — crear uno nuevo y migrar los datos. Un
usuario con seis meses de historial no puede perderlo por un cambio de esquema.
