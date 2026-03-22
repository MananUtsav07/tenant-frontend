type LoadingStateProps = {
  message?: string
  variant?: 'skeleton' | 'message'
  rows?: number
  tone?: 'dark' | 'light'
}

export function LoadingState({ message = 'Loading...', variant = 'skeleton', rows = 3, tone = 'light' }: LoadingStateProps) {
  return (
    <div
      className={`rounded-2xl border p-6 text-sm ${
        tone === 'light'
          ? 'border-[rgba(83,88,100,0.18)] bg-[var(--ph-surface)] text-[var(--ph-text)]'
          : 'border-slate-800 bg-slate-900/60 text-slate-300'
      }`}
    >
      <p className={`text-sm ${tone === 'light' ? 'text-[var(--ph-text-muted)]' : 'text-slate-400'}`}>{message}</p>
      {variant === 'skeleton' ? (
        <div className="mt-4 space-y-3">
          {Array.from({ length: rows }).map((_, index) => (
            <div
              key={index}
              className={`h-3 w-full animate-pulse rounded-full ${
                tone === 'light' ? 'bg-[rgba(255,255,255,0.08)]' : 'bg-slate-800/80'
              }`}
            />
          ))}
          <div
            className={`h-20 animate-pulse rounded-xl ${tone === 'light' ? 'bg-[rgba(255,255,255,0.06)]' : 'bg-slate-800/70'}`}
          />
        </div>
      ) : null}
    </div>
  )
}
