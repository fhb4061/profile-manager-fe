// Tiny pub-sub so the robot mascot's brain (useRobotBrain) can react to
// mutation outcomes without any per-page coupling: the query client emits
// here on mutation success/error, and the brain hook subscribes globally.
export type RobotEvent = 'success' | 'error'
type RobotEventListener = (event: RobotEvent) => void

const listeners = new Set<RobotEventListener>()

export function emitRobotEvent(event: RobotEvent) {
  listeners.forEach((listener) => listener(event))
}

export function subscribeRobotEvent(listener: RobotEventListener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
