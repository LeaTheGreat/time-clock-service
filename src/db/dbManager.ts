import type { ClockEvent } from '../types/clockEventTypes'
import type { IDBManager } from '../types/dbTypes'


export default class InMemoryDBManager implements IDBManager {
  private events: Map<string, ClockEvent[]> = new Map()

  async getAllUserEvents(employeeName: string): Promise<ClockEvent[]> {
    return this.events.get(employeeName) || []
  }

  async saveEvent(event: ClockEvent): Promise<void> {
    const userEvents = this.events.get(event.employeeName) || []
    userEvents.push(event)
    this.events.set(event.employeeName, userEvents)
  }
}