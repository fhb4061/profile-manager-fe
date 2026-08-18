import { useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useUploadPhoto } from '@/hooks/useUploadPhoto'
import type { Profile } from '@/models/profile'

const MAX_PHOTO_BYTES = 5 * 1024 * 1024
const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const PHOTO_POLL_INTERVAL_MS = 1500
const PHOTO_POLL_TIMEOUT_MS = 12000

export function usePhotoUpload(sub: string, photoUrl: string | undefined) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isPolling, setIsPolling] = useState(false)
  const uploadPhotoMutation = useUploadPhoto()
  const queryClient = useQueryClient()
  const baselinePhotoUrlRef = useRef<string | undefined>(undefined)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const pollQuery = useQuery({
    queryKey: ['profile', 'me'],
    queryFn: () => api.get<Profile>('/profile').then((res) => res.data),
    enabled: isPolling,
    refetchInterval: isPolling ? PHOTO_POLL_INTERVAL_MS : false,
  })

  function clearPreview() {
    setPreviewUrl((current) => {
      if (current) {
        URL.revokeObjectURL(current)
      }
      return null
    })
  }

  useEffect(() => {
    if (!isPolling || !pollQuery.data) {
      return
    }
    if (pollQuery.data.photoUrl === baselinePhotoUrlRef.current) {
      return
    }

    clearTimeout(timeoutRef.current)
    setIsPolling(false)
    clearPreview()
    queryClient.invalidateQueries({ queryKey: ['profiles'] })
    queryClient.invalidateQueries({ queryKey: ['profile', sub] })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollQuery.data, isPolling, sub])

  function upload(file: File) {
    setValidationError(null)
    setUploadError(null)

    if (file.size > MAX_PHOTO_BYTES) {
      setValidationError('Photo must be 5MB or smaller.')
      return
    }
    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      setValidationError('Photo must be a JPEG, PNG, or WebP image.')
      return
    }

    setPreviewUrl(URL.createObjectURL(file))
    baselinePhotoUrlRef.current = photoUrl

    uploadPhotoMutation.mutate(file, {
      onSuccess: () => {
        setIsPolling(true)
        timeoutRef.current = setTimeout(() => {
          setIsPolling(false)
          setUploadError("Couldn't upload photo. Try again.")
          clearPreview()
        }, PHOTO_POLL_TIMEOUT_MS)
      },
      onError: () => {
        setUploadError("Couldn't upload photo. Try again.")
        clearPreview()
      },
    })
  }

  return { previewUrl, validationError, uploadError, upload }
}
