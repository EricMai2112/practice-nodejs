import express = require('express')
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'

const app = express()
const PORT = 3000

app.get('/', (req, res) => {
  res.send('hello world')
})
//middleware
app.use(express.json())
app.use('/users', usersRouter)

databaseService.connect()

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})
