import { useEffect, useRef, useState } from 'react'
import { getCameraStream } from '@/lib/camera'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function CameraFeed() {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    let cancelled = false
    let activeStream: MediaStream | undefined
    getCameraStream()
      .then((mediaStream) => {
        if (cancelled) {
          return
        }
        activeStream = mediaStream
        setStream(mediaStream)
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err)
        }
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

  if (error?.name === 'NotAllowedError') {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Camera access was denied. To use the camera, re-enable it in your browser's site
          settings for this page.
        </AlertDescription>
      </Alert>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          No camera could be found, or a hardware failure prevented access. Check that a camera
          is connected and try again.
        </AlertDescription>
      </Alert>
    )
  }

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
