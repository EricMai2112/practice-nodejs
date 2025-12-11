import express from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'

const app = express()
const PORT = 4000

databaseService.connect()

app.get('/', (req, res) => {
  res.send('hello world')
})
//middleware
app.use(express.json())
app.use('/users', usersRouter)

//Error Handler cho toàn app
app.use(defaultErrorHandler)

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})
