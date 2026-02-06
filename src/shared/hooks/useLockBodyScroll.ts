import { useEffect } from 'react'

/**
 * Блокирует скролл страницы при открытой шторке/модалке.
 * Устанавливает overflow: hidden на html и body, на мобильных — position: fixed на body
 * с сохранением позиции скролла для корректного восстановления при закрытии.
 */
export function useLockBodyScroll(locked: boolean): void {
  useEffect(() => {
    if (!locked) return

    const scrollY = window.scrollY
    const { style: htmlStyle } = document.documentElement
    const { style: bodyStyle } = document.body

    const prevHtmlOverflow = htmlStyle.overflow
    const prevBodyOverflow = bodyStyle.overflow
    const prevBodyPosition = bodyStyle.position
    const prevBodyTop = bodyStyle.top
    const prevBodyLeft = bodyStyle.left
    const prevBodyRight = bodyStyle.right
    const prevBodyWidth = bodyStyle.width

    htmlStyle.overflow = 'hidden'
    bodyStyle.overflow = 'hidden'
    bodyStyle.position = 'fixed'
    bodyStyle.top = `-${scrollY}px`
    bodyStyle.left = '0'
    bodyStyle.right = '0'
    bodyStyle.width = '100%'

    return () => {
      htmlStyle.overflow = prevHtmlOverflow
      bodyStyle.overflow = prevBodyOverflow
      bodyStyle.position = prevBodyPosition
      bodyStyle.top = prevBodyTop
      bodyStyle.left = prevBodyLeft
      bodyStyle.right = prevBodyRight
      bodyStyle.width = prevBodyWidth
      window.scrollTo(0, scrollY)
    }
  }, [locked])
}
