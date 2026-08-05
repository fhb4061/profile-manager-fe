import { UserManager, type UserManagerSettings } from 'oidc-client-ts'
import type { AuthProviderProps } from 'react-oidc-context'

// UserManagerSettings for the Cognito Hosted UI, read from Vite env vars so
// dev/staging/prod can point at different User Pools without code changes.
//
// Token storage intentionally left at oidc-client-ts's default
// (WebStorageStateStore backed by window.sessionStorage) rather than being
// overridden here, per spec: session-only, cleared when the tab closes.
const userManagerSettings: UserManagerSettings = {
  authority: import.meta.env.VITE_COGNITO_AUTHORITY,
  client_id: import.meta.env.VITE_COGNITO_CLIENT_ID,
  redirect_uri: import.meta.env.VITE_COGNITO_REDIRECT_URI,
  post_logout_redirect_uri: import.meta.env.VITE_COGNITO_POST_LOGOUT_REDIRECT_URI,
  silent_redirect_uri: import.meta.env.VITE_COGNITO_SILENT_REDIRECT_URI,
  automaticSilentRenew: true,
  response_type: 'code',
  // Identity scopes only. The API is sent the access token (see lib/api.ts), but
  // an access token minted from these scopes carries no API-specific permissions.
  // Once a Cognito resource server exists, add its custom scope(s) here (e.g.
  // 'profiles/read profiles/write') so the API can do scope-based authorization
  // instead of treating any valid pool token as fully authorized.
  scope: 'openid email profile',
}

// Single UserManager instance, shared between AuthProvider (react-oidc-context)
// and code outside the React tree (e.g. an axios interceptor) that needs to
// read the current token without going through a hook.
export const userManager = new UserManager(userManagerSettings)

export const oidcConfig: AuthProviderProps = {
  userManager,
  onSigninCallback: () => {
    // Strip the ?code=&state= params Cognito appends after redirecting back,
    // so they don't linger in the URL or get re-processed on refresh.
    window.history.replaceState({}, document.title, window.location.pathname)
  },
}
