# Cómo arrancar con Claude Code

## Antes de nada

1. Crea una carpeta en tu PC, por ejemplo `C:\proyectos\mi-rutina`
2. Copia dentro los cinco archivos: `CLAUDE.md`, `SPEC.md`, `DATA_MODEL.md`, `DESIGN.md`,
   `ROADMAP.md`, `RIESGOS.md`
3. Instala Node.js si no lo tienes (versión 20 o superior, desde nodejs.org)
4. Abre una terminal en esa carpeta y ejecuta `claude`

---

## Prompt de la primera sesión

Copia esto tal cual:

> Este es un proyecto nuevo. Lee `CLAUDE.md`, `SPEC.md`, `DATA_MODEL.md`, `DESIGN.md`,
> `ROADMAP.md` y `RIESGOS.md` enteros antes de escribir una sola línea de código.
>
> Cuando los hayas leído, no empieces a construir todavía. Primero dime:
>
> 1. Un resumen en cinco líneas de qué has entendido que es la app.
> 2. Las contradicciones o huecos que hayas encontrado entre los documentos.
> 3. Las decisiones de implementación que crees que debería tomar yo y que no están cubiertas.
>
> Después de que yo responda, empieza **solo** por la Fase 0 del `ROADMAP.md`. Cuando la
> termines, para y espera a que la pruebe en el móvil.

Ese "no empieces todavía" importa. Claude Code tiende a ponerse a construir; obligarle a
resumir primero es la forma más barata de detectar que ha entendido algo al revés.

---

## Prompt para las fases siguientes

> Fase 0 probada y funcionando. Empieza la Fase 1 del `ROADMAP.md`. Cuando la termines, para y
> dime qué has hecho y cómo lo pruebo.

Sustituye el número en cada fase. Si algo de la fase anterior falla, arréglalo antes de avanzar
— no acumules deuda entre fases.

---

## Prompt para cuando algo no te guste

Sé concreto sobre el síntoma, no sobre la solución:

> En la pantalla del ejercicio, la tabla de series queda tapada por el teclado cuando enfoco la
> última fila. Léete la sección "Ejercicio en sesión" de `SPEC.md` y el punto 3 de `RIESGOS.md`,
> y arréglalo.

Mal: "haz que la tabla suba". Bien: describir qué pasa y dejar que él decida cómo.

---

## Prompt para publicar la app

Cuando termines la Fase 0, ya te interesa desplegarla para que funcione sin conexión:

> Necesito desplegar esto para poder instalarlo en mi iPhone con HTTPS. Guíame paso a paso para
> subirlo a GitHub y conectarlo a Netlify, asumiendo que no he usado ninguna de las dos cosas
> nunca. Dime exactamente qué escribir en la terminal y qué pulsar en cada web.

---

## Dos cosas que te ahorrarán disgustos

**Usa git desde el primer día.** Si Claude Code rompe algo, `git checkout .` te devuelve al
estado anterior en un segundo. Pídele en la Fase 0 que inicialice el repositorio y haga un
commit al final de cada fase.

**Exporta una copia de seguridad en cuanto tengas datos reales.** En cuanto empieces a usar la
app en el gimnasio de verdad, esos datos solo existen en tu móvil. Una copia al mes en iCloud
Drive y te olvidas del problema.
