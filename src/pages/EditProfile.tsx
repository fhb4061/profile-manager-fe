import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'motion/react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useMyProfile } from '@/hooks/useMyProfile'
import { useUpdateProfile } from '@/hooks/useUpdateProfile'
import { useUploadPhoto } from '@/hooks/useUploadPhoto'
import type { Profile } from '@/models/profile'

const MAX_PHOTO_BYTES = 5 * 1024 * 1024
const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const PHOTO_POLL_TIMEOUT_MS = 12000
// How long the save-confirm sweep plays before navigating away, so it's
// actually visible instead of being cut off by the route change.
const SAVE_SWEEP_MS = 350

const shakeAnimation = {
  initial: { x: 0 },
  animate: { x: [0, -8, 8, -6, 6, 0] },
  transition: { duration: 0.4 },
}

type PhotoPoll = { baselinePhotoUrl: string | undefined }

function EditProfileForm({
  profile,
  photoPoll,
  onPhotoPollChange,
}: {
  profile: Profile
  photoPoll: PhotoPoll | undefined
  onPhotoPollChange: (poll: PhotoPoll | undefined) => void
}) {
  const navigate = useNavigate()
  const [givenName, setGivenName] = useState(profile.givenName)
  const [familyName, setFamilyName] = useState(profile.familyName)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [saveConfirmed, setSaveConfirmed] = useState(false)
  const mutation = useUpdateProfile(profile.sub)
  const profilePath = `/profile/${profile.sub}`

  const queryClient = useQueryClient()
  const uploadPhotoMutation = useUploadPhoto()
  const [photoValidationError, setPhotoValidationError] = useState<string | null>(null)
  const [photoUploadError, setPhotoUploadError] = useState<string | null>(null)
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null)
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  // Once the polled profile's photoUrl differs from the baseline captured when the upload
  // started, the new photo has landed — until then (or until upload hasn't started), the
  // local preview (if any) takes priority over whatever photoUrl the profile currently has.
  const photoJustLanded = photoPoll !== undefined && profile.photoUrl !== photoPoll.baselinePhotoUrl
  const displayedPhotoUrl = photoPreviewUrl && !photoJustLanded ? photoPreviewUrl : profile.photoUrl

  useEffect(() => {
    if (!photoJustLanded) {
      return
    }
    clearTimeout(pollTimeoutRef.current)
    onPhotoPollChange(undefined)
    if (photoPreviewUrl) {
      URL.revokeObjectURL(photoPreviewUrl)
    }
    queryClient.invalidateQueries({ queryKey: ['profiles'] })
    queryClient.invalidateQueries({ queryKey: ['profile', profile.sub] })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photoJustLanded])

  function handlePhotoSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) {
      return
    }

    setPhotoValidationError(null)
    setPhotoUploadError(null)
    if (file.size > MAX_PHOTO_BYTES) {
      setPhotoValidationError('Photo must be 5MB or smaller.')
      return
    }
    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      setPhotoValidationError('Photo must be a JPEG, PNG, or WebP image.')
      return
    }

    setPhotoPreviewUrl(URL.createObjectURL(file))
    const baselinePhotoUrl = profile.photoUrl

    uploadPhotoMutation.mutate(file, {
      onSuccess: () => {
        onPhotoPollChange({ baselinePhotoUrl })
        pollTimeoutRef.current = setTimeout(() => {
          setPhotoUploadError("Couldn't upload photo. Try again.")
          setPhotoPreviewUrl((current) => {
            if (current) {
              URL.revokeObjectURL(current)
            }
            return null
          })
          onPhotoPollChange(undefined)
        }, PHOTO_POLL_TIMEOUT_MS)
      },
      onError: () => {
        setPhotoUploadError("Couldn't upload photo. Try again.")
        setPhotoPreviewUrl((current) => {
          if (current) {
            URL.revokeObjectURL(current)
          }
          return null
        })
      },
    })
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()

    const trimmedGivenName = givenName.trim()
    const trimmedFamilyName = familyName.trim()
    if (!trimmedGivenName || !trimmedFamilyName) {
      setValidationError('First and last name are required.')
      return
    }

    setValidationError(null)
    mutation.mutate(
      { givenName: trimmedGivenName, familyName: trimmedFamilyName },
      {
        onSuccess: () => {
          setSaveConfirmed(true)
          setTimeout(() => navigate(profilePath), SAVE_SWEEP_MS)
        },
      }
    )
  }

  return (
    <form onSubmit={handleSubmit} className="relative overflow-hidden">
      <AnimatePresence>
        {saveConfirmed && (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-10"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            exit={{ opacity: 0 }}
            transition={{ duration: SAVE_SWEEP_MS / 1000, ease: 'easeOut' }}
          >
            <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          </motion.div>
        )}
      </AnimatePresence>
      <div className="mb-6 flex items-center gap-4">
        <label htmlFor="photo-input" className="cursor-pointer rounded-full">
          <Avatar size="lg">
            {displayedPhotoUrl && <AvatarImage src={displayedPhotoUrl} alt="" />}
            <AvatarFallback className="bg-primary/10 font-heading font-semibold text-primary">
              {profile.initials}
            </AvatarFallback>
          </Avatar>
        </label>
        <input
          id="photo-input"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          aria-label="Change profile photo"
          className="sr-only"
          onChange={handlePhotoSelected}
        />
      </div>

      {photoValidationError && <FieldError className="mb-4">{photoValidationError}</FieldError>}
      {photoUploadError && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{photoUploadError}</AlertDescription>
        </Alert>
      )}

      <FieldGroup>
        <Field data-invalid={!!validationError}>
          <FieldLabel htmlFor="givenName">First name</FieldLabel>
          <Input
            id="givenName"
            value={givenName}
            onChange={(event) => setGivenName(event.target.value)}
            aria-invalid={!!validationError}
          />
        </Field>
        <Field data-invalid={!!validationError}>
          <FieldLabel htmlFor="familyName">Last name</FieldLabel>
          <Input
            id="familyName"
            value={familyName}
            onChange={(event) => setFamilyName(event.target.value)}
            aria-invalid={!!validationError}
          />
        </Field>
        <Field data-disabled>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" defaultValue={profile.email} disabled />
        </Field>
      </FieldGroup>

      {validationError && (
        <motion.div {...shakeAnimation}>
          <FieldError className="mt-2">{validationError}</FieldError>
        </motion.div>
      )}

      {mutation.isError && (
        <motion.div {...shakeAnimation}>
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>Couldn't save changes. Try again.</AlertDescription>
          </Alert>
        </motion.div>
      )}

      <div className="mt-6 flex gap-2">
        <Button type="submit" disabled={mutation.isPending}>
          Save
        </Button>
        <Button type="button" variant="outline" render={<Link to={profilePath} />} nativeButton={false}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

export function EditProfile() {
  const [photoPoll, setPhotoPoll] = useState<PhotoPoll | undefined>(undefined)
  const { data, isLoading } = useMyProfile({ photoPoll })

  return (
    <>
      <h1 className="font-heading text-2xl font-semibold tracking-tight">Edit profile</h1>

      {isLoading && (
        <div className="mt-6 flex flex-col gap-4">
          <Skeleton className="h-7 w-full" />
          <Skeleton className="h-7 w-full" />
          <Skeleton className="h-7 w-full" />
        </div>
      )}

      {data && !isLoading && (
        <div className="hud-panel hud-corners mt-6 rounded-lg p-6">
          <EditProfileForm profile={data} photoPoll={photoPoll} onPhotoPollChange={setPhotoPoll} />
        </div>
      )}
    </>
  )
}
