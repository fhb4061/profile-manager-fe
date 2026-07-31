const MEDIA_QUERY = '(prefers-color-scheme: dark)'

type Theme = 'light' | 'dark'

function getSystemTheme(): Theme {
  return window.matchMedia(MEDIA_QUERY).matches ? 'dark' : 'light'
}

export function useTheme() {
  return { theme: getSystemTheme() }
}
