import { useRef, useState } from 'react'
import { Download, Upload } from 'lucide-react'
import type { AppData } from '../../services/storage'
import { exportBackup, parseBackup } from '../backup/backup'

type Props = {
  data: AppData
  onImport: (data: AppData) => void
}

export default function BackupSection({ data, onImport }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null)

  const handleExport = async () => {
    try {
      await exportBackup(data)
      setMessage({ text: 'Backup ready. Keep the file somewhere safe (Files, Drive, or WhatsApp to yourself).' })
    } catch {
      setMessage({ text: 'Could not create the backup.', error: true })
    }
  }

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    try {
      const imported = parseBackup(await file.text())
      const ok = window.confirm(
        `Replace ALL current data with this backup?\n\n${imported.expenses.length} expenses, ${
          Object.keys(imported.budgets).length
        } month(s). This cannot be undone.`
      )
      if (!ok) return
      onImport(imported)
      setMessage({ text: 'Backup restored.' })
    } catch (e) {
      setMessage({ text: (e as Error).message, error: true })
    } finally {
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="mb-6">
      <div className="mb-2 text-sm font-medium text-slate-500">BACKUP</div>
      <div className="rounded-2xl border border-slate-100 p-4">
        <p className="mb-3 text-sm text-slate-500">
          Your data is stored only on this phone. Save a backup so you never lose it.
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-indigo-600 py-2 font-semibold text-indigo-600"
          >
            <Download size={16} /> Export
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 py-2 font-semibold text-slate-700"
          >
            <Upload size={16} /> Import
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        {message && (
          <p className={`mt-3 text-sm ${message.error ? 'text-red-600' : 'text-emerald-700'}`}>{message.text}</p>
        )}
      </div>
    </div>
  )
}