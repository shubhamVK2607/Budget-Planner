import { useRef, useState } from 'react'
import type { FixedItem, MonthBudget } from '../../shared/types'
import {
  getAutoDailyLimit,
  getDailyLimit,
  getExtraBudget,
  getPool,
  getRegularBudget,
} from '../budget/budget'
import { rupee, digits } from '../../shared/utils/format'
import { useI18n } from '../../shared/i18n/context'
import { fixedItemLabel } from '../../shared/i18n/dictionaries'
import IncomeStep from './IncomeStep'

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
  const { t, lang } = useI18n()
  const [step, setStep] = useState(1)
  const [income, setIncome] = useState(initial ? String(initial.income) : '')
  const [fixedItems, setFixedItems] = useState<FixedItem[]>(initial?.fixedItems ?? [])
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [mode, setMode] = useState<'auto' | 'manual'>(initial?.dailyLimitMode ?? 'auto')
  const [manual, setManual] = useState(initial?.manualDailyLimit ? String(initial.manualDailyLimit) : '')
  const [extraMode, setExtraMode] = useState<'percent' | 'amount'>(initial?.extraMode ?? 'percent')
  const [extraValue, setExtraValue] = useState(initial ? String(initial.extraValue ?? 0) : '20')
  const amountRef = useRef<HTMLInputElement>(null)

  // Jo entry type ho chuki hai par abhi "Add" nahi hui
  const trimmedName = name.trim()
  const pendingItem: FixedItem | null =
    trimmedName && Number(amount) > 0 ? { id: 'pending', name: trimmedName, amount: Number(amount) } : null
  const allFixed = pendingItem ? [...fixedItems, pendingItem] : fixedItems

  const draft: MonthBudget = {
    month,
    income: Number(income) || 0,
    fixedItems: allFixed,
    dailyLimitMode: mode,
    manualDailyLimit: manual ? Number(manual) : undefined,
    extraMode,
    extraValue: Number(extraValue) || 0,
  }
  const pool = getPool(draft)
  const maxDailyLimit = getAutoDailyLimit(draft)
  const extraBudget = getExtraBudget(draft)
  const regularBudget = getRegularBudget(draft)
  const dailyLimit = getDailyLimit(draft)

  const manualInvalid = mode === 'manual' && (!Number(manual) || Number(manual) > maxDailyLimit)
  const extraInvalid =
    mode === 'auto' &&
    ((extraMode === 'percent' && Number(extraValue) > 100) ||
      (extraMode === 'amount' && Number(extraValue) > pool))

  // Pending entry ko list me pakka save karta hai
  const commitPending = () => {
    if (!pendingItem) return
    setFixedItems([...fixedItems, { ...pendingItem, id: crypto.randomUUID() }])
    setName('')
    setAmount('')
  }

  const goToStep3 = () => {
    commitPending()
    setStep(3)
  }

  const availableSuggestions = t.setup.suggestions.filter(
    (s) => !fixedItems.some((f) => fixedItemLabel(f.name, lang).toLowerCase() === s.toLowerCase())
  )

  // ₹ aur % ke beech switch karte waqt value convert ho jaye
  const switchExtraMode = (next: 'percent' | 'amount') => {
    if (next === extraMode) return
    setExtraValue(next === 'amount' ? String(extraBudget) : String(Math.round((extraBudget / pool) * 100)))
    setExtraMode(next)
  }

  const switchToManual = () => {
    if (!manual) setManual(String(dailyLimit))
    setMode('manual')
  }

  return (
    <div className="flex min-h-screen flex-col p-5">
      {onCancel && (
        <button className="mb-3 self-start text-slate-500" onClick={onCancel}>
          ← {t.common.cancel}
        </button>
      )}
      <div className="mb-6 flex gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`h-1.5 flex-1 rounded-full ${s <= step ? 'bg-indigo-600' : 'bg-slate-200'}`} />
        ))}
      </div>

      {step === 1 && <IncomeStep value={income} onChange={setIncome} onNext={() => setStep(2)} />}

      {step === 2 && (
        <>
          <h1 className="text-2xl font-bold">{t.setup.fixedTitle}</h1>
          <p className="mb-4 mt-1 text-slate-500">{t.setup.fixedSub}</p>

          {fixedItems.length > 0 && (
            <div className="mb-4 space-y-2">
              {fixedItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-xl bg-slate-100 px-4 py-3">
                  <span>{fixedItemLabel(item.name, lang)}</span>
                  <span className="flex items-center gap-3">
                    <b>{rupee(item.amount)}</b>
                    <button
                      className="text-slate-400"
                      aria-label={t.common.delete}
                      onClick={() => setFixedItems(fixedItems.filter((f) => f.id !== item.id))}
                    >
                      ✕
                    </button>
                  </span>
                </div>
              ))}
            </div>
          )}

          {availableSuggestions.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {availableSuggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setName(s)
                    amountRef.current?.focus()
                  }}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                    name === s ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <input
              className={inputCls}
              placeholder={t.setup.namePlaceholder}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              ref={amountRef}
              className={inputCls}
              inputMode="numeric"
              placeholder="₹"
              value={amount}
              onChange={(e) => setAmount(digits(e.target.value))}
              onKeyDown={(e) => e.key === 'Enter' && commitPending()}
            />
          </div>
          <button
            disabled={!pendingItem}
            onClick={commitPending}
            className="mt-2 w-full rounded-xl border border-indigo-600 py-3 font-semibold text-indigo-600 disabled:border-slate-200 disabled:text-slate-300"
          >
            {t.setup.addFixed}
          </button>
          {pendingItem && <p className="mt-1 text-sm text-slate-500">{t.setup.pendingHint}</p>}

          <div className="mt-6 rounded-xl bg-indigo-50 p-4">
            <div className="flex justify-between"><span>{t.common.income}</span><b>{rupee(draft.income)}</b></div>
            <div className="flex justify-between"><span>{t.setup.fixedTotal}</span><b>{rupee(draft.income - pool)}</b></div>
            <div className="mt-2 flex justify-between border-t border-indigo-200 pt-2">
              <span>{t.setup.leftToSpend}</span><b>{rupee(pool)}</b>
            </div>
          </div>
          {pool <= 0 && <p className="mt-2 text-red-600">{t.setup.fixedExceeds}</p>}

          <button className={btnCls} disabled={pool <= 0} onClick={goToStep3}>
            {t.common.next}
          </button>
        </>
      )}

      {step === 3 && (
        <>
          <h1 className="text-2xl font-bold">{t.setup.limitTitle}</h1>
          <p className="mb-5 mt-1 text-slate-500">{t.setup.limitDesc}</p>

          {mode === 'auto' ? (
            <>
              <div className="mb-2 flex items-center justify-between">
                <span className="font-medium">{t.setup.extraBudgetLabel}</span>
                <div className="flex rounded-xl bg-slate-100 p-1 text-sm font-medium">
                  {(['percent', 'amount'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => switchExtraMode(m)}
                      className={`rounded-lg px-4 py-1 ${extraMode === m ? 'bg-white shadow-sm' : 'text-slate-500'}`}
                    >
                      {m === 'percent' ? '%' : '₹'}
                    </button>
                  ))}
                </div>
              </div>
              <input
                className={inputCls}
                inputMode="numeric"
                placeholder={extraMode === 'percent' ? '20' : '5000'}
                value={extraValue}
                onChange={(e) => setExtraValue(digits(e.target.value))}
              />
              {extraInvalid && (
                <p className="mt-2 text-red-600">
                  {extraMode === 'percent' ? t.setup.maxPercent : t.setup.maxAmount(rupee(pool))}
                </p>
              )}
              <button className="mt-3 self-start text-sm font-medium text-indigo-600" onClick={switchToManual}>
                {t.setup.setOwn}
              </button>
            </>
          ) : (
            <>
              <div className="mb-2 font-medium">{t.setup.myLimit}</div>
              <input
                className={inputCls}
                inputMode="numeric"
                placeholder={t.setup.limitPlaceholder}
                value={manual}
                onChange={(e) => setManual(digits(e.target.value))}
              />
              <p className="mt-1 text-sm text-slate-500">{t.setup.maxPerDay(rupee(maxDailyLimit))}</p>
              {Number(manual) > maxDailyLimit && (
                <p className="mt-1 text-red-600">{t.setup.limitExceeds(rupee(maxDailyLimit))}</p>
              )}
              <button className="mt-3 self-start text-sm font-medium text-indigo-600" onClick={() => setMode('auto')}>
                {t.setup.setExtraInstead}
              </button>
            </>
          )}

          <div className="mt-5 rounded-xl bg-indigo-50 p-4">
            <div className="flex justify-between"><span>{t.setup.leftToSpend}</span><b>{rupee(pool)}</b></div>
            <div className="flex justify-between"><span>{t.setup.extraBudget}</span><b>{rupee(extraBudget)}</b></div>
            <div className="flex justify-between"><span>{t.setup.regularSpending}</span><b>{rupee(regularBudget)}</b></div>
            <div className="mt-2 flex justify-between border-t border-indigo-200 pt-2 text-lg">
              <span>{t.common.dailyLimit}</span><b>{t.setup.perDay(rupee(dailyLimit))}</b>
            </div>
          </div>

          <button className={btnCls} disabled={manualInvalid || extraInvalid} onClick={() => onDone(draft)}>
            {initial ? t.setup.saveChanges : t.setup.budgetReady}
          </button>
        </>
      )}
    </div>
  )
}