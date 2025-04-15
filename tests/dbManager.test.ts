import InMemoryDBManager from '../src/db/dbManager'
import { ClockEvent, ClockEventTypeEnum } from '../src/types/clockEventTypes'

describe('InMemoryDBManager', () => {
  let dbManager: InMemoryDBManager

  beforeEach(() => {
    dbManager = new InMemoryDBManager()
  })

  it('should return an empty array for a new user', async () => {
    const events = await dbManager.getAllUserEvents('user1')
    expect(events).toEqual([])
  })

  it('should store and retrieve events for a user', async () => {
    const event: ClockEvent = {
      employeeName: 'user1',
      eventType: ClockEventTypeEnum.CLOCK_IN,
      timestamp: new Date('2025-04-15T08:00:00Z')
    }

    await dbManager.saveEvent(event)

    const events = await dbManager.getAllUserEvents('user1')
    expect(events).toHaveLength(1)
    expect(events[0]).toEqual(event)
  })
})