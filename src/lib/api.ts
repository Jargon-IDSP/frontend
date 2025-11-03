export const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

export type NormalizedQuestion = {
  id: string;
  prompt: string;
  details?: string;
};

const PROMPT_KEYS = [
  "prompt",
  "question",
  "text",
  "content",
  "title",
  "body",
  "message",
  "value",
  "q",
  "label",
];

const DETAILS_KEYS = ["details", "hint", "description", "explanation", "extra"];

function findStringByKeys(
  node: unknown,
  keys: string[],
  maxDepth = 4
): string | undefined {
  if (maxDepth < 0 || node == null) return undefined;

  if (typeof node === "string") return node;

  if (Array.isArray(node)) {
    for (const item of node) {
      const hit = findStringByKeys(item, keys, maxDepth - 1);
      if (hit) return hit;
    }
    return undefined;
  }

  if (typeof node === "object") {
    const obj = node as Record<string, unknown>;
    for (const k of keys) {
      const v = obj[k];
      if (typeof v === "string" && v.trim()) return v;
      if (typeof v === "object") {
        const nested = findStringByKeys(v, keys, maxDepth - 1);
        if (nested) return nested;
      }
    }
    const wrappers = [
      "data",
      "result",
      "item",
      "question",
      "payload",
      "attributes",
    ];
    for (const w of wrappers) {
      if (w in obj) {
        const hit = findStringByKeys(obj[w], keys, maxDepth - 1);
        if (hit) return hit;
      }
    }
    for (const v of Object.values(obj)) {
      const hit = findStringByKeys(v, keys, maxDepth - 1);
      if (hit) return hit;
    }
  }
  return undefined;
}

function findId(node: unknown, maxDepth = 4): string | undefined {
  if (maxDepth < 0 || node == null) return undefined;
  if (typeof node === "string" && node.length > 6) return node;

  if (Array.isArray(node)) {
    for (const item of node) {
      const hit = findId(item, maxDepth - 1);
      if (hit) return hit;
    }
    return undefined;
  }

  if (typeof node === "object") {
    const obj = node as Record<string, unknown>;
    const idKeys = ["id", "_id", "uuid", "key"];
    for (const k of idKeys) {
      const v = obj[k];
      if (typeof v === "string" && v) return v;
      if (typeof v === "number") return String(v);
    }
    const wrappers = [
      "data",
      "result",
      "item",
      "question",
      "payload",
      "attributes",
    ];
    for (const w of wrappers) {
      if (w in obj) {
        const hit = findId(obj[w], maxDepth - 1);
        if (hit) return hit;
      }
    }
    for (const v of Object.values(obj)) {
      const hit = findId(v, maxDepth - 1);
      if (hit) return hit;
    }
  }
  return undefined;
}

export async function fetchRandomQuestion(
  token?: string
): Promise<NormalizedQuestion & { __raw?: unknown }> {
  const headers: HeadersInit = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BACKEND_URL}/questions/random`, { headers });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

  const raw = await res.json();

  const prompt = findStringByKeys(raw, PROMPT_KEYS);
  const details = findStringByKeys(raw, DETAILS_KEYS);
  const id = findId(raw) ?? crypto.randomUUID();

  if (!prompt) {
    const err = new Error(
      "Question prompt missing in API response."
    ) as Error & { raw?: unknown };
    (err as any).raw = raw;
    throw err;
  }

  return { id, prompt, details, __raw: raw };
}
