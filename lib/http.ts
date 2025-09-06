// /lib/http.ts

export class HttpError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.data = data;
  }
}

type Json = Record<string, any> | Array<any> | string | number | boolean | null;

export async function safeFetchJSON<T = any>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(input, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers || {}),
      },
    });
  } catch (e: any) {
    // Network/DNS/timeouts
    throw new HttpError(e?.message || "Network error", 0);
  }

  // Attempt to parse JSON (even on errors)
  let payload: any = null;
  const text = await res.text();
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = text;
  }

  if (!res.ok) {
    const msg =
      (payload && (payload.error?.message || payload.error || payload.msg)) ||
      `Request failed (${res.status})`;
    throw new HttpError(msg, res.status, payload);
  }

  return payload as T;
}

/**
 * Helper to build body safely
 */
export function jsonBody(body: Json): RequestInit {
  return {
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}
