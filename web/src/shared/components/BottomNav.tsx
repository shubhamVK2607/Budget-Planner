import { ChartPie, House, Settings } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useI18n } from '../i18n/context'

export type Tab = 'home' | 'insights' | 'settings'

const tabs: { id: Tab; Icon: LucideIcon }[] = [
  { id: 'home', Icon: House },
  { id: 'insights', Icon: ChartPie },
  { id: 'settings', Icon: Settings },
]

type Props = { active: Tab; onChange: (tab: Tab) => void }

export default function BottomNav({ active, onChange }: Props) {
  const { t } = useI18n()

  return (
    <nav className="fixed bottom-0 left-1/2 z-10 flex w-full max-w-[480px] -translate-x-1/2 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)]">
      {tabs.map(({ id, Icon }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-medium ${
            active === id ? 'text-indigo-600' : 'text-slate-400'
          }`}
        >
          <Icon size={22} />
          {t.nav[id]}
        </button>
      ))}
    </nav>
  )
}