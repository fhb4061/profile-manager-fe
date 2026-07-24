export type Profile = {
    sub: string;
    givenName: string;
    familyName: string;
    initials: string;
    email?: string;
}

export type Profiles = {
    items: Profile[]
}