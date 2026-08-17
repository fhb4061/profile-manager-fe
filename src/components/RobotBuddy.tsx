import { useIsFetching, useIsMutating } from '@tanstack/react-query'
import { motion } from 'motion/react'
import { useRobotBrain, type RobotMode } from '@/hooks/useRobotBrain'

function RobotSvg({ mode }: { mode: RobotMode }) {
  return (
    <svg viewBox="0 0 64 64" className="size-14" fill="none" stroke="currentColor" strokeWidth="2">
      {/* antenna */}
      <line x1="32" y1="6" x2="32" y2="14" />
      <circle
        cx="32"
        cy="4"
        r="2.5"
        fill={mode === 'busy' ? 'var(--color-primary)' : 'currentColor'}
        className={mode === 'busy' ? 'animate-pulse' : undefined}
      />
      {/* head */}
      <rect x="14" y="14" width="36" height="26" rx="6" />
      {/* eyes: droop on error, wide on success/idle */}
      {mode === 'error' ? (
        <>
          <path d="M22 26 q4 4 8 0" />
          <path d="M34 26 q4 4 8 0" />
        </>
      ) : (
        <>
          <circle cx="26" cy="25" r="2.5" fill="currentColor" />
          <circle cx="38" cy="25" r="2.5" fill="currentColor" />
        </>
      )}
      {/* mouth */}
      <path d={mode === 'success' ? 'M24 33 q8 6 16 0' : 'M24 33 h16'} />
      {/* body */}
      <rect x="18" y="42" width="28" height="16" rx="4" />
    </svg>
  )
}

export function RobotBuddy() {
  const isFetching = useIsFetching()
  const isMutating = useIsMutating()
  const { mode, x } = useRobotBrain({ isFetching, isMutating })

  return (
    <motion.div
      aria-hidden="true"
      data-robot-mode={mode}
      className="pointer-events-none fixed bottom-2 left-0 z-40 size-14 text-primary"
      animate={{ left: `${x}%`, y: mode === 'success' ? -6 : 0 }}
      transition={{ left: { duration: 2, ease: 'easeInOut' }, y: { duration: 0.3, repeat: 1, repeatType: 'reverse' } }}
    >
      <RobotSvg mode={mode} />
    </motion.div>
  )
}
