import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { getProfile, formatDate } from '@/lib/profiles'
import { AppShell } from '@/components/AppShell'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'

export function ProfileDetail() {
  const { id } = useParams()
  const profile = id ? getProfile(id) : undefined

  if (!profile) {
    return (
      <AppShell>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Profile not found
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          No profile exists with this id.
        </p>
        <Link
          to="/"
          className="mt-4 inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          <ArrowLeft className="size-4" /> Back to profiles
        </Link>
      </AppShell>
    )
  }

  const fields = [
    { label: 'First name', value: profile.firstName },
    { label: 'Last name', value: profile.lastName },
    { label: 'Date of birth', value: formatDate(profile.dateOfBirth) },
    { label: 'Email', value: profile.email },
    { label: 'Profile created', value: formatDate(profile.createdAt) },
  ]

  return (
    <AppShell>
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to profiles
      </Link>
      <div className="mt-4 flex items-center gap-4">
        <Avatar className="size-14">
          <AvatarFallback className="bg-primary/10 font-heading text-lg font-semibold text-primary">
            {profile.firstName[0]}
            {profile.lastName[0]}
          </AvatarFallback>
        </Avatar>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {profile.firstName} {profile.lastName}
        </h1>
      </div>
      <Card className="mt-6 py-0">
        <dl className="divide-y">
          {fields.map((field) => (
            <div
              key={field.label}
              className="grid grid-cols-1 gap-1 px-5 py-4 sm:grid-cols-3 sm:gap-4"
            >
              <dt className="text-sm text-muted-foreground">{field.label}</dt>
              <dd className="text-sm sm:col-span-2">{field.value}</dd>
            </div>
          ))}
        </dl>
      </Card>
    </AppShell>
  )
}
