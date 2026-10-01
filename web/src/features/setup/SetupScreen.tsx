import type { FixedItem, MonthBudget } from '../../shared/types'
import { getAutoDailyLimit, getPool } from '../budget/budget'
import { rupee, digits } from '../../shared/utils/format'
import { useState } from 'react';

type Props = {
  month: string
  initial?: MonthBudget
  onDone: (budget: MonthBudget) => void
  onCancel?: () => void
}
const inputCls =
  'w-full rounded-xl border border-slate-300 px-4 py-3 text-lg outline-none focus:border-indigo-500'
const btnCls =
  'mt-auto w-full rounded-xl bg-indigo-600 py-4 text-lg font-semibold text-white disabled:bg-slate-300'
export default function SetupScreen({ month, initial, onDone, onCancel }: Props) {
  const [step, setStep] = useState(1)
  const [income, setIncome] = useState(initial ? String(initial.income) : '')
 const [fixedItems, setFixedItems] = useState<FixedItem[]>(initial?.fixedItems ?? [])
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
 const [mode, setMode] = useState<'auto' | 'manual'>(initial?.dailyLimitMode ?? 'auto')
const [manual, setManual] = useState(initial?.manualDailyLimit ? String(initial.manualDailyLimit) : '')

  const draft: MonthBudget = {
    month,
    income: Number(income) || 0,
    fixedItems,
    dailyLimitMode: mode,
    manualDailyLimit: manual ? Number(manual) : undefined,
  }
  const pool = getPool(draft)
  const autoLimit = getAutoDailyLimit(draft)
  const manualInvalid = mode === 'manual' && (!Number(manual) || Number(manual) > autoLimit)

  const addFixed = () => {
    if (!name.trim() || !Number(amount)) return
    setFixedItems([...fixedItems, { id: crypto.randomUUID(), name: name.trim(), amount: Number(amount) }])
    setName('')
    setAmount('')
  }

  return (
    <div className="flex min-h-screen flex-col p-5">
        {onCancel && (
  <button className="mb-3 self-start text-slate-500" onClick={onCancel}>
    ← Cancel
  </button>
)}
      <div className="mb-6 flex gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`h-1.5 flex-1 rounded-full ${s <= step ? 'bg-indigo-600' : 'bg-slate-200'}`} />
        ))}
      </div>

      {step === 1 && (
        <>
          <h1 className="text-2xl font-bold">Monthly income</h1>
          <p className="mb-6 mt-1 text-slate-500">Your salary or total earnings</p>
          <input
            className={inputCls}
            inputMode="numeric"
            placeholder="₹ 1,00,000"
            value={income}
            onChange={(e) => setIncome(digits(e.target.value))}
          />
          <button className={btnCls} disabled={!Number(income)} onClick={() => setStep(2)}>
            Next
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <h1 className="text-2xl font-bold">Fixed expenses</h1>
          <p className="mb-4 mt-1 text-slate-500">EMI, rent, investments, etc.</p>

          <div className="mb-4 space-y-2">
            {fixedItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-xl bg-slate-100 px-4 py-3">
                <span>{item.name}</span>
                <span className="flex items-center gap-3">
                  <b>{rupee(item.amount)}</b>
                  <button
                    className="text-slate-400"
                    onClick={() => setFixedItems(fixedItems.filter((f) => f.id !== item.id))}
                  >
                    ✕
                  </button>
                </span>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input className={inputCls} placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <input
              className={inputCls}
              inputMode="numeric"
              placeholder="₹"
              value={amount}
              onChange={(e) => setAmount(digits(e.target.value))}
            />
          </div>
          <button className="mt-2 w-full rounded-xl border border-indigo-600 py-3 font-semibold text-indigo-600" onClick={addFixed}>
            + Add
          </button>

          <div className="mt-6 rounded-xl bg-indigo-50 p-4">
            <div className="flex justify-between"><span>Income</span><b>{rupee(draft.income)}</b></div>
            <div className="flex justify-between"><span>Fixed total</span><b>{rupee(draft.income - pool)}</b></div>
            <div className="mt-2 flex justify-between border-t border-indigo-200 pt-2">
              <span>Variable pool</span><b>{rupee(pool)}</b>
            </div>
          </div>
          {pool <= 0 && <p className="mt-2 text-red-600">Fixed expenses exceed your income!</p>}

          <button className={btnCls} disabled={pool <= 0} onClick={() => setStep(3)}>
            Next
          </button>
        </>
      )}

      {step === 3 && (
        <>
          <h1 className="text-2xl font-bold">Daily limit</h1>
          <p className="mb-4 mt-1 text-slate-500">How much can you spend per day?</p>

          <button
            className={`mb-3 rounded-xl border-2 p-4 text-left ${mode === 'auto' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200'}`}
            onClick={() => setMode('auto')}
          >
            <b>Auto</b>
            <div className="text-2xl font-bold">{rupee(autoLimit)} / day</div>
            <div className="text-sm text-slate-500">Pool {rupee(pool)} ÷ days in the month</div>
          </button>

          <button
            className={`rounded-xl border-2 p-4 text-left ${mode === 'manual' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200'}`}
            onClick={() => setMode('manual')}
          >
            <b>Manual</b>
            <div className="text-sm text-slate-500">Maximum {rupee(autoLimit)}</div>
          </button>

          {mode === 'manual' && (
            <>
              <input
                className={`${inputCls} mt-3`}
                inputMode="numeric"
                placeholder="₹ daily limit"
                value={manual}
                onChange={(e) => setManual(digits(e.target.value))}
              />
              {Number(manual) > autoLimit && (
                <p className="mt-2 text-red-600">The limit cannot exceed {rupee(autoLimit)}</p>
              )}
            </>
          )}

          <button className={btnCls} disabled={manualInvalid} onClick={() => onDone(draft)}>
            {initial ? 'Save changes' : 'Budget ready'}
          </button>
        </>
      )}
    </div>
  )
}