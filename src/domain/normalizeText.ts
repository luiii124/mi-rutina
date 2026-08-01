const DIACRITICS = /[̀-ͯ]/g

/** Minusculas y sin acentos, para busquedas insensibles a mayusculas y a acentos. */
export function normalizeText(text: string): string {
  return text.trim().toLowerCase().normalize('NFD').replace(DIACRITICS, '')
}
