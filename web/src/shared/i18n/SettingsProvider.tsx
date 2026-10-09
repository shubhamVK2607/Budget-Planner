import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { applyTheme, loadSettings, saveSettings } from '../../services/settings'
import type { Settings } from '../../services/settings'
import type { Category } from '../types'
import { SettingsContext } from './context'
import { dictionaries, LOCALES } from './dictionaries'

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(loadSettings)

  useEffect(() => {
    applyTheme(settings.theme)
    document.documentElement.lang = settings.language
    saveSettings(settings)
  }, [settings])

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...patch }))
  }, [])

  const value = useMemo(() => {
    const t = dictionaries[settings.language]
    return {
      settings,
      update,
      t,
      lang: settings.language,
      locale: LOCALES[settings.language],
      // Default categories ka naam bhasha ke hisaab se, baaki ka jo user ne likha wahi
      catName: (c: Category) => (c.key && t.defaultCategories[c.key]) || c.name,
    }
  }, [settings, update])

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}