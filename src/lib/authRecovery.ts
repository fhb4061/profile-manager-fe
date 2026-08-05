import { userManager } from './auth'
import { queryClient } from './queryClient'

/**
 * Tear down whatever is left of a dead session.
 *
 * Clearing the React Query cache matters as much as clearing the tokens: the
 * cache holds the previous user's profile data, and leaving it in place would
 * show stale (or another user's) content after the session ends.
 */
export async function endSession() {
  queryClient.clear()
  try {
    await userManager.removeUser()
  } catch {
    // Already gone — the app still needs to end up signed-out.
  }
}

/**
 * Subscribe to the session-ending events oidc-client-ts raises outside of any
 * request cycle. Without these, a failed background renew leaves the app
 * rendering as authenticated with credentials that no longer work.
 *
 * - silentRenewError: the refresh token expired or was revoked, so the hidden
 *   renew iframe could not get a new token.
 * - userSignedOut: the session ended at the OP (e.g. global sign-out).
 *
 * Called once from the app entry point. Safe to call again in tests.
 */
export function registerAuthRecovery() {
  userManager.events.addSilentRenewError(() => {
    void endSession()
  })

  userManager.events.addUserSignedOut(() => {
    void endSession()
  })
}
