/** Disallow protocol-relative and nonlocal redirects from the login screen. */
export function safeNextPath(raw: string | null, fallback = "/my-space"): string {
  return raw && raw.startsWith("/") && !raw.startsWith("//") && !raw.includes("\\") && !/[\r\n]/.test(raw) ? raw : fallback;
}
