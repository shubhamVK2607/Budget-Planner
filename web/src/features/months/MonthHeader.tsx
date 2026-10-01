import { formatMonth } from '../../shared/utils/date'

type Props = {
  month: string
  canPrev: boolean
  canNext: boolean
  onPrev: () => void
  onNext: () => void
  onSettings?: () => void
}

export default function MonthHeader({ month, canPrev, canNext, onPrev, onNext, onSettings }: Props) {
  return (
    <div className="flex items-center justify-between px-5 pt-5">
      <div className="flex items-center gap-1">
        <button disabled={!canPrev} onClick={onPrev} className="px-2 text-xl disabled:opacity-20">
          ◀
        </button>
        <h1 className="min-w-[150px] text-center text-xl font-bold">{formatMonth(month)}</h1>
        <button disabled={!canNext} onClick={onNext} className="px-2 text-xl disabled:opacity-20">
          ▶
        </button>
      </div>
      {onSettings && (
        <button className="text-2xl" onClick={onSettings}>
          ⚙️
        </button>
      )}
    </div>
  )
}