# Mi Rutina — Contexto del proyecto

Este archivo es la fuente de verdad permanente. Léelo entero antes de tocar código.
Si algo aquí contradice a otro documento, gana este archivo.

---

## Qué es

App de entrenamiento personal para el gimnasio. El usuario crea rutinas, define los
entrenos de cada rutina (torso, espalda, pierna...), los ejercicios de cada entreno, y
durante la sesión va anotando el peso y las repeticiones de cada serie. La app guarda
todas las sesiones anteriores para mostrar la progresión en gráficas y el récord personal
de cada ejercicio.

Es una app de un solo usuario, sin cuentas, sin servidor y sin conexión a internet.

---

## Formato: PWA instalable

Se construye como **Progressive Web App**: una aplicación web que el usuario añade a la
pantalla de inicio de su iPhone desde Safari y que a partir de ahí se comporta como una app
nativa (icono propio, pantalla completa sin barra de navegador, funciona sin internet).

Motivo: el usuario desarrolla en Windows y no tiene Mac, por lo que no puede compilar una app
iOS nativa. La PWA es la única vía que da una app instalable en iPhone sin Mac ni coste.

**Implicaciones que debes respetar siempre:**

- El objetivo de dispositivo es **iPhone en Safari, en modo standalone**. Todo se prueba
  pensando en pantalla de 390×844 px. No hay que optimizar para escritorio, pero la app no
  debe romperse en pantallas anchas: se centra con un ancho máximo de 480 px.
- Debe funcionar **100% sin internet** después de la primera carga.
- **Nunca** introduzcas dependencias de red en tiempo de ejecución: nada de fuentes de Google
  Fonts, CDNs, APIs externas, analytics ni telemetría. Todo se empaqueta.
- Respeta las *safe areas* de iOS (`env(safe-area-inset-*)`), sobre todo abajo, donde va la
  barra de navegación del ejercicio.

---

## Stack

| Pieza | Elección | Por qué |
|---|---|---|
| Build | Vite | Rápido, config mínima, soporte PWA maduro |
| Lenguaje | TypeScript, modo `strict` | El modelo de datos tiene bastantes relaciones; sin tipos se rompe |
| UI | React 18 | |
| Estilos | Tailwind CSS | Paleta y espaciado consistentes sin CSS suelto |
| Rutas | React Router (`createHashRouter`) | Hash routing evita problemas de rutas en standalone y en hosting estático |
| Base de datos | Dexie.js sobre IndexedDB | Necesitamos guardar blobs de fotos y consultar historial por ejercicio |
| Gráficas | Recharts | Integración natural con React, suficiente para una gráfica de líneas |
| PWA | `vite-plugin-pwa` (Workbox) | Genera manifest y service worker |
| Reordenar | `@dnd-kit/core` + `@dnd-kit/sortable` | Arrastrar y soltar entrenos y ejercicios (Fase 2 y 3), ligera y sin llamadas de red |
| Tests | Vitest | Solo para la lógica pura (ver abajo) |

No añadas librerías fuera de esta lista sin justificarlo primero. En concreto: nada de
librerías de estado global (Redux, Zustand, Jotai) — Dexie con `useLiveQuery` ya da
reactividad sobre la base de datos y es suficiente.

---

## Decisiones cerradas

Estas ya están discutidas con el usuario. **No las replantees ni propongas alternativas.**

1. **Solo modo oscuro.** Fondo negro, textos y elementos en blanco y grises. No hay color de
   acento. El **único** color de toda la app es el rojo, y se reserva exclusivamente para las
   repeticiones fuera del rango objetivo.
2. **Repeticiones fuera de rango en rojo, por arriba y por abajo.** Si el rango es 8-12, tanto
   6 como 14 se pintan en rojo. (Ver nota en `RIESGOS.md`: está aislado en una sola función
   para poder cambiarlo fácil.)
3. **Unidad global**, kg o lb, configurable en Ajustes. Internamente **todo se almacena
   siempre en kilogramos**; la conversión ocurre solo al mostrar y al introducir.
4. **PR = el peso más alto jamás levantado en ese ejercicio**, mostrado junto a las
   repeticiones de esa serie (ej. "112,5 kg × 3"). El PR es **universal**: se calcula sobre
   todas las sesiones de todas las rutinas.
5. **Las gráficas están separadas por rutina.** Eje horizontal: fechas de las sesiones. Eje
   vertical: peso máximo de ese ejercicio en esa sesión.
