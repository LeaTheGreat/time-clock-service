import { calculateMonthlyReport } from '../src/services/timeClockService.js'
import { PunchEvent } from '../src/models.js'

describe('calculateMonthlyReport', () => {
    const employeeName = 'Employee Doe'
    const year = 2025
    const month = 4 

    it('should calculate report correctly with one in/out pair', () => {
        const events: PunchEvent[] = [
            {
                employeeName,
                eventType: 'in',
                timestamp: new Date('2025-04-01T08:00:00Z')
            },
            {
                employeeName,
                eventType: 'out',
                timestamp: new Date('2025-04-01T17:00:00Z')
            }
        ]
        const report = calculateMonthlyReport(employeeName, year, month, events)
        expect(report.totalHours).toBeCloseTo(9, 1)
        expect(report.dailyHours['2025-04-01']).toBeCloseTo(9, 1)
    })

    it('should handle multiple days', () => {
        const events: PunchEvent[] = [
            {
                employeeName,
                eventType: 'in',
                timestamp: new Date('2025-04-01T08:00:00Z')
            },
            {
                employeeName,
                eventType: 'out',
                timestamp: new Date('2025-04-01T12:00:00Z')
            },
            {
                employeeName,
                eventType: 'in',
                timestamp: new Date('2025-04-02T09:00:00Z')
            },
            {
                employeeName,
                eventType: 'out',
                timestamp: new Date('2025-04-02T17:00:00Z')
            }
        ]
        const report = calculateMonthlyReport(employeeName, year, month, events)
        expect(report.totalHours).toBeCloseTo(12, 1)
        expect(report.dailyHours['2025-04-01']).toBeCloseTo(4, 1)
        expect(report.dailyHours['2025-04-02']).toBeCloseTo(8, 1)
    })

    it('should ignore events outside of specified month/year', () => {
        const events: PunchEvent[] = [
            {
                employeeName,
                eventType: 'in',
                timestamp: new Date('2025-02-28T23:00:00Z')
            },
            {
                employeeName,
                eventType: 'out',
                timestamp: new Date('2025-03-01T02:00:00Z')
            },
            {
                employeeName,
                eventType: 'in',
                timestamp: new Date('2025-05-30T22:00:00Z')
            },
            {
                employeeName,
                eventType: 'out',
                timestamp: new Date('2025-06-01T01:00:00Z')
            }
        ]
        const report = calculateMonthlyReport(employeeName, year, month, events)

        expect(report.totalHours).toBe(0)
        expect(report.dailyHours).toEqual({})
    })

    it('should handle unmatched in events gracefully', () => {
        const events: PunchEvent[] = [
            {
                employeeName: "Another Employee",
                eventType: 'in',
                timestamp: new Date('2025-04-10T08:00:00Z')
            }
        ]
        const report = calculateMonthlyReport(employeeName, year, month, events)
        expect(report.totalHours).toBe(0)
        expect(report.dailyHours).toEqual({})
    })

    it('should handle multiple "in" events without "out" events', () => {
        const events: PunchEvent[] = [
            {
                employeeName,
                eventType: 'in',
                timestamp: new Date('2025-04-01T08:00:00Z')
            },
            {
                employeeName,
                eventType: 'in',
                timestamp: new Date('2025-04-01T09:00:00Z')
            },
            {
                employeeName,
                eventType: 'in',
                timestamp: new Date('2025-04-02T10:00:00Z')
            }
        ]
        const report = calculateMonthlyReport(employeeName, year, month, events)
        expect(report.totalHours).toBe(0)
        expect(report.dailyHours).toEqual({})
    })


    // Potential enchencments - not implemented

    it('should handle edge dates of the month ("in" event at the last day of the month and "out" event in the next month)', () => {
        const events: PunchEvent[] = [
            {
                employeeName,
                eventType: 'in',
                timestamp: new Date('2025-04-30T22:00:00Z')
            },
            {
                employeeName,
                eventType: 'out',
                timestamp: new Date('2025-05-01T06:00:00Z')
            }
        ]
        // const report = calculateMonthlyReport(employeeName, year, month, events)
        // expect(report.totalHours).toBeCloseTo(2, 1)
        // expect(report.dailyHours['2025-04-30']).toBeCloseTo(2, 1)
    })
})

