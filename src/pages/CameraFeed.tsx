import { useEffect, useRef, useState } from 'react'
import { getCameraStream } from '@/lib/camera'
import { Skeleton } from '@/components/ui/skeleton'

export function CameraFeed() {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    let cancelled = false
    let activeStream: MediaStream | undefined
    getCameraStream().then((mediaStream) => {
      if (cancelled) {
        return
      }
      activeStream = mediaStream
      setStream(mediaStream)
    })
    return () => {
      cancelled = true
      activeStream?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  if (!stream) {
    return <Skeleton className="aspect-video w-full" />
  }

  return (
    <video
      ref={videoRef}
      muted
      autoPlay
      playsInline
      style={{ transform: 'scaleX(-1)' }}
      className="aspect-video w-full rounded-md bg-black"
    />
  )
}
