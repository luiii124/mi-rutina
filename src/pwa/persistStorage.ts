/**
 * Pide al navegador almacenamiento persistente para reducir la probabilidad de que
 * Safari borre los datos de la PWA por falta de uso. Ver RIESGOS.md, riesgo 1.
 */
export async function requestPersistentStorage(): Promise<void> {
  if (!navigator.storage?.persist) return
  const alreadyPersisted = await navigator.storage.persisted()
  if (alreadyPersisted) return
  await navigator.storage.persist()
}
