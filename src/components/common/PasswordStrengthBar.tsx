export function PasswordStrengthBar({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ]
  const score = checks.filter(Boolean).length
  const label = ['', 'Weak', 'Fair', 'Good', 'Strong'][score]
  const barColor =
    score === 1
      ? 'bg-red-400'
      : score === 2
        ? 'bg-orange-400'
        : score === 3
          ? 'bg-[#EBCF42]'
          : score === 4
            ? 'bg-green-500'
            : ''

  return (
    <div className="mt-2 flex items-center gap-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1.5 w-8 rounded-full transition-colors ${i <= score ? barColor : 'bg-[#272839]'}`}
          />
        ))}
      </div>
      {score > 0 && (
        <span
          className={`text-xs font-semibold font-['DM_Sans'] ${
            score === 1
              ? 'text-red-500'
              : score === 2
                ? 'text-orange-500'
                : score === 3
                  ? 'text-[#EBCF42]'
                  : 'text-green-600'
          }`}
        >
          {label}
        </span>
      )}
    </div>
  )
}
