import { en } from './en'
import type { Dict } from './en'
import { hi } from './hi'
import type { Language } from '../../services/settings'

export const dictionaries: Record<Language, Dict> = { en, hi }
export const LOCALES: Record<Language, string> = { en: 'en-IN', hi: 'hi-IN' }

export function fixedItemLabel(name: string, language: Language): string {
	const englishIndex = en.setup.suggestions.indexOf(name)
	const hindiIndex = hi.setup.suggestions.indexOf(name)
	const suggestionIndex = englishIndex >= 0 ? englishIndex : hindiIndex

	return suggestionIndex >= 0 ? dictionaries[language].setup.suggestions[suggestionIndex] ?? name : name
}