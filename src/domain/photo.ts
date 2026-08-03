export interface Dimensiones {
  width: number
  height: number
}

/** Redimensiona manteniendo la proporcion para que el lado mayor no supere maxLado. Ver DATA_MODEL.md. */
export function calcularDimensionesRedimensionadas(width: number, height: number, maxLado = 1280): Dimensiones {
  if (width <= maxLado && height <= maxLado) return { width, height }
  const escala = maxLado / Math.max(width, height)
  return { width: Math.round(width * escala), height: Math.round(height * escala) }
}
