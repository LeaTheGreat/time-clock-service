import e, { Router } from 'express'
import type { Request, Response } from 'express'
import type {  MonthlyReport } from './models/models.ts'
import { calculateMonthlyReport, isValidEventSequence, isValidEventType, isValidTimestamp } from './services/timeClockService.ts'
import { PunchEventTypeEnum } from './models/models.ts'
import { PunchEvent } from './classes/PunchEvent.ts'

const router = Router()



// In-memory storage for employee punch events.
const employeeRecords: Map<string, PunchEvent[]> = new Map()

/**
 * POST /punch
 * Record a punch event (clock in/out) for an employee.
 * Expected JSON body:
 * {
 *   "employeeName": string,
 *   "eventType": "in" | "out",
 *   "timestamp": string (ISO format, optional)
 * }
 */
router.post('/punch', (req: Request, res: Response) => {
    const { employeeName, eventType, timestamp } = req.body
    let punchEvent: PunchEvent

    try {
        punchEvent = PunchEvent.create(employeeName, eventType, timestamp)
    }
    catch (error: Error ) {
        return res.status(400).json({ error: error.message })
    }

    const records = employeeRecords.get(employeeName)

    if (!records) {
        return res.status(404).json({ error: 'Employee not found.' })
    }

    const lastEvent = records[records.length - 1]

    if (!isValidEventSequence(lastEvent, eventType)) {
        return res.status(422).json({ error: `Invalid sequence of events. Cannot have consecutive '${eventType}' events.` })
    }

    records.push(punchEvent)
    employeeRecords.set(employeeName, records)

    return res.status(200).json({ message: 'Punch event recorded successfully.' })
})

/**
 * GET /report/:employeeName/:year/:month
 * Returns a monthly report for an employee.
 */
router.get('/report/:employeeName/:year/:month', (req: Request, res: Response) => {
    const { employeeName, year, month } = req.params
    const records = employeeRecords.get(employeeName)

    if (!records) {
        return res.status(404).json({ error: 'Employee not found.' })
    }

    const report: MonthlyReport = calculateMonthlyReport(
        employeeName,
        Number(year),
        Number(month),
        records
    )
    return res.status(200).json(report)
})

export { router as apiRouter }