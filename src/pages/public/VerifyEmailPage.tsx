import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle, XCircle, Loader } from 'lucide-react'

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
      setMessage('No verification token found in the link. Please check your email and try again.')
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
    <div className="min-h-screen bg-[#0C0900] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#0C0900] font-black text-base"
            style={{ backgroundColor: '#FED609', fontFamily: 'Georgia, serif' }}
          >
            P
          </div>
          <span className="text-lg font-bold tracking-wide" style={{ color: '#FED609', fontFamily: 'Georgia, serif' }}>
            Prophives
          </span>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-[#2A2200] bg-[#131000] p-8 text-center">
          {state === 'verifying' && (
            <>
              <div className="flex justify-center mb-5">
                <Loader className="w-12 h-12 text-[#FED609] animate-spin" />
              </div>
              <h1 className="text-xl font-bold text-[#FEFAEF] mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                Verifying your email
              </h1>
              <p className="text-sm text-[#8A7840]">Please wait a moment…</p>
            </>
          )}

          {state === 'success' && (
            <>
              <div className="flex justify-center mb-5">
                <CheckCircle className="w-12 h-12 text-[#4AD888]" />
              </div>
              <h1 className="text-xl font-bold text-[#FEFAEF] mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                Email verified
              </h1>
              <p className="text-sm text-[#C8B878] mb-8">{message}</p>
              <Link
                to={ROUTES.ownerLogin}
                className="inline-block w-full rounded-full py-3 text-sm font-bold text-[#0C0900] transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#FED609' }}
              >
                Go to owner login
              </Link>
            </>
          )}

          {state === 'error' && (
            <>
              <div className="flex justify-center mb-5">
                <XCircle className="w-12 h-12 text-[#F25461]" />
              </div>
              <h1 className="text-xl font-bold text-[#FEFAEF] mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                Verification failed
              </h1>
              <p className="text-sm text-[#C8B878] mb-8">{message}</p>
              <Link
                to={ROUTES.ownerLogin}
                className="inline-block w-full rounded-full py-3 text-sm font-bold border border-[#3A3000] text-[#D4A800] transition-colors hover:border-[#FED609] hover:text-[#FED609]"
              >
                Back to login
              </Link>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-[#4A3C00]">
          Need help?{' '}
          <a href="mailto:support@prophives.com" className="text-[#D4A800] hover:underline">
            support@prophives.com
          </a>
        </p>
      </div>
    </div>
  )
}
