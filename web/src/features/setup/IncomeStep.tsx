import { digits, inWords, rupee } from '../../shared/utils/format'

const QUICK_ADD = [5000, 10000, 25000, 50000]
const MAX_INCOME = 999999999

type Props = {
  value: string
  onChange: (value: string) => void
  onNext: () => void
}

export default function IncomeStep({ value, onChange, onNext }: Props) {
  const amount = Number(value) || 0
  const words = inWords(amount)

  const add = (n: number) => onChange(String(Math.min(amount + n, MAX_INCOME)))

  return (
    <>
      <div className="flex flex-1 flex-col justify-center pb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">Step 1 of 3</p>
        <h1 className="mt-1 text-2xl font-bold">What's your monthly income?</h1>
        <p className="mt-2 text-slate-500">Your salary or total earnings for this month.</p>

        <div className="mt-10 flex items-baseline justify-center gap-2 border-b-2 border-slate-200 pb-3 focus-within:border-indigo-500">
          <span className="text-4xl font-bold text-slate-300">₹</span>
          <input
            autoFocus
            inputMode="numeric"
            placeholder="0"
            value={amount ? amount.toLocaleString('en-IN') : ''}
            onChange={(e) => onChange(digits(e.target.value).slice(0, 9))}
            onKeyDown={(e) => e.key === 'Enter' && amount > 0 && onNext()}
            className="w-full min-w-0 bg-transparent text-center text-5xl font-bold outline-none placeholder:text-slate-300"
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
              Clear
            </button>
          )}
        </div>

        <div className="mt-10 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
          <div className="mb-1 font-semibold text-slate-700">What happens next</div>
          <div>1. Add your fixed bills (rent, EMI, SIP)</div>
          <div>2. We show what's left to spend</div>
          <div>3. You get a simple daily limit</div>
        </div>
      </div>

      <button
        disabled={amount <= 0}
        onClick={onNext}
        className="w-full rounded-xl bg-indigo-600 py-4 text-lg font-semibold text-white disabled:bg-slate-300"
      >
        Next
      </button>
    </>
  )
}