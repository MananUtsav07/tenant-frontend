type LoadingStateProps = {
  message?: string
  variant?: 'skeleton' | 'message'
  rows?: number
  tone?: 'dark' | 'light'
}

export function LoadingState({ message = 'Loading...', variant = 'skeleton', rows = 3, tone = 'light' }: LoadingStateProps) {
  return (
    <div
      className={`rounded-xl border p-6 text-sm ${
        tone === 'light'
          ? 'border-[#272839] bg-[#101114] text-white shadow-sm'
          : 'border-[#272839] bg-[#141519] text-white shadow-sm'
      }`}
    >
      <p className="text-sm text-[#8D8D96]">{message}</p>
      {variant === 'skeleton' ? (
        <div className="mt-4 space-y-3">
          {Array.from({ length: rows }).map((_, index) => (
            <div
              key={index}
              className="h-3 w-full animate-pulse rounded-full bg-[rgba(255,255,255,0.06)]"
            />
          ))}
          <div
            className="h-20 animate-pulse rounded-xl bg-[rgba(255,255,255,0.04)]"
          />
        </div>
      ) : null}
    </div>
  )
}
