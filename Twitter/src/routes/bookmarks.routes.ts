import { Router } from 'express'
import { bookmarkTweetController, unBookmarkTweetController } from '~/controllers/bookmarks.controllers'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const bookmarkRoutes = Router()

/**
 * description: Bookmark Tweet
 * Body: sweet_id: string
 * header: { Authorization: Bearer <access_token> }
 */
bookmarkRoutes.post('', accessTokenValidator, verifiedUserValidator, wrapRequestHandler(bookmarkTweetController))

/**
 * description: unBookmark Tweet
 * Body: sweet_id: string
 * header: { Authorization: Bearer <access_token> }
 */
bookmarkRoutes.delete(
  '/tweets/:tweet_id',
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(unBookmarkTweetController)
)

export default bookmarkRoutes
