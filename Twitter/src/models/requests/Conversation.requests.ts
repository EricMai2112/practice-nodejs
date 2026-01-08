import { ParamsDictionary } from 'express-serve-static-core'

export interface getConversationParams extends ParamsDictionary {
  receiver_id: string
}
