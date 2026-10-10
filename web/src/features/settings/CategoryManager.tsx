import { useState } from 'react'
import { EyeOff, GitMerge, Pencil } from 'lucide-react'
import type { Category, Expense, Kind } from '../../shared/types'
import { kindOf } from '../../shared/utils/kind'
import { useI18n } from '../../shared/i18n/context'

type Props = {
  title: string
  kind: Kind
  categories: Category[]
  expenses: Expense[]
  onAdd: (name: string, kind: Kind) => void
  onRename: (id: string, name: string) => void
  onMerge: (fromId: string, toId: string) => void
  onToggleArchive: (id: string) => void
}

const iconBtn = 'rounded-full p-1.5 text-slate-400 disabled:opacity-30'

export default function CategoryManager({
  title,
  kind,
  categories,
  expenses,
  onAdd,
  onRename,
  onMerge,
  onToggleArchive,
}: Props) {
  const { t, catName } = useI18n()
  const [name, setName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [mergingId, setMergingId] = useState<string | null>(null)
  const [targetId, setTargetId] = useState<string | null>(null)

  const mine = categories.filter((c) => kindOf(c) === kind)
  const active = mine.filter((c) => !c.archived)
  const hidden = mine.filter((c) => c.archived)

  const isDuplicate = (value: string, exceptId?: string) => {
    const lower = value.trim().toLowerCase()
    return (
      lower !== '' &&
      mine.some((c) => c.id !== exceptId && (c.name.toLowerCase() === lower || catName(c).toLowerCase() === lower))
    )
  }

  const trimmed = name.trim()
  const duplicate = isDuplicate(name)

  const add = () => {
    if (!trimmed || duplicate) return
    onAdd(trimmed, kind)
    setName('')
  }

  const startRename = (c: Category) => {
    setEditingId(c.id)
    setEditName(catName(c))
  }

  const renameInvalid = !editName.trim() || isDuplicate(editName, editingId ?? undefined)

  const saveRename = () => {
    const current = mine.find((c) => c.id === editingId)
    if (!current || renameInvalid) return
    // Naam waisa hi hai to kuch mat badlo (default categories ka translation bacha rahe)
    if (editName.trim() !== catName(current)) onRename(current.id, editName.trim())
    setEditingId(null)
  }

  const source = mine.find((c) => c.id === mergingId)
  const targets = active.filter((c) => c.id !== mergingId)
  const moveCount = source ? expenses.filter((e) => e.categoryId === source.id).length : 0

  const closeMerge = () => {
    setMergingId(null)
    setTargetId(null)
  }

  const confirmMerge = () => {
    if (!source || !targetId) return
    onMerge(source.id, targetId)
    closeMerge()
  }

  return (
    <div className="mb-6">
      <div className="mb-2 text-sm font-medium text-slate-500">{title}</div>
      <div className="divide-y divide-slate-100 rounded-2xl border border-slate-100">
        {active.map((c) =>
          editingId === c.id ? (
            <div key={c.id} className="px-4 py-3">
              <div className="flex gap-2">
                <input
                  autoFocus
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveRename()}
                  className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500"
                />
                <button
                  disabled={renameInvalid}
                  onClick={saveRename}
                  className="rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white disabled:bg-slate-300"
                >
                  {t.common.save}
                </button>
                <button onClick={() => setEditingId(null)} className="px-1 text-sm text-slate-500">
                  {t.common.cancel}
                </button>
              </div>
              {isDuplicate(editName, c.id) && <p className="mt-1 text-sm text-red-600">{t.categories.exists}</p>}
            </div>
          ) : (
            <div key={c.id} className="flex items-center justify-between py-1.5 pl-4 pr-2">
              <span>{catName(c)}</span>
              <span className="flex">
                <button aria-label={t.categories.rename} onClick={() => startRename(c)} className={iconBtn}>
                  <Pencil size={18} />
                </button>
                <button
                  aria-label={t.categories.merge}
                  disabled={active.length < 2}
                  onClick={() => setMergingId(c.id)}
                  className={iconBtn}
                >
                  <GitMerge size={18} />
                </button>
                <button
                  aria-label={t.common.hide}
                  disabled={active.length === 1}
                  onClick={() => onToggleArchive(c.id)}
                  className={iconBtn}
                >
                  <EyeOff size={18} />
                </button>
              </span>
            </div>
          )
        )}
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

      {source && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-6" onClick={closeMerge}>
          <div
            className="w-full max-w-[340px] rounded-2xl bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold">{t.categories.mergeTitle(catName(source))}</h2>
            <p className="mt-1 text-sm text-slate-500">{t.categories.mergeDesc(moveCount)}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {targets.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setTargetId(c.id)}
                  className={`rounded-full px-4 py-2 text-sm font-medium ${
                    targetId === c.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {catName(c)}
                </button>
              ))}
            </div>

            <div className="mt-5 flex gap-2">
              <button onClick={closeMerge} className="flex-1 rounded-xl border border-slate-300 py-3 font-semibold">
                {t.common.cancel}
              </button>
              <button
                disabled={!targetId}
                onClick={confirmMerge}
                className="flex-1 rounded-xl bg-indigo-600 py-3 font-semibold text-white disabled:bg-slate-300"
              >
                {t.categories.mergeConfirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}