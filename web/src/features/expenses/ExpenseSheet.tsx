import { useState } from 'react'
import type { Category, Expense, Kind } from '../../shared/types'
import { digits } from '../../shared/utils/format'
import { getToday } from '../../shared/utils/date'
import { kindOf } from '../../shared/utils/kind'

type Props = {
  categories: Category[]
  defaultCategoryIds: Record<Kind, string>
  defaultDate?: string
  initial?: Expense
  onSave: (fields: Omit<Expense, 'id'>) => void
  onDelete?: () => void
  onClose: () => void
}

export default function ExpenseSheet({
  categories,
  defaultCategoryIds,
  defaultDate,
  initial,
  onSave,
  onDelete,
  onClose,
}: Props) {
  const [kind, setKind] = useState<Kind>(initial ? kindOf(initial) : 'regular')
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '')
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? defaultCategoryIds.regular)
  const [date, setDate] = useState(initial?.date ?? defaultDate ?? getToday())
  const [note, setNote] = useState(initial?.note ?? '')

  const visible = categories.filter(
    (c) => kindOf(c) === kind && (!c.archived || c.id === initial?.categoryId)
  )

  const switchKind = (next: Kind) => {
    if (next === kind) return
    setKind(next)
    setCategoryId(defaultCategoryIds[next])
  }

  const save = () =>
    onSave({
      amount: Number(amount),
      categoryId,
      date,
      kind,
      note: note.trim() || undefined,
    })

  const chipActive = kind === 'extra' ? 'bg-amber-500 text-white' : 'bg-indigo-600 text-white'

  return (
    <div className="fixed inset-0 z-20 flex items-end bg-black/40" onClick={onClose}>
      <div
        className="mx-auto w-full max-w-[480px] pb-[calc(1.25rem+env(safe-area-inset-bottom))]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">{initial ? 'Edit expense' : 'Add expense'}</h2>
          <button className="text-slate-400 cursor-pointer" onClick={onClose}>✕</button>
        </div>

        <div className="mb-4 flex rounded-xl bg-slate-100 p-1 text-sm font-semibold">
          {(['regular', 'extra'] as const).map((k) => (
            <button
              key={k}
              onClick={() => switchKind(k)}
              className={`flex-1 cursor-pointer rounded-lg py-2 ${kind === k ? 'bg-white shadow-sm' : 'text-slate-500'}`}
            >
              {k === 'regular' ? 'Regular' : 'Extra'}
            </button>
          ))}
        </div>

        <input
          autoFocus
          inputMode="numeric"
          placeholder="₹ 0"
          value={amount}
          onChange={(e) => setAmount(digits(e.target.value))}
          className="w-full border-b-2 border-slate-200 pb-2 text-4xl font-bold outline-none focus:border-indigo-500"
        />

        <div className="mt-4 flex flex-wrap gap-2">
          {visible.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoryId(c.id)}
              className={`rounded-full cursor-pointer px-4 py-2 text-sm font-medium ${
                categoryId === c.id ? chipActive : 'bg-slate-100 text-slate-700'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-xl border border-slate-300 px-3 py-2"
          />
          <input
            placeholder={kind === 'extra' ? 'What was it for? (optional)' : 'Note (optional)'}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2"
          />
        </div>

        <button
          disabled={!Number(amount) || !date || !categoryId}
          onClick={save}
          className="mt-5 w-full cursor-pointer rounded-xl bg-indigo-600 py-4 text-lg font-semibold text-white disabled:bg-slate-300"
        >
          Save
        </button>

        {onDelete && (
          <button
            onClick={() => {
              if (window.confirm('Delete this expense?')) onDelete()
            }}
            className="mt-2 w-full cursor-pointer py-3 font-medium text-red-600"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  )
}