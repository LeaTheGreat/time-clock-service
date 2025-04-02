import type { MonthlyReport, PunchEvent} from '../models.ts'

/**
 * Calculates a monthly report for an employee.
 *
 * @param employeeName - The name of the employee
 * @param year - The year for the report
 * @param month - The month (1-12) for the report
 * @param events - Array of punch events for the employee
 * @returns A MonthlyReport containing daily hours and total hours
 */
export const calculateMonthlyReport = (
    employeeName: string,
    year: number,
    month: number,
    events: PunchEvent[]
): MonthlyReport => {
    // Filter events that belong to the specified year and month
    const filteredEvents = events.filter(
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
        if (event.eventType === 'in') {
            inTime = event.timestamp
        } else if (event.eventType === 'out' && inTime) {
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
    }
}