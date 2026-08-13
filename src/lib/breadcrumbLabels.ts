const STATIC_LABELS: Record<string, string> = {
  '/': 'Home',
  '/camera': 'Camera',
  '/profiles': 'Profiles',
  '/profile/edit': 'Edit Profile',
}

export function getCrumbLabel(path: string): string {
  return STATIC_LABELS[path]
}
