import { describe, it, expect, vi } from 'vitest'
import { queryClient } from './queryClient'
import { subscribeRobotEvent } from './robotEvents'

describe('queryClient', () => {
  it('emits a robot success event when a mutation succeeds', async () => {
    const listener = vi.fn()
    const unsubscribe = subscribeRobotEvent(listener)

    const mutation = queryClient
      .getMutationCache()
      .build(queryClient, { mutationFn: () => Promise.resolve('ok') })
    await mutation.execute(undefined)

    expect(listener).toHaveBeenCalledWith('success')
    unsubscribe()
  })

  it('emits a robot error event when a mutation fails', async () => {
    const listener = vi.fn()
    const unsubscribe = subscribeRobotEvent(listener)

    const mutation = queryClient
      .getMutationCache()
      .build(queryClient, { mutationFn: () => Promise.reject(new Error('fail')) })
    await expect(mutation.execute(undefined)).rejects.toThrow('fail')

    expect(listener).toHaveBeenCalledWith('error')
    unsubscribe()
  })
})
