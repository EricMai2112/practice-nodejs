import { NextFunction, Request, Response } from 'express'
import { CONVERSATION_MESSAGES } from '~/constants/messages'
import { getConversationParams } from '~/models/requests/Conversation.requests'
import { TokenPayload } from '~/models/requests/User.requests'
import conversationService from '~/services/conversations.services'

export const getConversationsController = async (req: Request<getConversationParams>, res: Response, next: NextFunction) => {
  const sender_id = req.decoded_authorization?.user_id as string
  const { receiver_id } = req.params
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)

  const result = await conversationService.getConversations({
    sender_id,
    receiver_id,
    limit: Number(limit),
    page: Number(page)
  })
  return res.json({
    message: CONVERSATION_MESSAGES.GET_CONVERSATIONS_SUCCESS,
    result: {
      conversations: result.conversations,
      limit,
      page,
      total_page: Math.ceil(result.total / limit)
    }
  })
}
