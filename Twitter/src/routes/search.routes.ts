import { Router } from 'express'
import { searchController } from '~/controllers/searchs.controllers'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'

const searchRouter = Router()

searchRouter.get('/', accessTokenValidator, verifiedUserValidator, searchController)

export default searchRouter
