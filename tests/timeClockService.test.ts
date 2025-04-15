import TimeClockService from '../src/services/timeClockService'
import InMemoryDBManager from '../src/db/dbManager'
import { ClockEvent, ClockEventTypeEnum } from '../src/types/clockEventTypes'


describe('TimeClockService', () => {
  let dbManager: InMemoryDBManager
  let timeClockService: TimeClockService
  const employeeName = 'user1'
  const year = 2025
  const month = 4 

  beforeEach(() => {
    dbManager = new InMemoryDBManager()
    timeClockService = new TimeClockService(dbManager)
  })

  it('should record a valid clock-in event as the first event', async () => {
    const event: ClockEvent = {
      employeeName,
      eventType: ClockEventTypeEnum.CLOCK_IN,
      timestamp: new Date('2025-04-15T08:00:00Z')
    }

    await expect(timeClockService.recordEvent(event)).resolves.not.toThrow()
  })

  it('should not allow clock-out as the first event', async () => {
    const event: ClockEvent = {
      employeeName,
      eventType: ClockEventTypeEnum.CLOCK_OUT,
      timestamp: new Date('2025-04-15T08:00:00Z')
    }

    await expect(timeClockService.recordEvent(event))
      .rejects
      .toThrow('Invalid event: The first event for a user must be a clock-in.')
  })

  it('should not allow duplicate events in sequence', async () => {
    const clockIn: ClockEvent = {
      employeeName,
      eventType: ClockEventTypeEnum.CLOCK_IN,
      timestamp: new Date('2025-04-15T08:00:00Z')
    }

    await timeClockService.recordEvent(clockIn)

    const duplicateClockIn: ClockEvent = {
      employeeName,
      eventType: ClockEventTypeEnum.CLOCK_IN,
      timestamp: new Date('2025-04-15T09:00:00Z')
    }

    await expect(timeClockService.recordEvent(duplicateClockIn))
      .rejects
      .toThrow('Invalid event sequence')
  })

  it('should not allow an event with a timestamp that is before the latest event', async () => {
    const firstEvent: ClockEvent = {
      employeeName,
      eventType: ClockEventTypeEnum.CLOCK_IN,
      timestamp: new Date('2025-04-15T10:00:00Z')
    }

    await timeClockService.recordEvent(firstEvent)

    const invalidEvent: ClockEvent = {
      employeeName,
      eventType: ClockEventTypeEnum.CLOCK_OUT,
      timestamp: new Date('2025-04-15T09:00:00Z') // Earlier than the clock-in
    }

    await expect(timeClockService.recordEvent(invalidEvent))
      .rejects
      .toThrow('Invalid event timing')
  })

  // Tests for calculateMonthlyReport 
  it('should calculate report correctly with one in/out pair', async () => {
    const events: ClockEvent[] = [
        {
            employeeName,
            eventType: ClockEventTypeEnum.CLOCK_IN,
            timestamp: new Date('2025-04-01T08:00:00Z')
        },
        {
            employeeName,
            eventType: ClockEventTypeEnum.CLOCK_OUT,
            timestamp: new Date('2025-04-01T17:00:00Z')
        }
    ]

    await Promise.all(events.map(event => timeClockService.recordEvent(event)))

    const report = await timeClockService.calculateMonthlyReport(employeeName, year, month)

    expect(report.totalHours).toBeCloseTo(9, 1)
    expect(report.dailyHours['2025-04-01']).toBeCloseTo(9, 1)
  })

  it('should handle multiple days', async () => {
    const events: ClockEvent[] = [
        {
            employeeName,
            eventType: ClockEventTypeEnum.CLOCK_IN,
            timestamp: new Date('2025-04-01T08:00:00Z')
        },
        {
            employeeName,
            eventType: ClockEventTypeEnum.CLOCK_OUT,
            timestamp: new Date('2025-04-01T12:00:00Z')
        },
        {
            employeeName,
            eventType: ClockEventTypeEnum.CLOCK_IN,
            timestamp: new Date('2025-04-02T09:00:00Z')
        },
        {
            employeeName,
            eventType: ClockEventTypeEnum.CLOCK_OUT,
            timestamp: new Date('2025-04-02T17:00:00Z')
        }
    ]

    await Promise.all(events.map(event => timeClockService.recordEvent(event)))

    const report = await timeClockService.calculateMonthlyReport(employeeName, year, month)

    expect(report.totalHours).toBeCloseTo(12, 1)
    expect(report.dailyHours['2025-04-01']).toBeCloseTo(4, 1)
    expect(report.dailyHours['2025-04-02']).toBeCloseTo(8, 1)
  })

  it('should ignore events outside of specified month/year', async () => {
    const events: ClockEvent[] = [
        {
            employeeName,
            eventType: ClockEventTypeEnum.CLOCK_IN,
            timestamp: new Date('2025-02-28T23:00:00Z')
        },
        {
            employeeName,
            eventType: ClockEventTypeEnum.CLOCK_OUT,
            timestamp: new Date('2025-03-01T02:00:00Z')
        },
        {
            employeeName,
            eventType: ClockEventTypeEnum.CLOCK_IN,
            timestamp: new Date('2025-05-30T22:00:00Z')
        },
        {
            employeeName,
            eventType: ClockEventTypeEnum.CLOCK_OUT,
            timestamp: new Date('2025-06-01T01:00:00Z')
        }
    ]

    await Promise.all(events.map(event => timeClockService.recordEvent(event)))

    const report = await timeClockService.calculateMonthlyReport(employeeName, year, month)

    expect(report.totalHours).toBe(0)
    expect(report.dailyHours).toEqual({}) 
  })

  it('should throw when there are no events for the requested employeeName', async () => {
    const invalidEmployeeName = 'nonExistentUser'
    const event: ClockEvent = { 
        employeeName: invalidEmployeeName,
        eventType: ClockEventTypeEnum.CLOCK_IN,
        timestamp: new Date('2025-04-10T08:00:00Z')
    }

    await timeClockService.recordEvent(event)

    await expect(timeClockService.calculateMonthlyReport(employeeName, year, month))
      .rejects
      .toThrow(`No events found for employee: ${employeeName}`)
  })

})

