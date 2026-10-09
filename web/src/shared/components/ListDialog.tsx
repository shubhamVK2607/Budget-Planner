import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { rupee } from '../utils/format'
import { useI18n } from '../i18n/context'

type Props = {
  title: string
  subtitle?: string
  totalLabel?: string
  total: number
  footerNote?: string
  onClose: () => void
  children: ReactNode
}

export default function ListDialog({ title, subtitle, totalLabel, total, footerNote, onClose, children }: Props) {
  const { t } = useI18n()

  return (
    <div className="fixed inset-0 z-20 flex items-end bg-black/40" onClick={onClose}>
      <div
        className="mx-auto flex h-[70vh] w-full max-w-[480px] flex-col rounded-t-3xl bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between px-5 pb-2 pt-5">
          <div>
            <h2 className="text-xl font-bold">{title}</h2>
            {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
          </div>
          <button aria-label={t.common.close} onClick={onClose} className="rounded-full p-1 text-slate-400">
            <X size={20} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-4">{children}</div>

        <div className="border-t border-slate-100 px-5 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3">
          <div className="flex items-baseline justify-between">
            <span className="text-slate-500">{totalLabel ?? t.common.total}</span>
            <span className="text-xl font-bold">{rupee(total)}</span>
          </div>
          {footerNote && <p className="mt-0.5 text-xs text-slate-500">{footerNote}</p>}
        </div>
      </div>
    </div>
  )
}