6. **Los ejercicios se comparten entre rutinas** (mismo nombre, misma foto, mismo PR, mismo
   historial), pero la **nota, el número de series y el rango de repeticiones son propios de
   cada rutina**.
7. **Las medidas corporales (peso, % de grasa, fotos) son globales**, en su propia sección
   "Mi progreso". No cuelgan de ninguna rutina.
8. **Al abrir un ejercicio en sesión, los campos vienen precargados con la última sesión**,
   en gris, y el usuario los sobrescribe.
9. **Las variantes de rutina avanzan automáticamente**, con posibilidad de corregir la
   variante a mano desde la cabecera de la rutina.
10. **Entra en la v1**: temporizador de descanso, notas rápidas de sesión, marcar ejercicio
    como completado (y el entreno se marca solo cuando todos lo están).

---

## Reglas de trabajo

**Antes de empezar cualquier fase:** lee `ROADMAP.md` y confirma en qué fase estás. Construye
las fases **en orden**. No adelantes trabajo de fases posteriores aunque parezca fácil.

**Al terminar cada fase:** para, resume qué has hecho y espera confirmación del usuario antes
de seguir. El usuario quiere probar en el móvil entre fase y fase.

**Cuando algo no esté especificado:** pregunta antes de inventar. Es preferible una pregunta a
una funcionalidad que hay que rehacer. Si es una decisión menor de implementación (nombre de
una variable, estructura de una carpeta), decide tú y sigue.

**Tests:** escribe tests con Vitest **solo** para lógica pura y crítica:

- conversión kg ↔ lb (ida y vuelta sin pérdida)
- cálculo del PR de un ejercicio
- detección de repeticiones fuera de rango
- lógica de avance automático de variante

No escribas tests de componentes ni end-to-end. No aportan aquí y ralentizan.

**Commits:** uno por unidad de trabajo coherente, mensaje en español, imperativo y corto.
Ejemplo: `Añade temporizador de descanso configurable por ejercicio`.

---

## Lo que NO debes hacer

- No añadas login, registro, cuentas ni nada que requiera servidor.
- No añadas sincronización en la nube, backend ni base de datos remota.
- No añadas anuncios, suscripciones, paywalls ni analítica.
- No añadas funciones "que estaría bien tener" que no estén en `SPEC.md`. Si se te ocurre
  algo, apúntalo en la lista de ideas al final de `ROADMAP.md` y sigue.
- No uses `localStorage` para los datos de entrenamiento. Solo IndexedDB (Dexie). `localStorage`
  únicamente para preferencias triviales de interfaz si hiciera falta.
- No conviertas pesos a libras en la base de datos. Nunca. Se guarda en kg.
- No borres ni sobrescribas sesiones históricas. Los datos pasados son inmutables salvo que el
  usuario edite explícitamente una sesión concreta.
- No uses emojis en la interfaz.

---

## Riesgo crítico que debes tener presente siempre

En iOS, Safari **puede borrar los datos de una PWA** si el usuario no la abre durante unas
semanas. Esto no es hipotético.

Mitigaciones obligatorias, ambas en la Fase 1:

1. Llamar a `navigator.storage.persist()` en el primer arranque (reduce mucho la probabilidad
   de purga).
2. Implementar **exportar / importar copia de seguridad** en JSON, con las fotos incluidas en
   base64. El usuario debe poder guardar ese archivo en Archivos o iCloud Drive.

Además, cuando hayan pasado más de 30 días desde la última copia, la pantalla de Ajustes
muestra un aviso discreto recordándolo. Sin ventanas emergentes agresivas.

---

## Estructura de archivos sugerida

```
src/
  db/           esquema Dexie, migraciones, semillas del catálogo
  domain/       lógica pura: PR, rangos, variantes, conversión de unidades
  hooks/        hooks de datos sobre Dexie
  components/   componentes reutilizables (botón, campo, tabla de series...)
  screens/      una carpeta por pantalla
  styles/       tokens de Tailwind y globales
  pwa/          manifest, iconos, registro del service worker
```

`domain/` no debe importar nada de React ni de Dexie. Es lógica pura y testeable.

---

## Documentos del proyecto

- `SPEC.md` — qué hace la app, pantalla a pantalla, con las reglas y los casos límite
- `DATA_MODEL.md` — entidades, campos, relaciones y algoritmos
- `DESIGN.md` — paleta, tipografía, espaciado y componentes
- `ROADMAP.md` — fases en orden con criterios de aceptación
- `RIESGOS.md` — decisiones discutibles y sus alternativas
