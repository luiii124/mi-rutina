# Mi Rutina

App personal de entrenamiento, en forma de PWA instalable. Ver `CLAUDE.md` para el contexto
completo del proyecto.

## Desarrollo

```
npm install
npm run dev
```

## Probarlo en el iPhone durante el desarrollo

1. En el PC: `npm run dev -- --host`
2. Vite muestra una dirección de red del tipo `http://192.168.1.42:5173`
3. El iPhone debe estar en la misma red wifi que el PC
4. Abrir esa dirección en Safari del iPhone
5. Botón de compartir → "Añadir a pantalla de inicio"

**Aviso:** el service worker necesita HTTPS o `localhost`. Con la dirección de red en
desarrollo la app funciona, pero el modo sin conexión no. Para probar el funcionamiento offline
real hace falta desplegarla (ver el punto de despliegue cuando termine la Fase 0).

## Comandos

- `npm run dev` — servidor de desarrollo
- `npm run build` — build de producción (comprueba tipos y genera `dist/`)
- `npm run test` — tests de Vitest
- `npm run lint` — linter
