import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { getCameraStream } from '@/lib/camera'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

export function CameraFeed() {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const location = useLocation()
  const navigate = useNavigate()
  const isHome = location.key === 'default'

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

  let content
  if (error?.name === 'NotAllowedError') {
    content = (
      <Alert variant="destructive">
        <AlertDescription>
          Camera access was denied. To use the camera, re-enable it in your browser's site
          settings for this page.
        </AlertDescription>
      </Alert>
    )
  } else if (error) {
    content = (
      <Alert variant="destructive">
        <AlertDescription>
          No camera could be found, or a hardware failure prevented access. Check that a camera
          is connected and try again.
        </AlertDescription>
      </Alert>
    )
  } else if (!stream) {
    content = <Skeleton className="aspect-video w-full" />
  } else {
    content = (
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

  return (
    <>
      {content}
      <Button
        type="button"
        variant="outline"
        className="mt-4"
        onClick={() => (isHome ? navigate('/') : navigate(-1))}
      >
        {isHome ? 'Home' : 'Back'}
      </Button>
    </>
  )
}
