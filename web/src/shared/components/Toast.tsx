type Props = { message: string }

export default function Toast({ message }: Props) {
  return (
    <div className="pointer-events-none fixed left-1/2 top-[calc(1rem+env(safe-area-inset-top))] z-50 max-w-[90%] -translate-x-1/2 rounded-full bg-black/90 px-4 py-2 text-center text-sm font-medium text-white shadow-lg ring-1 ring-white/20">
      {message}
    </div>
  )
}