const ZERO_OFFSET = 0

const getRootFontSize = () => {
  if (typeof window === 'undefined') return 16
  const value = getComputedStyle(document.documentElement).fontSize || '16'
  const parsed = Number.parseFloat(value)
  return Number.isNaN(parsed) ? 16 : parsed
}

const parseCssSizeToPx = (value: string | null | undefined) => {
  const size = (value || '').trim()
  if (!size) return ZERO_OFFSET

  const numeric = Number.parseFloat(size)
  if (Number.isNaN(numeric)) return ZERO_OFFSET

  if (size.endsWith('rem')) {
    return numeric * getRootFontSize()
  }

  return numeric
}

export const getScrollOffsetPx = () => {
  if (typeof window === 'undefined') return ZERO_OFFSET

  const styles = getComputedStyle(document.documentElement)
  const candidates = [
    styles.getPropertyValue('--scalar-custom-header-height'),
    styles.getPropertyValue('--sl-nav-height'),
  ]

  for (const candidate of candidates) {
    const px = parseCssSizeToPx(candidate)
    if (px > ZERO_OFFSET) return px
  }

  const header = document.querySelector<HTMLElement>('body header.header')
  return header?.offsetHeight ?? ZERO_OFFSET
}

export const scrollElementIntoViewWithOffset = (element: Element, behavior: ScrollBehavior = 'auto') => {
  if (typeof window === 'undefined') return
  const headerOffset = getScrollOffsetPx()
  const elementTop = element.getBoundingClientRect().top + window.scrollY
  const targetTop = Math.max(elementTop - headerOffset, ZERO_OFFSET)

  if (Math.abs(window.scrollY - targetTop) <= 1) {
    return
  }

  window.scrollTo({ top: targetTop, behavior })
}
