import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Profile } from '@/models/profile'

const PHOTO_POLL_INTERVAL_MS = 1500

type PhotoPoll = {
  /** photoUrl captured right before an upload started; poll until it changes. */
  baselinePhotoUrl: string | undefined
}

type UseMyProfileOptions = {
  photoPoll?: PhotoPoll
}

export function useMyProfile(options: UseMyProfileOptions = {}) {
  const { photoPoll } = options

  return useQuery({
    queryKey: ['profile', 'me'],
    queryFn: () => api.get<Profile>('/profile').then((res) => res.data),
    refetchInterval: (query) => {
      if (!photoPoll) {
        return false
      }
      return query.state.data?.photoUrl === photoPoll.baselinePhotoUrl ? PHOTO_POLL_INTERVAL_MS : false
    },
  })
}
