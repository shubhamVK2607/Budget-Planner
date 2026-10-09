export type Theme = 'light' | 'dark'
export type Language = 'en' | 'hi'
export type Settings = { theme: Theme; language: Language }

const KEY = 'budget-planner-settings'
export const DEFAULT_SETTINGS: Settings = { theme: 'light', language: 'en' }

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const p = JSON.parse(raw)
      return {
        theme: p.theme === 'dark' ? 'dark' : 'light',
        language: p.language === 'hi' ? 'hi' : 'en',
      }
    }
  } catch {
    // kharab data ho to default pe wapas
  }
  return DEFAULT_SETTINGS
}

export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(settings))
  } catch {
    // storage band ho to bhi app chalti rahe
  }
}

export function applyTheme(theme: Theme): void {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', theme === 'dark' ? '#0f172a' : '#4f46e5')
}