// Single source of truth for route path literals. Anything that navigates,
// links, or declares a <Route> should import from here instead of typing a
// path string directly, so a rename or typo fails at compile time.

const PROFILE_PATH_PREFIX = '/profile/'

export const ROUTES = {
  home: '/',
  camera: '/camera',
  profiles: '/profiles',
  profileEdit: '/profile/edit',
  profileDetailPattern: '/profile/:id',
  callback: '/callback',
  silentRenew: '/silent-renew',
} as const

/** Builds the concrete /profile/:id path for a given profile sub. */
export function profileDetail(sub: string): string {
  return `${PROFILE_PATH_PREFIX}${sub}`
}

/** True for /profile/:id paths, which need a profiles lookup to label; false for the static /profile/edit route. */
export function isProfileDetailPath(path: string): boolean {
  return path.startsWith(PROFILE_PATH_PREFIX) && path !== ROUTES.profileEdit
}
