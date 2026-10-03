import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatMonth } from '../../shared/utils/date'

type Props = {
  month: string
  canPrev: boolean
  canNext: boolean
  onPrev: () => void
  onNext: () => void
}

export default function MonthHeader({ month, canPrev, canNext, onPrev, onNext }: Props) {
  return (
    <div className="flex items-center justify-center gap-2 px-5 pt-5">
      <button disabled={!canPrev} onClick={onPrev} className="rounded-full p-2 text-slate-700 disabled:opacity-20">
        <ChevronLeft size={22} />
      </button>
      <h1 className="min-w-[160px] text-center text-xl font-bold">{formatMonth(month)}</h1>
      <button disabled={!canNext} onClick={onNext} className="rounded-full  cursor-pointer p-2 text-slate-700 disabled:opacity-20">
        <ChevronRight size={22} />
      </button>
    </div>
  )
}