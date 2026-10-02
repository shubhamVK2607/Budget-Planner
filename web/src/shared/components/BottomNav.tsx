import { CalendarDays, House, LayoutGrid, Settings } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type Tab = 'home' | 'calendar' | 'categories' | 'settings'

const tabs: { id: Tab; label: string; Icon: LucideIcon }[] = [
  { id: 'home', label: 'Home', Icon: House },
  { id: 'calendar', label: 'Calendar', Icon: CalendarDays },
  { id: 'categories', label: 'Categories', Icon: LayoutGrid },
  { id: 'settings', label: 'Settings', Icon: Settings },
]

type Props = { active: Tab; onChange: (tab: Tab) => void }

export default function BottomNav({ active, onChange }: Props) {
  return (
    <nav className="fixed bottom-0 left-1/2 z-10 flex w-full max-w-[480px] -translate-x-1/2 border-t border-slate-200 bg-white">
      {tabs.map(({ id, label, Icon }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-medium ${
            active === id ? 'text-indigo-600' : 'text-slate-400'
          }`}
        >
          <Icon size={22} />
          {label}
        </button>
      ))}
    </nav>
  )
}