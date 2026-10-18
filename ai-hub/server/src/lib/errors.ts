export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'CONNECTION_REQUIRED'
  | 'PROVIDER_AUTH_FAILED'
  | 'PROVIDER_RATE_LIMITED'
  | 'PROVIDER_ERROR'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR';

/** An error that maps directly to an HTTP response: `{ error: { code, message, details? } }`. */
export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: ErrorCode,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const notFound = (what: string) => new AppError(404, 'NOT_FOUND', `${what} not found`);

/**
 * Upstream AI provider failures. Never 401 — the frontend treats 401 as
 * "your session expired", which a bad provider key is not.
 */
export class ProviderError extends AppError {
  constructor(code: 'PROVIDER_AUTH_FAILED' | 'PROVIDER_RATE_LIMITED' | 'PROVIDER_ERROR', message: string) {
    const status = code === 'PROVIDER_AUTH_FAILED' ? 422 : code === 'PROVIDER_RATE_LIMITED' ? 429 : 502;
    super(status, code, message);
    this.name = 'ProviderError';
  }
}

/** Thrown when the caller aborted the request (e.g. the user pressed "Stop"). */
export class AbortedError extends Error {
  constructor() {
    super('Request aborted');
    this.name = 'AbortedError';
  }
}
