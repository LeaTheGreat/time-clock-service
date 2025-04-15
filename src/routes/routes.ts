import { Router } from 'express'
import type { Request, Response } from 'express'
import { body, param, validationResult } from 'express-validator'
import { ClockEvent, MonthlyReport, ClockEventTypeEnum } from '../types/clockEventTypes.ts'
import type { ITimeClockService } from '../types/TimeClockServiceTypes.ts'


export default function createRoutes(timeClockService: ITimeClockService) {
    const router = Router()

    /**
     * POST /punch
     * Record a punch event (clock in/out) for an employee.
     * Expected JSON body:
     * {
     *   "employeeName": string,
     *   "eventType": "clock_in" | "clock_out",
     *   "timestamp": string (ISO format, optional)
     * }
     */
    router.post('/punch', 
        [
            body('employeeName').isString().notEmpty().withMessage('employeeName is required.'),
            body('eventType').isIn([ClockEventTypeEnum.CLOCK_IN, ClockEventTypeEnum.CLOCK_OUT]).withMessage(`eventType must be '${ClockEventTypeEnum.CLOCK_IN}' or '${ClockEventTypeEnum.CLOCK_OUT}'.`),
            body('timestamp').optional().isISO8601().withMessage('Invalid timestamp format. Must be ISO 8601.')
        ],
        async (req: Request, res: Response) => {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
              return res.status(400).json({ success: false, errors: errors.array() })
            }

            const { employeeName, eventType, timestamp } = req.body

            try {
                const event: ClockEvent = {
                    employeeName,
                    eventType,
                    timestamp: timestamp ? new Date(timestamp) : new Date()
                }
                await timeClockService.recordEvent(event)
                return res.status(200).json({ success: true, message: 'Punch event recorded successfully.' })
            }
            catch (error: any) {
                return res.status(400).json({ success: false, errors: [error.message] })
            }
    })

    /**
     * GET /report/:employeeName/:year/:month
     * Returns a monthly report for an employee.
     */
    router.get('/report/:employeeName/:year/:month', 
        [
            param('employeeName').isString().notEmpty().withMessage('employeeName is required.'),
            param('year').isInt({ min: 2000, max: new Date().getFullYear() }).withMessage('year must be a valid year.'),
            param('month').isInt({ min: 1, max: 12 }).withMessage('month must be between 1 and 12.')
        ],
        async (req: Request, res: Response) => {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).json({ success: false, errors: errors.array() });
            }

            try {
                const { employeeName, year, month } = req.params
        
                const report: MonthlyReport = await timeClockService.calculateMonthlyReport(
                    employeeName,
                    Number(year),
                    Number(month),
                )
        
                return res.status(200).json({ success: true, report })
            } catch (error: any) {
                return res.status(400).json({ success: false, errors: [error.message] })
            }
    })
  
    return router
}