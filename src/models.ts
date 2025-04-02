export type PunchEventType = 'in' | 'out'

export interface PunchEvent {
    employeeName: string
    eventType: PunchEventType
    timestamp: Date
}

export interface MonthlyReport {
    employee: string
    year: number
    month: number
    dailyHours: Record<string, number>
    totalHours: number
}