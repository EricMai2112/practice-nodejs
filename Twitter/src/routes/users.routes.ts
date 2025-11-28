import { Router } from 'express'
import {
  emailVerifyController,
  fotgotPasswordController,
  loginController,
  logoutController,
  registerController,
  resendEmailVerifyController,
  resetPasswordController,
  verifyFotgotPasswordController
} from '~/controllers/users.controllers'
import {
  accessTokenValidator,
  emailVerifyTokenValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  verifyForgotPasswordTokenValidator
} from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const usersRouter = Router()

usersRouter.post('/login', loginValidator, wrapRequestHandler(loginController))

/**
 * Body: {name: string, email: string, password: string, confirm_password: string, date_of_birth: ISO8601}
 */
usersRouter.post('/register', registerValidator, wrapRequestHandler(registerController))

/**
 * header: { Authorization: Bearer <access_token> }
 * Body: { refresh_token: string }
 */
usersRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logoutController))

/**
 * description: verify email when user click on the link in email
 * header: { Authorization: Bearer <access_token> }
 * Body: { email_verify_token: string }
 */
usersRouter.post('/verify-email', emailVerifyTokenValidator, wrapRequestHandler(emailVerifyController))

/**
 * description: resend verify email when user click on the link in email
 * header: { Authorization: Bearer <access_token> }
 * Body: {}
 */
usersRouter.post('/resend-verify-email', accessTokenValidator, wrapRequestHandler(resendEmailVerifyController))

/**
 * description: Submit email to reset password, send email to user
 * Body: {email: string}
 */
usersRouter.post('/forgot-password', forgotPasswordValidator, wrapRequestHandler(fotgotPasswordController))

/**
 * description: Verify link in email to reset password
 * Body: {forgot_password_token: string}
 */
usersRouter.post(
  '/verify-forgot-password',
  verifyForgotPasswordTokenValidator,
  wrapRequestHandler(verifyFotgotPasswordController)
)

/**
 * description: Reset password
 * Body: {forgot_password_token: string, password: string, confirm_password: string}
 */
usersRouter.post('/reset-password', resetPasswordValidator, wrapRequestHandler(resetPasswordController))
export default usersRouter
