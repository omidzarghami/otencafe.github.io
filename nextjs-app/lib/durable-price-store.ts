/**
 * Durable price overrides for Vercel (survives cold starts).
 * Uses Upstash Redis REST when env is set; otherwise no-op.
 *
 * Required env on Vercel:
 *   UPSTASH_REDIS_REST_URL
 *   UPSTASH_REDIS_REST_TOKEN
 */

const KEY = "oten:prices";

function upstashConfigured() {
  return !!(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

export async function loadDurablePrices(): Promise<Record<string, number> | null> {
  if (!upstashConfigured()) return null;
  try {
    const res = await fetch(
      `${process.env.UPSTASH_REDIS_REST_URL}/get/${encodeURIComponent(KEY)}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
        },
        cache: "no-store",
      }
    );
    if (!res.ok) return null;
    const json = (await res.json()) as { result?: string | null };
    if (!json.result) return null;
    const parsed = JSON.parse(json.result) as Record<string, number>;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch (error) {
    console.error("durable price load failed:", error);
    return null;
  }
}

export async function saveDurablePrices(
  prices: Record<string, number>
): Promise<boolean> {
  if (!upstashConfigured()) return false;
  try {
    const res = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(["SET", KEY, JSON.stringify(prices)]),
    });
    return res.ok;
  } catch (error) {
    console.error("durable price save failed:", error);
    return false;
  }
}
