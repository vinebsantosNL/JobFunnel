import { Resend } from 'resend'

// Lazy singleton — avoids throwing at module instantiation time during build
// when RESEND_API_KEY is not yet bound (static analysis phase).
let _client: Resend | null = null

export function getResend(): Resend {
  if (!_client) {
    if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY env var is not set')
    _client = new Resend(process.env.RESEND_API_KEY)
  }
  return _client
}

// Drop-in shim so existing call sites (`resend.emails.send(...)`) keep working
// without re-instantiating at module load time.
export const resend = {
  emails: {
    send: (...args: Parameters<Resend['emails']['send']>) => getResend().emails.send(...args),
  },
}
