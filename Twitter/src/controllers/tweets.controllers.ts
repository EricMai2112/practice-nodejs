import { NextFunction, Request, Response } from 'express'
import { TweetReqBody } from '~/models/requests/Tweet.requests'
import { ParamsDictionary } from 'express-serve-static-core'

export const createTweetController = async (
  req: Request<ParamsDictionary, any, TweetReqBody>,
  res: Response,
  next: NextFunction
) => {
  return res.send('createTweetController')
}
