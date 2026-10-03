import { useState } from 'react'
import type { Category, Kind } from '../../shared/types'
import { kindOf } from '../../shared/utils/kind'

type Props = {
  title: string
  kind: Kind
  categories: Category[]
  onAdd: (name: string, kind: Kind) => void
  onToggleArchive: (id: string) => void
}

export default function CategoryManager({ title, kind, categories, onAdd, onToggleArchive }: Props) {
  const [name, setName] = useState('')

  const mine = categories.filter((c) => kindOf(c) === kind)
  const active = mine.filter((c) => !c.archived)
  const hidden = mine.filter((c) => c.archived)
  const trimmed = name.trim()
  const duplicate = mine.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())

  const add = () => {
    if (!trimmed || duplicate) return
    onAdd(trimmed, kind)
    setName('')
  }

  return (
    <div className="mb-6">
      <div className="mb-2 text-sm font-medium text-slate-500">{title}</div>
      <div className="divide-y divide-slate-100 rounded-2xl border border-slate-100">
        {active.map((c) => (
          <div key={c.id} className="flex items-center justify-between px-4 py-3">
            <span>{c.name}</span>
            <button
              disabled={active.length === 1}
              onClick={() => onToggleArchive(c.id)}
              className="text-sm cursor-pointer text-slate-500 disabled:opacity-30"
            >
              Hide
            </button>
          </div>
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        <input
          placeholder="New category"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
        />
        <button
          disabled={!trimmed || duplicate}
          onClick={add}
          className="rounded-xl cursor-pointer bg-indigo-600 px-5 font-semibold text-white disabled:bg-slate-300"
        >
          Add
        </button>
      </div>
      {duplicate && trimmed && <p className="mt-1 text-sm text-red-600">This category already exists</p>}

      {hidden.length > 0 && (
        <div className="mt-3 divide-y divide-slate-100 rounded-2xl border border-slate-100">
          {hidden.map((c) => (
            <div key={c.id} className="flex items-center justify-between px-4 py-3 text-slate-400">
              <span>{c.name} (hidden)</span>
              <button onClick={() => onToggleArchive(c.id)} className="text-sm cursor-pointer text-indigo-600">
                Restore
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}