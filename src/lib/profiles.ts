export interface Profile {
  id: string
  firstName: string
  lastName: string
  dateOfBirth: string
  email: string
  createdAt: string
}

// Mock data until the backend exists.
export const profiles: Profile[] = [
  {
    id: '1',
    firstName: 'Ada',
    lastName: 'Lovelace',
    dateOfBirth: '1815-12-10',
    email: 'ada.lovelace@example.com',
    createdAt: '2024-01-05',
  },
  {
    id: '2',
    firstName: 'Alan',
    lastName: 'Turing',
    dateOfBirth: '1912-06-23',
    email: 'alan.turing@example.com',
    createdAt: '2024-02-18',
  },
  {
    id: '3',
    firstName: 'Grace',
    lastName: 'Hopper',
    dateOfBirth: '1906-12-09',
    email: 'grace.hopper@example.com',
    createdAt: '2024-03-30',
  },
]

export function getProfile(id: string): Profile | undefined {
  return profiles.find((profile) => profile.id === id)
}

export function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
}
