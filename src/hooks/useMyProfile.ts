import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Profile } from '@/models/profile'

export function useMyProfile() {
  return useQuery({
    queryKey: ['profile', 'me'],
    queryFn: () => api.get<Profile>('/profile').then((res) => res.data),
  })
}
