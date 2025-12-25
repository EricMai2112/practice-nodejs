import { NextFunction, Request, Response } from 'express'
import { TweetReqBody } from '~/models/requests/Tweet.requests'
import { ParamsDictionary } from 'express-serve-static-core'
import tweetService from '~/services/tweets.services'
import { TWEETS_MESSAGES } from '~/constants/messages'
import { TokenPayload } from '~/models/requests/User.requests'

export const createTweetController = async (
  req: Request<ParamsDictionary, any, TweetReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await tweetService.createTweet(req.body, user_id)
  return res.json({
    message: TWEETS_MESSAGES.CREATE_SWEET_SUCCESS,
    result
  })
}

export const getTweetController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return res.json({
    message: TWEETS_MESSAGES.GET_TWEET_SUCCESS,
    result: req.tweet
  })
}
