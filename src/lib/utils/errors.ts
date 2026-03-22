import { NextResponse } from 'next/server'

export class AppError extends Error {
  constructor(message: string, public readonly status: number = 500) {
    super(message)
    this.name = 'AppError'
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not found') {
    super(message, 404)
    this.name = 'NotFoundError'
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403)
    this.name = 'ForbiddenError'
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(message, 409)
    this.name = 'ConflictError'
  }
}

export class FreeTierLimitError extends AppError {
  constructor(resource: string) {
    super(
      `Free tier limit reached for ${resource}. Upgrade to Pro for unlimited access.`,
      403
    )
    this.name = 'FreeTierLimitError'
  }
}

export class ProRequiredError extends AppError {
  constructor(feature = 'this feature') {
    super(`Pro subscription required for ${feature}.`, 403)
    this.name = 'ProRequiredError'
  }
}

export class CVLockedError extends AppError {
  constructor() {
    super(
      'CV version cannot be changed after the application reaches screening stage.',
      422
    )
    this.name = 'CVLockedError'
  }
}

export function handleApiError(error: unknown): NextResponse {
  if (error instanceof AppError) {
    return NextResponse.json({ error: error.message }, { status: error.status })
  }
  console.error('[API Error]', error)
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
}
