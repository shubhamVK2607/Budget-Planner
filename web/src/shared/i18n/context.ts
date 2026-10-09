import { createContext, useContext } from 'react'
import type { Language, Settings } from '../../services/settings'
import type { Category } from '../types'
import type { Dict } from './en'

export type SettingsValue = {
  settings: Settings
  update: (patch: Partial<Settings>) => void
  t: Dict
  lang: Language
  locale: string
  catName: (category: Category) => string
}

export const SettingsContext = createContext<SettingsValue | null>(null)

function useSettingsContext(): SettingsValue {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('Settings context missing: wrap the app in SettingsProvider')
  return ctx
}

export function useI18n() {
  const { t, lang, locale, catName } = useSettingsContext()
  return { t, lang, locale, catName }
}

export function useSettings() {
  const { settings, update } = useSettingsContext()
  return { settings, update }
}