import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Profile } from '@/models/profile'

export function useGetProfile(sub: string | undefined) {
    return useQuery({
        queryKey: ['profile', sub],
        queryFn: () => api.get<Profile>(`/profiles/${sub}`).then((res) => res.data),
        enabled: sub !== undefined,
    })
}
