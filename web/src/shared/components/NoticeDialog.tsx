type Props = {
  title: string
  message: string
  onClose: () => void
}

export default function NoticeDialog({ title, message, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-6">
      <div className="w-full max-w-[340px] rounded-2xl bg-white p-5 shadow-xl">
        <h2 className="text-lg font-bold text-red-600">{title}</h2>
        <p className="mt-2 text-slate-600">{message}</p>
        <button onClick={onClose} className="mt-5 w-full rounded-xl bg-indigo-600 py-3 font-semibold cursor-pointer text-white">
          Got it
        </button>
      </div>
    </div>
  )
}