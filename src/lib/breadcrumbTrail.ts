export function updateTrail(trail: string[], path: string): string[] {
  const index = trail.indexOf(path)
  if (index !== -1) {
    return trail.slice(0, index + 1)
  }
  return [...trail, path]
}
