import { ProviderError } from '../lib/errors.js';

/** `fetch` wrapper that turns network and HTTP failures into ProviderError. */
export async function providerFetch(providerName: string, url: string, init: RequestInit): Promise<Response> {
  let res: Response;
  try {
    res = await fetch(url, init);
  } catch (err) {
    if (init.signal?.aborted) throw err;
    throw new ProviderError('PROVIDER_ERROR', `Could not reach ${providerName}. Check your internet connection.`);
  }
  if (!res.ok) throw await toProviderError(providerName, res);
  return res;
}

async function toProviderError(providerName: string, res: Response): Promise<ProviderError> {
  const text = await res.text().catch(() => '');
  const upstream = extractMessage(text) ?? res.statusText;

  const keyRejected =
    res.status === 401 || res.status === 403 || (res.status === 400 && /api[ _-]?key/i.test(upstream));
  if (keyRejected) return new ProviderError('PROVIDER_AUTH_FAILED', `${providerName} rejected the API key: ${upstream}`);
  if (res.status === 429) return new ProviderError('PROVIDER_RATE_LIMITED', `${providerName} rate limit reached: ${upstream}`);
  return new ProviderError('PROVIDER_ERROR', `${providerName} error (${res.status}): ${upstream}`);
}

/** Pull a readable message out of the many error body shapes providers use. */
export function extractMessage(body: string): string | null {
  try {
    const json: unknown = JSON.parse(body);
    const first = Array.isArray(json) ? json[0] : json;
    if (first && typeof first === 'object') {
      const obj = first as Record<string, unknown>;
      const err = obj.error;
      if (typeof err === 'string') return err;
      if (err && typeof err === 'object' && typeof (err as Record<string, unknown>).message === 'string') {
        return (err as Record<string, string>).message!;
      }
      if (typeof obj.message === 'string') return obj.message;
      if (typeof obj.detail === 'string') return obj.detail;
    }
  } catch {
    // not JSON
  }
  return body.trim() ? body.trim().slice(0, 300) : null;
}
