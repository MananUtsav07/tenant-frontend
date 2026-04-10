import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

import { api } from '../../services/api'
import { ROUTES } from '../../routes/constants'

type VerifyState = 'verifying' | 'success' | 'error'

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const [state, setState] = useState<VerifyState>('verifying')
  const [message, setMessage] = useState('')
  const called = useRef(false)

  useEffect(() => {
    if (called.current) return
    called.current = true

    const token = searchParams.get('token') ?? ''
    if (!token) {
      setState('error')
      setMessage('No verification token found. Please check your email and try again.')
      return
    }

    api
      .ownerVerifyEmail(token)
      .then((res) => {
        setState('success')
        setMessage(res.message)
      })
      .catch((err: unknown) => {
        setState('error')
        setMessage(err instanceof Error ? err.message : 'Verification failed. The link may have expired.')
      })
  }, [searchParams])

  return (
    <div className="min-h-screen bg-[#06070B] flex items-center justify-center px-4 font-['Manrope'] text-white antialiased">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-10">
          <span className="font-['Sora'] text-2xl font-black tracking-tighter text-white">Prophives</span>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-[#272839] bg-[#101114] p-8 text-center shadow-xl">

          {state === 'verifying' && (
            <>
              <div className="flex justify-center mb-5">
                <Loader2 className="w-10 h-10 text-[#2251E3] animate-spin" />
              </div>
              <h1 className="text-xl font-bold text-white mb-2 font-['Sora']">
                Verifying your email
              </h1>
              <p className="text-sm text-[#8D8D96]">Please wait a moment…</p>
            </>
          )}

          {state === 'success' && (
            <>
              <div className="flex justify-center mb-5">
                <CheckCircle className="w-12 h-12 text-[#32C382]" />
              </div>
              <h1 className="text-xl font-bold text-white mb-2 font-['Sora']">
                Email verified
              </h1>
              <p className="text-sm text-[#8D8D96] mb-8 leading-relaxed">{message}</p>
              <Link
                to={ROUTES.ownerLogin}
                className="block w-full py-3 rounded-lg bg-[#2251E3] text-white text-sm font-bold font-['DM_Sans'] tracking-wide hover:bg-[#4E79FF] transition-colors"
              >
                Go to owner login
              </Link>
            </>
          )}

          {state === 'error' && (
            <>
              <div className="flex justify-center mb-5">
                <XCircle className="w-12 h-12 text-red-500" />
              </div>
              <h1 className="text-xl font-bold text-white mb-2 font-['Sora']">
                Verification failed
              </h1>
              <p className="text-sm text-[#8D8D96] mb-8 leading-relaxed">{message}</p>
              <Link
                to={ROUTES.ownerLogin}
                className="block w-full py-3 rounded-lg border border-[#272839] text-[#8D8D96] text-sm font-bold font-['DM_Sans'] hover:border-[#2251E3] hover:text-white transition-colors"
              >
                Back to login
              </Link>
            </>
          )}

        </div>

        <p className="mt-6 text-center text-xs text-[#8D8D96]">
          Need help?{' '}
          <a href="mailto:support@prophives.com" className="text-[#4E79FF] hover:underline">
            support@prophives.com
          </a>
        </p>

      </div>
    </div>
  )
}
