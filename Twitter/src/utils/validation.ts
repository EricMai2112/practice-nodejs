import { NextFunction, Request, Response } from 'express'
import { ValidationChain } from 'express-validator'
import { RunnableValidationChains } from 'express-validator/lib/middlewares/schema'

const express = require('express')
const { validationResult } = require('express-validator')

// can be reused by many routes
export const validate = (validation: RunnableValidationChains<ValidationChain>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await validation.run(req)

    const errors = validationResult(req)
    //nếu không có lỗi thì next
    if (errors.isEmpty()) {
      return next()
    }
    return res.status(400).json({ errors: errors.array() })
  }
}
