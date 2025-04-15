import { PunchEventType, PunchEventTypeEnum } from "../models/models.ts"

/**
 * Represents a punch event for an employee, such as clocking in or out.
 */
export class PunchEvent {
    employeeName: string
    eventType: PunchEventType
    timestamp: Date

    private constructor(employeeName: string, eventType: PunchEventType, timestamp: Date) {
        this.employeeName = employeeName
        this.eventType = eventType
        this.timestamp = timestamp
    }

    static create(employeeName: string, eventType: PunchEventType, timestamp?: string | Date): PunchEvent {
        if (!employeeName) {
            throw new Error('employeeName is required.')
        }

        if (![PunchEventTypeEnum.IN, PunchEventTypeEnum.OUT].includes(eventType)) {
            throw new Error(`Invalid eventType. Must be '${PunchEventTypeEnum.IN}' or '${PunchEventTypeEnum.OUT}'.`)
        }

        let parsedTimestamp: Date
        if (timestamp) {
            parsedTimestamp = new Date(timestamp)
            if (isNaN(parsedTimestamp.getTime())) {
                throw new Error('Invalid timestamp format.')
            }
        } else {
            parsedTimestamp = new Date()
        }

        return new PunchEvent(employeeName, eventType, parsedTimestamp)
    }
}
