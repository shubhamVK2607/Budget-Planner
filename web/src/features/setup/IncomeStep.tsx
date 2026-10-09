import { digits, inWords, rupee } from '../../shared/utils/format'
import { useI18n } from '../../shared/i18n/context'

const QUICK_ADD = [5000, 10000, 25000, 50000]
const MAX_INCOME = 999999999

type Props = {
  value: string
  onChange: (value: string) => void
  onNext: () => void
}

export default function IncomeStep({ value, onChange, onNext }: Props) {
  const { t } = useI18n()
  const amount = Number(value) || 0
  const display = amount ? amount.toLocaleString('en-IN') : ''
  const words = inWords(amount, t.setup.units)

  const add = (n: number) => onChange(String(Math.min(amount + n, MAX_INCOME)))

  return (
    <>
      <div className="flex flex-1 flex-col justify-center pb-6">
        <h1 className="text-3xl font-bold">{t.setup.incomeTitle}</h1>
        <p className="mt-2 text-slate-500">{t.setup.incomeSub}</p>

        <div className="mt-8 flex items-baseline justify-center gap-1 border-b-2 border-slate-200 pb-2 focus-within:border-indigo-500">
          <span className="text-2xl font-semibold text-slate-400">₹</span>
          <input
            autoFocus
            inputMode="numeric"
            placeholder="0"
            value={display}
            onChange={(e) => onChange(digits(e.target.value).slice(0, 9))}
            onKeyDown={(e) => e.key === 'Enter' && amount > 0 && onNext()}
            style={{ width: `${Math.max(display.length, 1)}ch` }}
            className="max-w-[80%] bg-transparent text-center text-3xl font-bold outline-none placeholder:text-slate-300"
          />
        </div>
        <div className="mt-2 h-6 text-center font-medium text-indigo-600">{words}</div>

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {QUICK_ADD.map((n) => (
            <button
              key={n}
              onClick={() => add(n)}
              className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 active:scale-95 active:bg-indigo-100"
            >
              + {rupee(n)}
            </button>
          ))}
          {amount > 0 && (
            <button
              onClick={() => onChange('')}
              className="rounded-full px-4 py-2 text-sm font-medium text-slate-400 active:scale-95"
            >
              {t.common.clear}
            </button>
          )}
        </div>

        <div className="mt-8 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
          <div className="mb-1 font-semibold text-slate-700">{t.setup.whatNext}</div>
          <div>{t.setup.next1}</div>
          <div>{t.setup.next2}</div>
          <div>{t.setup.next3}</div>
        </div>
      </div>

      <button
        disabled={amount <= 0}
        onClick={onNext}
        className="w-full rounded-xl bg-indigo-600 py-4 text-lg font-semibold text-white disabled:bg-slate-300"
      >
        {t.common.next}
      </button>
    </>
  )
}