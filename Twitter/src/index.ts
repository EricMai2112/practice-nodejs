import 'module-alias/register'
import express from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import mediasRouter from './routes/media.routes'
import { initFolder } from './utils/file'
import { config } from 'dotenv'
import staticRouter from './routes/static.routes'
import cors from 'cors'
import tweetRoutes from './routes/tweets.routes'
import bookmarkRoutes from './routes/bookmarks.routes'
import likeRoutes from './routes/like.routes'
import searchRouter from './routes/search.routes'
import './utils/s3'
import { createServer } from 'http'
import conversationsRoute from './routes/conversation.routes'
import initSocket from './utils/socket'
import YAML from 'yaml'
// import fs from 'fs'
// import path from 'path'
import swaggerUi from 'swagger-ui-express'
import swaggerJsdoc from 'swagger-jsdoc'
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'

// const file = fs.readFileSync(path.resolve('twitter-swagger.yaml'), 'utf8')

const options: swaggerJsdoc.Options = {
  failOnErrors: true, // Whether or not to throw when parsing errors. Defaults to false.
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'X clone (Twitter API)',
      version: '1.0.0'
    }
  },
  apis: ['./twitter-swagger.yaml']
  // apis: ['./src/routes/*.routes.ts', './src/models/requests/*.requests.ts']
}
const openapiSpecification = swaggerJsdoc(options)

// const swaggerDocument = YAML.parse(file)

config()

const app = express()

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  ipv6Subnet: 56 // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
  // store: ... , // Redis, Memcached, etc. See below.
})
app.use(limiter)

const httpServer = createServer(app)
app.use(helmet())
app.use(cors())
const PORT = process.env.PORT || 4000

databaseService.connect().then(() => {
  databaseService.indexUser()
  databaseService.indexRefreshTokens()
  databaseService.indexVideoStatus()
  databaseService.indexFollowers()
  databaseService.indexTweets()
})

app.get('/', (req, res) => {
  res.send('hello world')
})

//Tạo folder uploads file nếu chưa có
initFolder()
//middleware
app.use(express.json())
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification))
app.use('/users', usersRouter)
app.use('/medias', mediasRouter)
app.use('/static', staticRouter)
app.use('/tweets', tweetRoutes)
app.use('/bookmarks', bookmarkRoutes)
app.use('/likes', likeRoutes)
app.use('/search', searchRouter)
app.use('/conversations', conversationsRoute)
// app.use('/static/video', express.static(UPLOAD_VIDEO_DIR))
// app.use('/static', express.static(UPLOAD_IMAGE_DIR))
//Error Handler cho toàn app
app.use(defaultErrorHandler)
initSocket(httpServer)

httpServer.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})
