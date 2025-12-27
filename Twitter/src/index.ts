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

config()

const app = express()
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
app.use('/users', usersRouter)
app.use('/medias', mediasRouter)
app.use('/static', staticRouter)
app.use('/tweets', tweetRoutes)
app.use('/bookmarks', bookmarkRoutes)
app.use('/likes', likeRoutes)
app.use('/search', searchRouter)
// app.use('/static/video', express.static(UPLOAD_VIDEO_DIR))
// app.use('/static', express.static(UPLOAD_IMAGE_DIR))
//Error Handler cho toàn app
app.use(defaultErrorHandler)

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})
