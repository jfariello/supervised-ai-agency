const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const blockedDomains = new Set(["example.com", "sentry.io", "wixpress.com", "squarespace.com"]);
const blockedEmails = new Set([
  "test@mail.com",
  "test@example.com",
  "email@example.com",
  "mail@example.com",
  "info@example.com",
  "noreply@example.com",
  "no-reply@example.com"
]);

export function normalizeUrl(url: string | null | undefined) {
  const text = String(url ?? "").trim();
  if (!text) return null;
  if (text.startsWith("http://") || text.startsWith("https://")) return text;
  return `https://${text}`;
}

export function contactUrls(baseUrl: string) {
  const url = new URL(baseUrl);
  const origin = url.origin;
  return [
    baseUrl,
    `${origin}/contacto`,
    `${origin}/contacto/`,
    `${origin}/contact`,
    `${origin}/contact/`,
    `${origin}/quienes-somos`,
    `${origin}/institucional`
  ];
}

export function uniqueEmails(text: string) {
  const found = new Set<string>();
  for (const match of text.match(emailRegex) ?? []) {
    const email = match.toLowerCase().replace(/^mailto:/, "");
    const domain = email.split("@")[1];
    if (blockedEmails.has(email)) continue;
    if (!domain || blockedDomains.has(domain)) continue;
    if (/\.(png|jpg|jpeg|gif|webp|svg)$/i.test(email)) continue;
    found.add(email);
  }
  return [...found];
}

export async function fetchPageText(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "user-agent": "Mozilla/5.0 AgenciaIA/1.0 email discovery for supervised outreach"
      },
      redirect: "follow"
    });
    if (!response.ok) return "";
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html") && !contentType.includes("text/plain")) return "";
    return await response.text();
  } catch {
    return "";
  } finally {
    clearTimeout(timeout);
  }
}

export async function discoverEmailFromWebsite(website: string | null | undefined) {
  const base = normalizeUrl(website);
  if (!base) return null;

  const emails = new Set<string>();
  for (const url of contactUrls(base)) {
    const text = await fetchPageText(url);
    for (const email of uniqueEmails(text)) emails.add(email);
    if (emails.size > 0) break;
  }

  return [...emails][0] ?? null;
}
