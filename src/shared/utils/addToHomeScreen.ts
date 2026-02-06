const STORAGE_KEY = 'addToHomeScreenDismissed'

export { STORAGE_KEY }

/** Проверяет, показывалась ли уже шторка «Добавить на экран». */
export function wasAddToHomeScreenDismissed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return true
  }
}
