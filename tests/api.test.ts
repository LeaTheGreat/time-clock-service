import request from 'supertest'
import app from '../src/index.js'
import { Server } from 'http'

describe('Time Clock API Integration Tests', () => {
    let server: Server
    const employee = 'John Doe'

    beforeAll(() => {
        // Start the server before running tests
        server = app.listen(0) 
    })

    afterAll((done) => {
        // Close the server after tests are done
        server.close(done)
    })

    it('should record punch events and generate a monthly report', async () => {
        // Record a clock-in event
        const resIn = await request(app)
            .post('/punch')
            .send({
                employeeName: employee,
                eventType: 'in',
                timestamp: '2025-04-01T08:00:00Z'
            })
        expect(resIn.status).toBe(200)

        // Record a clock-out event
        const resOut = await request(app)
            .post('/punch')
            .send({
                employeeName: employee,
                eventType: 'out',
                timestamp: '2025-04-01T17:00:00Z'
            })
        expect(resOut.status).toBe(200)

        // Retrieve the report for April 2025.
        const resReport = await request(app).get(`/report/${employee}/2025/4`)
        expect(resReport.status).toBe(200)
        const data = resReport.body
        expect(data.totalHours).toBeCloseTo(9, 1)
        expect(data.dailyHours['2025-04-01']).toBeCloseTo(9, 1)
    })

    it('should return 404 for non-existent employee', async () => {
        const res = await request(app).get('/report/NonExistentEmployee/2025/4')
        expect(res.status).toBe(404)
    })
})