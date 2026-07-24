import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AppShell } from '@/components/AppShell'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useMyProfile } from '@/hooks/useMyProfile'
import { useUpdateProfile } from '@/hooks/useUpdateProfile'
import type { Profile } from '@/models/profile'

function EditProfileForm({ profile }: { profile: Profile }) {
  const navigate = useNavigate()
  const [givenName, setGivenName] = useState(profile.givenName)
  const [familyName, setFamilyName] = useState(profile.familyName)
  const [validationError, setValidationError] = useState<string | null>(null)
  const mutation = useUpdateProfile(profile.sub)
  const profilePath = `/profile/${profile.sub}`

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
      { onSuccess: () => navigate(profilePath) }
    )
  }

  return (
    <form onSubmit={handleSubmit}>
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

      {validationError && <FieldError className="mt-2">{validationError}</FieldError>}

      {mutation.isError && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>Couldn't save changes. Try again.</AlertDescription>
        </Alert>
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
  const { data, isLoading } = useMyProfile()

  return (
    <AppShell>
      <h1 className="font-heading text-2xl font-semibold tracking-tight">Edit profile</h1>

      {isLoading && (
        <div className="mt-6 flex flex-col gap-4">
          <Skeleton className="h-7 w-full" />
          <Skeleton className="h-7 w-full" />
          <Skeleton className="h-7 w-full" />
        </div>
      )}

      {data && !isLoading && (
        <div className="mt-6">
          <EditProfileForm profile={data} />
        </div>
      )}
    </AppShell>
  )
}
