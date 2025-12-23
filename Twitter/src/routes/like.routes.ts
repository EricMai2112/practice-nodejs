import { Router } from 'express'
import { likeTweetController, unLikeTweetController } from '~/controllers/likes.controllers'
import { tweetIdValidator } from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const likeRoutes = Router()

/**
 * description: Like Tweet
 * Body: sweet_id: string
 * header: { Authorization: Bearer <access_token> }
 */
likeRoutes.post(
  '',
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrapRequestHandler(likeTweetController)
)

/**
 * description: Unlike Tweet
 * Body: sweet_id: string
 * header: { Authorization: Bearer <access_token> }
 */
likeRoutes.delete(
  '/tweets/:tweet_id',
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrapRequestHandler(unLikeTweetController)
)

export default likeRoutes
