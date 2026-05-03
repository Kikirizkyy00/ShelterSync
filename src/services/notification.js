const NOTIFY_URL = process.env.NEXT_PUBLIC_NOTIFY_URL ?? process.env.NOTIFY_URL;
const TIMEOUT_MS = 8000;

/**
 * Sends a notification via the notification service.
 * @param {{ userId: string, title: string, message: string }} payload
 * @returns {Promise<object>} Parsed JSON response from the server
 * @throws {Error} On network failure, timeout, or non-2xx response
 */
export async function sendNotification(payload) {
  if (!payload?.userId || !payload?.title || !payload?.message) {
    throw new Error(
      `sendNotification: invalid payload — ${JSON.stringify(payload)}`
    );
  }

  if (!NOTIFY_URL) {
    throw new Error(
      "sendNotification: NOTIFY_URL environment variable is not set"
    );
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let res;
  try {
    res = await fetch(`${NOTIFY_URL}/api/notify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch (err) {
    // Network error or aborted
    const reason = err.name === "AbortError" ? "Request timed out" : err.message;
    throw new Error(`sendNotification: network error — ${reason}`);
  } finally {
    clearTimeout(timeoutId);
  }

  if (!res.ok) {
    // Attempt to extract server-side error detail
    const detail = await res.text().catch(() => "(unreadable body)");
    throw new Error(
      `sendNotification: server responded ${res.status} — ${detail}`
    );
  }

  return res.json();
}