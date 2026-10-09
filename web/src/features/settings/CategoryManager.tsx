import { useState } from 'react'
import type { Category, Kind } from '../../shared/types'
import { kindOf } from '../../shared/utils/kind'
import { useI18n } from '../../shared/i18n/context'

type Props = {
  title: string
  kind: Kind
  categories: Category[]
  onAdd: (name: string, kind: Kind) => void
  onToggleArchive: (id: string) => void
}

export default function CategoryManager({ title, kind, categories, onAdd, onToggleArchive }: Props) {
  const { t, catName } = useI18n()
  const [name, setName] = useState('')

  const mine = categories.filter((c) => kindOf(c) === kind)
  const active = mine.filter((c) => !c.archived)
  const hidden = mine.filter((c) => c.archived)
  const trimmed = name.trim()
  const lower = trimmed.toLowerCase()
  const duplicate = mine.some((c) => c.name.toLowerCase() === lower || catName(c).toLowerCase() === lower)

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
            <span>{catName(c)}</span>
            <button
              disabled={active.length === 1}
              onClick={() => onToggleArchive(c.id)}
              className="text-sm text-slate-500 disabled:opacity-30"
            >
              {t.common.hide}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        <input
          placeholder={t.categories.newCategory}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
        />
        <button
          disabled={!trimmed || duplicate}
          onClick={add}
          className="rounded-xl bg-indigo-600 px-5 font-semibold text-white disabled:bg-slate-300"
        >
          {t.common.add}
        </button>
      </div>
      {duplicate && trimmed && <p className="mt-1 text-sm text-red-600">{t.categories.exists}</p>}

      {hidden.length > 0 && (
        <div className="mt-3 divide-y divide-slate-100 rounded-2xl border border-slate-100">
          {hidden.map((c) => (
            <div key={c.id} className="flex items-center justify-between px-4 py-3 text-slate-400">
              <span>
                {catName(c)} {t.categories.hiddenSuffix}
              </span>
              <button onClick={() => onToggleArchive(c.id)} className="text-sm text-indigo-600">
                {t.common.restore}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}