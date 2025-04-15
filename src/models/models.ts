export enum PunchEventTypeEnum {
    IN = 'in',
    OUT = 'out',
}

export type PunchEventType = PunchEventTypeEnum.IN | PunchEventTypeEnum.OUT

// export interface PunchEvent {
//     employeeName: string
//     eventType: PunchEventType
//     timestamp: Date
// }

export interface MonthlyReport {
    employee: string
    year: number
    month: number
    dailyHours: Record<string, number>
    totalHours: number
}

