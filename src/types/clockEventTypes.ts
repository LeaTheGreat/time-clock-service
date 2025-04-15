export enum ClockEventTypeEnum {
    CLOCK_IN = 'clock_in',
    CLOCK_OUT = 'clock_out',
}

export type ClockEventType = ClockEventTypeEnum.CLOCK_IN | ClockEventTypeEnum.CLOCK_OUT

export interface ClockEvent {
    employeeName: string
    eventType: ClockEventType
    timestamp: Date
}

export interface MonthlyReport {
    employee: string
    year: number
    month: number
    dailyHours: Record<string, number>
    totalHours: number
}