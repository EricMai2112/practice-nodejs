import { Router } from 'express'
import { createTweetController } from '~/controllers/tweets.controllers'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const tweetRoutes = Router()

/**
 * description: create tweet
 * Body: TweetReqBody
 */
tweetRoutes.post('/', accessTokenValidator, verifiedUserValidator, wrapRequestHandler(createTweetController))

export default tweetRoutes
