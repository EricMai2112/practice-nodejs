import { Router } from 'express'
import { createTweetController, getNewFeedController, getTweetChildrenController, getTweetController } from '~/controllers/tweets.controllers'
import {
  audienceValidator,
  createTweetValidator,
  getTweetChildrenValidator,
  paginationValidator,
  tweetIdValidator
} from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, isUserLoggedInValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const tweetRoutes = Router()

/**
 * description: create tweet
 * Body: TweetReqBody
 * header: { Authorization: Bearer <access_token> }
 */
tweetRoutes.post(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  createTweetValidator,
  wrapRequestHandler(createTweetController)
)

/**
 * description: Get tweet detail
 * header: { Authorization: Bearer <access_token> }
 */
tweetRoutes.get(
  '/:tweet_id',
  tweetIdValidator,
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifiedUserValidator),
  audienceValidator,
  wrapRequestHandler(getTweetController)
)

/**
 * description: Get tweet children
 * header: { Authorization: Bearer <access_token> }
 * query: {limit: number, page: number, tweet_type: TweetType}
 */
tweetRoutes.get(
  '/:tweet_id/children',
  tweetIdValidator,
  paginationValidator,
  getTweetChildrenValidator,
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifiedUserValidator),
  audienceValidator,
  wrapRequestHandler(getTweetChildrenController)
)

/**
 * description: Get new feeds
 * header: { Authorization: Bearer <access_token> }
 * query: {limit: number, page: number}
 */
tweetRoutes.get(
  '/',
  paginationValidator,
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(getNewFeedController)
)

export default tweetRoutes
