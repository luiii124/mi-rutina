# Mi Rutina — Cómo desarrollamos esto

Complementa a `CLAUDE.md`. Si algo aquí contradice a `CLAUDE.md`, gana `CLAUDE.md`.

---

## No hacer `git push` en cada cambio

Desde agosto de 2026, **no se despliega a Netlify después de cada arreglo o funcionalidad
pequeña**. Se agrupan varios cambios (aprox. cada 2-3 fases del `ROADMAP.md`, o cuando el
usuario lo pida explícitamente) y se despliega todo junto.

**Por qué:** la cuenta de Netlify es gratuita, con un límite mensual de "créditos" (ancho de
banda + minutos de compilación). Cada `git push` dispara una compilación completa en sus
servidores. Durante un día de desarrollo muy activo, muchos pushes seguidos gastaron el 50% del
límite mensual en unas horas. No hay tarjeta asociada a la cuenta, así que no hay riesgo de
cobro — pero si se agota, Netlify deja de aceptar despliegues nuevos hasta el mes siguiente
(el sitio ya publicado sigue funcionando igual).

**Netlify sigue siendo la versión "de verdad".** Es la URL que el usuario tiene instalada en la
pantalla de inicio de su iPhone (`https://mi-rutina-gimnasio.netlify.app`), y la única forma de
validar de verdad: instalación como PWA, modo sin conexión real, comportamiento táctil final.
Antes de dar una fase por cerrada de verdad, debería probarse ahí, no solo en local.

---

## Desarrollo y pruebas en local (sin gastar Netlify)

Para poder probar en el iPhone del usuario sin desplegar, el proyecto tiene HTTPS local
mediante **mkcert**. Sin HTTPS de verdad, funciones como `crypto.randomUUID()` fallan en
Safari por no ser un "contexto seguro" (ver `RIESGOS.md` si hiciera falta explicarlo de nuevo).

Configuración ya hecha (no repetir salvo que algo se rompa):

- `mkcert` instalado en el PC vía `winget install FiloSottile.mkcert`, con su autoridad de
  certificación instalada y confiada en Windows (`mkcert -install`).
- Certificado generado para `localhost`, `127.0.0.1` y la IP local del PC, guardado en
  `.certs/` (está en `.gitignore`, **nunca** se sube al repositorio — contiene una clave
  privada).
- `vite.config.ts` sirve por HTTPS con ese certificado si los archivos existen en `.certs/`
  (si no existen, cae automáticamente a HTTP normal — así el repo funciona igual en otro PC).
- El iPhone del usuario tiene instalada y confía en esa misma autoridad de certificación
  (Ajustes → General → VPN y gestión de dispositivos → instalar el perfil, y luego Ajustes →
  General → Información → Ajustes de confianza de certificados → activarlo). Es un paso manual
  hecho una sola vez en ese móvil; si se reinstala el iPhone o se borra el perfil, hay que
  repetirlo (instrucciones completas en el historial de esta conversación si hace falta).

**Para arrancar:** `npm run dev -- --host`, y desde el iPhone (misma wifi que el PC) abrir
`https://<IP-local-del-PC>:5173`. La IP puede cambiar si el router se la reasigna; comprobar con
`ipconfig` si deja de cargar.

**No activar `devOptions.enabled` en el plugin `VitePWA`** (`vite.config.ts`). Se probó para
poder testear el modo sin conexión también en local, pero causó una pantalla en blanco en el
iPhone (el service worker de desarrollo interfería con la carga de la app). Si hace falta probar
el modo sin conexión de verdad, usar la versión de Netlify.

---

## Cómo prefiere trabajar el usuario

- **No sabe programar.** Explica en lenguaje llano el porqué antes de tocar nada técnico
  (certificados, créditos de hosting, límites de las PWA...), no des por hecho que conoce el
  vocabulario.
- **Prueba de verdad en su iPhone** entre cambios, no se conforma con "compila y pasan los
  tests" — esas comprobaciones son necesarias pero no sustituyen la prueba real en el móvil.
- Da **feedback muy concreto** sobre UX (posición exacta de un botón, un gesto que no responde,
  una safe area). Tomarlo literal, no sobre-interpretar ni ampliar el alcance sin preguntar.
- Cuando pide algo técnicamente inviable o con una contrapartida real (pausar audio de otra
  app, redirigir al Temporizador nativo de iOS...), quiere que se le explique el motivo y las
  alternativas honestamente, y decide él con esa información — no implementar callejones sin
  salida sin avisar antes.
- Le preocupa el coste de servicios externos aunque el proyecto sea personal y gratuito por
  diseño (ver la sección de Netlify arriba) — merece la pena avisar de forma proactiva de qué
  consume recursos y qué no, antes de que pregunte.
