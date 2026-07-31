import { useCallback, useEffect, useRef, useState } from 'react'

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

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => getStoredTheme() ?? getSystemTheme())
  const hasExplicitChoice = useRef(getStoredTheme() !== null)

  useEffect(() => {
    const mql = window.matchMedia(MEDIA_QUERY)
    const listener = (event: MediaQueryListEvent) => {
      if (hasExplicitChoice.current) {
        return
      }
      setTheme(event.matches ? 'dark' : 'light')
    }
    mql.addEventListener('change', listener)
    return () => mql.removeEventListener('change', listener)
  }, [])

  const toggle = useCallback(() => {
    hasExplicitChoice.current = true
    setTheme((prev) => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark'
      localStorage.setItem(STORAGE_KEY, next)
      applyTheme(next)
      return next
    })
  }, [])

  return { theme, toggle }
}
