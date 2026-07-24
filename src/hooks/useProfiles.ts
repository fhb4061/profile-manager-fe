import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Profiles } from '@/models/profile'

export function useProfiles() {
  return useQuery({
    queryKey: ['profiles'],
    queryFn: () => api.get<Profiles>('/profiles').then((res) => res.data),
  })
}
