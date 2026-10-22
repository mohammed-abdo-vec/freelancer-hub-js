import axios from 'axios';
import type { ApiError } from '@/shared/types/api';

/** Structural check for the server's `{ error: { code, message } }` body. */
export function isApiError(value: unknown): value is ApiError {
  if (typeof value !== 'object' || value === null || !('error' in value)) return false;
  const { error } = value;
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string' &&
    'message' in error &&
    typeof error.message === 'string'
  );
}

/** Non-axios errors (e.g. the stream error in CHAT-2) carry the body on `.apiError`. */
function hasApiErrorPayload(err: unknown): err is { apiError: ApiError } {
  return typeof err === 'object' && err !== null && 'apiError' in err && isApiError(err.apiError);
}

export function getApiError(err: unknown): ApiError['error'] | null {
  if (axios.isAxiosError(err)) {
    const data: unknown = err.response?.data;
    return isApiError(data) ? data.error : null;
  }
  if (hasApiErrorPayload(err)) return err.apiError.error;
  return null;
}

export function getErrorStatus(err: unknown): number | undefined {
  if (axios.isAxiosError(err)) return err.response?.status;
  if (typeof err === 'object' && err !== null && 'status' in err && typeof err.status === 'number') {
    return err.status;
  }
  return undefined;
}

export function getErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  const apiError = getApiError(err);
  if (apiError) return apiError.message;
  if (err instanceof Error && err.message) {
    return err.message === 'Network Error' ? "Can't reach the server" : err.message;
  }
  return fallback;
}

/** Maps validation `details[]` to `{ [path]: message }`, keeping the first message per path. */
export function getFieldErrors(err: unknown): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const { path, message } of getApiError(err)?.details ?? []) {
    fields[path] ??= message;
  }
  return fields;
}
