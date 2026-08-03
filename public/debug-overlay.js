window.addEventListener('error', function (e) {
  mostrarErrorDeDepuracion(e.message + '\n' + (e.error && e.error.stack || ''))
})
window.addEventListener('unhandledrejection', function (e) {
  mostrarErrorDeDepuracion('Promesa rechazada: ' + (e.reason && (e.reason.stack || e.reason.message || e.reason)))
})
function mostrarErrorDeDepuracion(texto) {
  var div = document.createElement('pre')
  div.style.cssText = 'position:fixed;inset:0;background:#000;color:#0f0;padding:16px;font-size:12px;white-space:pre-wrap;z-index:99999;overflow:auto;margin:0;'
  div.textContent = texto
  document.body.appendChild(div)
}
