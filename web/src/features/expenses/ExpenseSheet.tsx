import { useState } from 'react'
import type { Category, Expense } from '../../shared/types'
import { digits } from '../../shared/utils/format'
import { getToday } from '../../shared/utils/date'

type Props = {
  categories: Category[]
  defaultCategoryId: string
  initial?: Expense
  onSave: (fields: Omit<Expense, 'id'>) => void
  onDelete?: () => void
  onClose: () => void
}

export default function ExpenseSheet({
  categories,
  defaultCategoryId,
  initial,
  onSave,
  onDelete,
  onClose,
}: Props) {
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '')
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? defaultCategoryId)
  const [date, setDate] = useState(initial?.date ?? getToday())
  const [note, setNote] = useState(initial?.note ?? '')

  const save = () =>
    onSave({
      amount: Number(amount),
      categoryId,
      date,
      note: note.trim() || undefined,
    })

  return (
    <div className="fixed inset-0 z-10 flex items-end bg-black/40" onClick={onClose}>
      <div
        className="mx-auto w-full max-w-[480px] rounded-t-3xl bg-white p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">{initial ? 'Edit expense' : 'Add expense'}</h2>
          <button className="text-slate-400" onClick={onClose}>✕</button>
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
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoryId(c.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                categoryId === c.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
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
            placeholder="Note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2"
          />
        </div>

        <button
          disabled={!Number(amount) || !date}
          onClick={save}
          className="mt-5 w-full rounded-xl bg-indigo-600 py-4 text-lg font-semibold text-white disabled:bg-slate-300"
        >
          Save
        </button>

        {onDelete && (
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this expense?')) onDelete()
            }}
            className="mt-2 w-full py-3 font-medium text-red-600"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  )
}