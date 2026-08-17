import { Link } from 'react-router'
import { motion } from 'motion/react'
import { ChevronRight } from 'lucide-react'
import { useProfiles } from '@/hooks/useProfiles'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
}

export function Profiles() {
  const { data, isLoading, isError, isFetching } = useProfiles()

  return (
    <>
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        Profiles
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Browse profiles, or open your own to edit it.
      </p>

      {isError && (
        <Alert variant="destructive" className="mt-6">
          <AlertDescription>Couldn't load profiles. Try again.</AlertDescription>
        </Alert>
      )}

      {!isError && (
        <motion.div
          animate={{ opacity: isFetching && !isLoading ? [1, 0.6, 1] : 1 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          <Card className="hud-panel hud-corners mt-6 py-0">
            {isLoading && (
              <ul className="divide-y">
                {Array.from({ length: 3 }).map((_, index) => (
                  <li key={index} className="flex items-center gap-4 px-5 py-4">
                    <Skeleton className="size-10 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                  </li>
                ))}
              </ul>
            )}

            {data && !isLoading && (
              <motion.ul
                className="divide-y"
                initial="hidden"
                animate="visible"
                variants={listVariants}
              >
                {data.items.map((profile) => (
                  <motion.li key={profile.sub} variants={itemVariants}>
                    <Link
                      to={`/profile/${profile.sub}`}
                      className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-accent"
                    >
                      <Avatar size="lg">
                        <AvatarFallback className="bg-primary/10 font-heading font-semibold text-primary">
                          {profile.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          {profile.givenName} {profile.familyName}
                        </span>
                      </span>
                      <ChevronRight className="size-4 text-muted-foreground" />
                    </Link>
                  </motion.li>
                ))}
              </motion.ul>
            )}
          </Card>
        </motion.div>
      )}
    </>
  )
}
