import '@testing-library/jest-dom/vitest'

// jsdom doesn't implement matchMedia. Individual tests can still override
// window.matchMedia with their own mock when they need to control it.
if (!window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })
}
