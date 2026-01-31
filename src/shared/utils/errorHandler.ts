export function handleSupabaseError(error: unknown): string {
  if (error instanceof Error) {
    // Обработка специфичных ошибок Supabase
    if (error.message.includes('JWT')) {
      return 'Ошибка авторизации. Пожалуйста, обновите страницу.'
    }
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return 'Ошибка сети. Проверьте подключение к интернету.'
    }
    return error.message
  }
  return 'Произошла неизвестная ошибка. Попробуйте еще раз.'
}
