import type { ReactNode } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { formatFullDate, formatWeekday, getToday } from '../../shared/utils/date'

type Props = {
  date: string
  canPrevDay: boolean
  canNextDay: boolean
  canPrevMonth: boolean
  canNextMonth: boolean
  onPrevDay: () => void
  onNextDay: () => void
  onPrevMonth: () => void
  onNextMonth: () => void
  onOpenCalendar: () => void
}

function NavButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string
  disabled: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="rounded-full p-2 text-slate-700 disabled:opacity-20"
    >
      {children}
    </button>
  )
}

export default function DateHeader({
  date,
  canPrevDay,
  canNextDay,
  canPrevMonth,
  canNextMonth,
  onPrevDay,
  onNextDay,
  onPrevMonth,
  onNextMonth,
  onOpenCalendar,
}: Props) {
  const weekday = formatWeekday(date)
  const subtitle = date === getToday() ? `Today · ${weekday}` : weekday

  return (
    <div className="flex items-center justify-between px-3 pt-4">
      <div className="flex">
        <NavButton label="Previous month" disabled={!canPrevMonth} onClick={onPrevMonth}>
          <ChevronsLeft size={20} />
        </NavButton>
        <NavButton label="Previous day" disabled={!canPrevDay} onClick={onPrevDay}>
          <ChevronLeft size={20} />
        </NavButton>
      </div>

      <button onClick={onOpenCalendar} aria-label="Open calendar" className="flex flex-col items-center rounded-xl px-2 py-1">
        <span className="flex items-center gap-1.5 text-lg font-bold">
          {formatFullDate(date)}
          <CalendarDays size={20} className="text-slate-500" />
        </span>
        <span className="text-xs text-slate-500">{subtitle}</span>
      </button>

      <div className="flex">
        <NavButton label="Next day" disabled={!canNextDay} onClick={onNextDay}>
          <ChevronRight size={20} />
        </NavButton>
        <NavButton label="Next month" disabled={!canNextMonth} onClick={onNextMonth}>
          <ChevronsRight size={20} />
        </NavButton>
      </div>
    </div>
  )
}