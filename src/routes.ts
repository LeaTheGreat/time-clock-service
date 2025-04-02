import { Router } from 'express'
import type { Request, Response} from 'express'
import type { PunchEvent, MonthlyReport } from './models.ts'
import { calculateMonthlyReport } from './services/timeClockService.ts'

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

    if (!employeeName || !eventType) {
        return res.status(400).json({ error: 'employeeName and eventType are required.' })
    }
    if (eventType !== 'in' && eventType !== 'out') {
        return res.status(400).json({ error: "Invalid eventType. Must be 'in' or 'out'." })
    }

    let eventTimestamp: Date
    if (timestamp) {
        eventTimestamp = new Date(timestamp)
        if (isNaN(eventTimestamp.getTime())) {
            return res.status(400).json({ error: 'Invalid timestamp format.' })
        }
    } else {
        eventTimestamp = new Date()
    }

    const event: PunchEvent = { employeeName, eventType, timestamp: eventTimestamp }
    const records = employeeRecords.get(employeeName) || []
    records.push(event)
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