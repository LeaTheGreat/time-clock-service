import type { IDBManager } from '../types/dbTypes.ts'
import { ClockEvent , ClockEventTypeEnum, MonthlyReport } from '../types/clockEventTypes.ts'
import type { ITimeClockService } from '../types/TimeClockServiceTypes.ts'


export default class TimeClockService implements ITimeClockService {
    private dbManager: IDBManager
  
    constructor(dbManager: IDBManager) {
      this.dbManager = dbManager
    }

    /**
     * Retrieves all clock events for a given user.
     *
     * @param employeeName - The unique identifier for the user.
     * @returns A Promise that resolves to an array of ClockEvent objects.
     */
    private async getAllUserEvents(employeeName: string): Promise<ClockEvent[]> {
        return await this.dbManager.getAllUserEvents(employeeName)
    }
  
    /**
     * Records a new clock event for a user after validating its order.
     *
     * @param event - The clock event to record.
     * @throws Error if the event violates sequence or ordering rules.
     */
    public async recordEvent(event: ClockEvent): Promise<void> {
      const userEvents = await this.getAllUserEvents(event.employeeName)
  
      // First event must be a CLOCK_IN.
      if (userEvents.length === 0) {
        if (event.eventType !== ClockEventTypeEnum.CLOCK_IN) {
          throw new Error(`Invalid event: The first event for a user must be a clock-in.`)
        }
      } else {
        const lastEvent = userEvents[userEvents.length - 1]
  
        // Prevent duplicate event types (e.g., CLOCK_IN after CLOCK_IN).
        if (lastEvent.eventType === event.eventType) {
          throw new Error(`Invalid event sequence: Cannot record a ${event.eventType} after a ${lastEvent.eventType}.`)
        }
  
        // Enforce that the new event's timestamp is later than the last event's.
        if (event.timestamp <= lastEvent.timestamp) {
          throw new Error(
            `Invalid event timing: New event timestamp (${event.timestamp.toISOString()}) must be later than the last event timestamp (${lastEvent.timestamp.toISOString()}).`
          )
        }
      }
  
      await this.dbManager.saveEvent(event)
    }

    /**
     * Calculates a monthly report for an employee.
     *
     * @param employeeName - The name of the employee
     * @param year - The year for the report
     * @param month - The month (1-12) for the report
     * @returns A MonthlyReport containing daily hours and total hours
     */
    public async calculateMonthlyReport(    
        employeeName: string,
        year: number,
        month: number,
    ) : Promise<MonthlyReport> {

        const userEvents = await this.getAllUserEvents(employeeName)

        if (userEvents.length === 0) {
            throw new Error(`No events found for employee: ${employeeName}`)
        }

        // Filter events that belong to the specified year and month
        const filteredEvents = userEvents.filter(
        (e) =>
            e.timestamp.getFullYear() === year &&
            e.timestamp.getMonth() + 1 === month
        )

        // Sort the events by timestamp
        const sortedEvents = filteredEvents.sort(
            (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
        )

        const dailyHours: Record<string, number> = {}
        let inTime: Date | null = null

        sortedEvents.forEach((event) => {
            if (event.eventType === ClockEventTypeEnum.CLOCK_IN) {
                inTime = event.timestamp
            } else if (event.eventType === ClockEventTypeEnum.CLOCK_OUT && inTime) {
                const diffHours = (event.timestamp.getTime() - inTime.getTime()) / (1000 * 60 * 60)
                const dayKey = inTime.toISOString().split('T')[0]
                dailyHours[dayKey] = (dailyHours[dayKey] || 0) + diffHours
                inTime = null
            }
        })

        const totalHours = Object.values(dailyHours).reduce((sum, hrs) => sum + hrs, 0)

        return {
            employee: employeeName,
            year,
            month,
            dailyHours,
            totalHours,
        } as MonthlyReport
    }
}


