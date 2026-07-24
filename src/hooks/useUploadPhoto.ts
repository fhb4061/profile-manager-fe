import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { uploadPhoto } from '@/lib/photoUpload'

type PresignedPost = {
  url: string
  fields: Record<string, string>
}

export function useUploadPhoto() {
  return useMutation({
    mutationFn: async (file: File) => {
      const { data } = await api.post<PresignedPost>('/profile/photo')
      await uploadPhoto(data.url, data.fields, file)
    },
  })
}
