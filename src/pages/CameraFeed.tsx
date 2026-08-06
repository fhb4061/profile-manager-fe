import { useEffect, useState } from 'react'
import { getCameraStream } from '@/lib/camera'
import { Skeleton } from '@/components/ui/skeleton'

export function CameraFeed() {
  const [stream, setStream] = useState<MediaStream | null>(null)

  useEffect(() => {
    let cancelled = false
    getCameraStream().then((mediaStream) => {
      if (!cancelled) {
        setStream(mediaStream)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  if (!stream) {
    return <Skeleton className="aspect-video w-full" />
  }

  return null
}
