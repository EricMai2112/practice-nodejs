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
import { Server } from 'socket.io'
import Conversation from './models/schemas/Conversation.schema'
import conversationsRoute from './routes/conversation.routes'
import { ObjectId } from 'mongodb'

config()

const app = express()
const httpServer = createServer(app)
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
app.use('/conversations', conversationsRoute)
// app.use('/static/video', express.static(UPLOAD_VIDEO_DIR))
// app.use('/static', express.static(UPLOAD_IMAGE_DIR))
//Error Handler cho toàn app
app.use(defaultErrorHandler)

const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:3000'
  }
})

const users: { [key: string]: { socket_id: string } } = {}
io.on('connection', (socket) => {
  console.log(`user ${socket.id} connected`)
  const user_id = socket.handshake.auth._id
  users[user_id] = {
    socket_id: socket.id
  }
  console.log(users)
  socket.on('send_message', async (data) => {
    const { receiver_id, sender_id, content } = data.payload
    const receiver_socket_id = users[receiver_id]?.socket_id
    if (!receiver_socket_id) return

    const conversation = new Conversation({
      sender_id: new ObjectId(sender_id),
      receiver_id: new ObjectId(receiver_id),
      content: content
    })
    const result = await databaseService.conversations.insertOne(conversation)

    conversation._id = result.insertedId

    socket.to(receiver_socket_id).emit('receive_message', {
      payload: conversation
    })
  })
  socket.on('disconnect', () => {
    delete users[user_id]
    console.log(`user ${socket.id} disconnected`)
  })
})

httpServer.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})
