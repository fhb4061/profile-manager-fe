import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Profiles } from '@/models/profile'

export function useProfiles(options: { enabled?: boolean } = {}) {
  const { enabled = true } = options

  return useQuery({
    queryKey: ['profiles'],
    queryFn: () => api.get<Profiles>('/profiles').then((res) => res.data),
    enabled,
  })
}
