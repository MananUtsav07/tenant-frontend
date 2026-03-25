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
          ? 'border-[rgba(0,0,0,0.06)] bg-white text-[#1A1A1A] shadow-sm'
          : 'border-[rgba(0,0,0,0.06)] bg-[#FEFAEF] text-[#1A1A1A] shadow-sm'
      }`}
    >
      <p className={`text-sm ${tone === 'light' ? 'text-[#6B7280]' : 'text-[#6B7280]'}`}>{message}</p>
      {variant === 'skeleton' ? (
        <div className="mt-4 space-y-3">
          {Array.from({ length: rows }).map((_, index) => (
            <div
              key={index}
              className={`h-3 w-full animate-pulse rounded-full ${
                tone === 'light' ? 'bg-[rgba(0,0,0,0.06)]' : 'bg-[rgba(0,0,0,0.04)]'
              }`}
            />
          ))}
          <div
            className={`h-20 animate-pulse rounded-xl ${tone === 'light' ? 'bg-[rgba(0,0,0,0.04)]' : 'bg-[rgba(0,0,0,0.03)]'}`}
          />
        </div>
      ) : null}
    </div>
  )
}
