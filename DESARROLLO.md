# Mi Rutina — Cómo desarrollamos esto

Complementa a `CLAUDE.md`. Si algo aquí contradice a `CLAUDE.md`, gana `CLAUDE.md`.

---

## No hacer `git push` en cada cambio

Desde agosto 2026, no se despliega a Netlify tras cada arreglo pequeño. Se agrupan varios
cambios (~cada 2-3 fases del `ROADMAP.md`, o cuando el usuario lo pida explícitamente) y se
despliega todo junto.

**Por qué:** la cuenta de Netlify es gratuita con límite mensual de "créditos" (ancho de banda
+ minutos de compilación); cada `git push` dispara una build completa. Un día de desarrollo muy
activo con muchos pushes gastó el 50% del límite en horas. Sin tarjeta asociada (sin riesgo de
cobro), pero agotarlo bloquea despliegues nuevos hasta el mes siguiente (el sitio ya publicado
sigue funcionando).

**Netlify sigue siendo la versión "de verdad"**: es la URL instalada en el iPhone
(`https://mi-rutina-gimnasio.netlify.app`) y la única forma de validar instalación como PWA,
modo sin conexión real y comportamiento táctil final. Antes de cerrar una fase de verdad,
probar ahí, no solo en local.

---

## Desarrollo y pruebas en local (sin gastar Netlify)

Para probar en el iPhone sin desplegar, el proyecto usa HTTPS local con **mkcert**. Sin HTTPS
real, `crypto.randomUUID()` falla en Safari por no ser "contexto seguro" (ver `RIESGOS.md`).

Configuración ya hecha (no repetir salvo que algo se rompa):

- `mkcert` instalado (`winget install FiloSottile.mkcert`), CA instalada y confiada en Windows
  (`mkcert -install`).
- Certificado para `localhost`, `127.0.0.1` y la IP local, en `.certs/` (en `.gitignore`,
  **nunca** se sube — contiene clave privada).
- `vite.config.ts` sirve HTTPS con ese certificado si existe en `.certs/`; si no, cae a HTTP
  normal (el repo funciona igual en otro PC).
- El iPhone confía en esa CA (Ajustes → General → VPN y gestión de dispositivos → instalar
  perfil; luego Ajustes → General → Información → Ajustes de confianza de certificados →
  activarlo). Paso manual único por móvil; repetir si se reinstala el iPhone o se borra el
  perfil.

**Arrancar:** `npm run dev -- --host`, y desde el iPhone (misma wifi) abrir
`https://<IP-local-del-PC>:5173`. Si deja de cargar, comprobar la IP con `ipconfig` (puede
cambiar si el router la reasigna).

**No activar `devOptions.enabled`** en el plugin `VitePWA` (`vite.config.ts`): se probó para
testear el modo sin conexión en local, pero causó pantalla en blanco en el iPhone (el service
worker de desarrollo interfería con la carga). Para probar offline de verdad, usar Netlify.

---

## Cómo prefiere trabajar el usuario

- **No sabe programar.** Explicar en lenguaje llano el porqué antes de tocar nada técnico
  (certificados, créditos de hosting, límites de las PWA...); no dar por hecho vocabulario.
- **Prueba de verdad en su iPhone** entre cambios — "compila y pasan los tests" es necesario
  pero no sustituye la prueba real en el móvil.
- Da **feedback muy concreto** sobre UX (posición exacta de un botón, un gesto que no
  responde, una safe area). Tomarlo literal, sin sobre-interpretar ni ampliar el alcance sin
  preguntar.
- Ante algo técnicamente inviable o con contrapartida real (pausar audio de otra app,
  redirigir al Temporizador nativo...), quiere el motivo y las alternativas explicados
  honestamente, y decide él con esa información — no implementar callejones sin salida sin
  avisar.
- Le preocupa el coste de servicios externos aunque el proyecto sea gratuito por diseño (ver
  Netlify arriba) — avisar proactivamente de qué consume recursos y qué no.
