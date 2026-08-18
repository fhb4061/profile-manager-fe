import { useState } from 'react'
import { useUploadPhoto } from '@/hooks/useUploadPhoto'

const MAX_PHOTO_BYTES = 5 * 1024 * 1024
const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export function usePhotoUpload(sub: string, photoUrl: string | undefined) {
  void sub
  void photoUrl
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const uploadPhotoMutation = useUploadPhoto()

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
    uploadPhotoMutation.mutate(file, {
      onError: () => {
        setUploadError("Couldn't upload photo. Try again.")
        setPreviewUrl((current) => {
          if (current) {
            URL.revokeObjectURL(current)
          }
          return null
        })
      },
    })
  }

  return { previewUrl, validationError, uploadError, upload }
}
