const MEDIA_QUERY = '(prefers-color-scheme: dark)'
const STORAGE_KEY = 'theme'

type Theme = 'light' | 'dark'

function getSystemTheme(): Theme {
  return window.matchMedia(MEDIA_QUERY).matches ? 'dark' : 'light'
}

function getStoredTheme(): Theme | null {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === 'light' || stored === 'dark' ? stored : null
}

export function useTheme() {
  return { theme: getStoredTheme() ?? getSystemTheme() }
}
