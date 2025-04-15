import express from 'express'
import createRoutes from './routes/routes'
import InMemoryDBManager from './db/dbManager'
import TimeClockService from './services/timeClockService'

const app = express()

const dbManager = new InMemoryDBManager()
const timeClockService = new TimeClockService(dbManager)

app.use(express.json())

const routes = createRoutes(timeClockService)
app.use('/api', routes)

if (process.env.NODE_ENV !== 'test') {
    const PORT = process.env.PORT || 3000
    app.listen(PORT, () => console.log(`Server is running on port ${PORT}`))
  }

export default app