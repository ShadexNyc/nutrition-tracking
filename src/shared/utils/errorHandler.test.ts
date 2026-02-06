import { describe, it, expect } from 'vitest'
import { toUserMessage } from './errorHandler'

describe('errorHandler', () => {
  it('returns default message for unknown error', () => {
    expect(toUserMessage(new Error('Something internal'))).toBe(
      'Произошла неизвестная ошибка. Попробуйте еще раз.'
    )
  })

  it('returns safe message for network-like errors', () => {
    expect(toUserMessage(new Error('Network Error'))).toContain('сети')
    expect(toUserMessage(new Error('fetch failed'))).toContain('сети')
  })

  it('returns default for non-Error', () => {
    expect(toUserMessage('string')).toBe(
      'Произошла неизвестная ошибка. Попробуйте еще раз.'
    )
  })
})
