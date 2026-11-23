'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center">
          <h2 className="text-2xl font-bold">Something went wrong</h2>
          <button onClick={reset} className="mt-4 rounded bg-primary px-4 py-2 text-white">
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
