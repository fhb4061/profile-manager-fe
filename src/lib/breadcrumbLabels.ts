import type { Profile } from '@/models/profile'

const STATIC_LABELS: Record<string, string> = {
  '/': 'Home',
  '/camera': 'Camera',
  '/profiles': 'Profiles',
  '/profile/edit': 'Edit Profile',
}

const PROFILE_PATH_PREFIX = '/profile/'
const PROFILE_PLACEHOLDER_LABEL = 'Profile'

export function getCrumbLabel(path: string, profiles?: Profile[]): string {
  if (path in STATIC_LABELS) {
    return STATIC_LABELS[path]
  }

  if (path.startsWith(PROFILE_PATH_PREFIX)) {
    const id = path.slice(PROFILE_PATH_PREFIX.length)
    const profile = profiles?.find((candidate) => candidate.sub === id)
    return profile?.givenName ?? PROFILE_PLACEHOLDER_LABEL
  }

  return path
}
