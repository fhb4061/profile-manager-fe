// Dedicated silent-renew redirect target for automaticSilentRenew's hidden
// iframe flow. Kept intentionally minimal (no AppShell, no data fetching)
// so a background token refresh doesn't re-run full app bootstrap. The
// actual renewal handshake is handled by the AuthProvider mounted in
// main.tsx detecting the code/state params and completing the flow.
export function SilentRenew() {
  return null
}
