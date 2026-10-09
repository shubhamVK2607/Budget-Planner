import type { ReactNode } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { formatFullDate, formatWeekday, getToday } from '../../shared/utils/date'
import { useI18n } from '../../shared/i18n/context'

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
  const { t, locale } = useI18n()
  const weekday = formatWeekday(date, locale)
  const subtitle = date === getToday() ? t.header.todayWeekday(weekday) : weekday

  return (
    <div className="flex items-center justify-between px-3 pt-4">
      <div className="flex">
        <NavButton label={t.header.prevMonth} disabled={!canPrevMonth} onClick={onPrevMonth}>
          <ChevronsLeft size={20} />
        </NavButton>
        <NavButton label={t.header.prevDay} disabled={!canPrevDay} onClick={onPrevDay}>
          <ChevronLeft size={20} />
        </NavButton>
      </div>

      <button
        onClick={onOpenCalendar}
        aria-label={t.header.openCalendar}
        className="flex flex-col items-center rounded-xl px-2 py-1"
      >
        <span className="flex items-center gap-1.5 text-lg font-bold">
          {formatFullDate(date, locale)}
          <CalendarDays size={16} className="text-slate-500" />
        </span>
        <span className="text-xs text-slate-500">{subtitle}</span>
      </button>

      <div className="flex">
        <NavButton label={t.header.nextDay} disabled={!canNextDay} onClick={onNextDay}>
          <ChevronRight size={20} />
        </NavButton>
        <NavButton label={t.header.nextMonth} disabled={!canNextMonth} onClick={onNextMonth}>
          <ChevronsRight size={20} />
        </NavButton>
      </div>
    </div>
  )
}