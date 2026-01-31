/**
 * Maps unknown errors to safe user-facing messages.
 * Never exposes raw error.message to avoid leaking internal/stack info.
 */
const SAFE_MESSAGES: Record<string, string> = {
  JWT: 'Ошибка авторизации. Пожалуйста, обновите страницу.',
  network: 'Ошибка сети. Проверьте подключение к интернету.',
  fetch: 'Ошибка сети. Проверьте подключение к интернету.',
  timeout: 'Превышено время ожидания. Попробуйте снова.',
}

const DEFAULT_MESSAGE = 'Произошла неизвестная ошибка. Попробуйте еще раз.'

export function toUserMessage(error: unknown): string {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase()
    for (const [key, text] of Object.entries(SAFE_MESSAGES)) {
      if (msg.includes(key.toLowerCase())) return text
    }
  }
  return DEFAULT_MESSAGE
}

/** @deprecated Use toUserMessage. Kept for backward compatibility with Supabase call sites. */
export function handleSupabaseError(error: unknown): string {
  return toUserMessage(error)
}
