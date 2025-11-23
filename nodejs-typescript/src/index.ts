import express from 'express'
import { sum } from './utils'

const app = express()
const port = 3000

app.get('/', (req, res) => {
  const data: any = null
  res.send('Hello World!')
  const value = sum(data)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
