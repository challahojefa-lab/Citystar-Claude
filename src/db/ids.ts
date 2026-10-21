/** Current time as an ISO 8601 UTC string. */
export function nowIso(): string {
  return new Date().toISOString();
}

/**
 * Creates a UUID v4.
 * crypto.randomUUID() only exists in secure contexts (https / localhost), so it
 * is missing when testing over plain http://<phone-ip>:5173. The fallback uses
 * getRandomValues(), which works everywhere.
 */
export function newId(): string {
  const c = globalThis.crypto;
  if (typeof c.randomUUID === 'function') {
    return c.randomUUID();
  }
  const bytes = c.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // RFC 4122 variant
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0'));
  return (
    `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-` +
    `${hex.slice(6, 8).join('')}-${hex.slice(8, 10).join('')}-` +
    `${hex.slice(10).join('')}`
  );
}
