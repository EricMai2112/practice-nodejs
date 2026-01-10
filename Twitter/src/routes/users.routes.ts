import { Router } from 'express'
import {
  changePasswordController,
  emailVerifyController,
  followController,
  fotgotPasswordController,
  getMeController,
  getProfileController,
  loginController,
  logoutController,
  oauthController,
  refreshTokenController,
  registerController,
  resendEmailVerifyController,
  resetPasswordController,
  unFollowController,
  updateMeController,
  verifyFotgotPasswordController
} from '~/controllers/users.controllers'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import {
  accessTokenValidator,
  changePaswordValidator,
  emailVerifyTokenValidator,
  followValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  unFollowValidator,
  updateMeValidator,
  verifiedUserValidator,
  verifyForgotPasswordTokenValidator
} from '~/middlewares/users.middlewares'
import { UpdateMeReqBody } from '~/models/requests/User.requests'
import { wrapRequestHandler } from '~/utils/handlers'

const usersRouter = Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginBody:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: mait58674@gmail.com
 *         password:
 *           type: string
 *           example: Eric123@
 *
 *     SuccessAuthentication:
 *       type: object
 *       properties:
 *         access_token:
 *           type: string
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *         refresh_token:
 *           type: string
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: MongoDB ObjectId
 *           example: 694bb63f48b5edc8a42035c0
 *         name:
 *           type: string
 *           example: ericmai
 *         email:
 *           type: string
 *           format: email
 *           example: mait58674@gmail.com
 *         date_of_birth:
 *           type: string
 *           format: date-time
 *           example: 2004-12-21T07:56:01.354Z
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: 2025-12-24T09:45:35.574Z
 *         updated_at:
 *           type: string
 *           format: date-time
 *           example: 2025-12-24T09:45:52.625Z
 *         verify:
 *           $ref: '#/components/schemas/UserVerifyStatus'
 *         twitter_circle:
 *           type: array
 *           description: List of user IDs in Twitter Circle
 *           items:
 *             type: string
 *             example: 694bb7a0cfecf4e8d41ee579
 *         bio:
 *           type: string
 *           example: ""
 *         location:
 *           type: string
 *           example: ""
 *         website:
 *           type: string
 *           example: ""
 *         username:
 *           type: string
 *           example: user694bb63f48b5edc8a42035c0
 *         avatar:
 *           type: string
 *           description: URL of avatar image
 *           example: ""
 *         cover_photo:
 *           type: string
 *           description: URL of cover photo
 *           example: ""
 *
 *     UserVerifyStatus:
 *       type: integer
 *       enum: [0, 1, 2]
 *       description: 0 = Unverified, 1 = Verified, 2 = Banned
 *       example: 1
 *
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

usersRouter.post('/login', loginValidator, wrapRequestHandler(loginController))

/**
 * description: Login/Register by using OAuth 2.0
 * method: GET
 * query: {code: string}
 */
usersRouter.get('/oauth/google', wrapRequestHandler(oauthController))

/**
 * Body: {name: string, email: string, password: string, confirm_password: string, date_of_birth: ISO8601}
 */
usersRouter.post('/register', registerValidator, wrapRequestHandler(registerController))

/**
 * header: { Authorization: Bearer <access_token> }
 * Body: { refresh_token: string }
 */
usersRouter.post('/logout', refreshTokenValidator, wrapRequestHandler(refreshTokenController))

/**
 * description: Refresh Token
 * Body: { refresh_token: string }
 */
usersRouter.post(
  '/refresh-token',
  accessTokenValidator,
  refreshTokenValidator,
  wrapRequestHandler(refreshTokenController)
)

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

/**
 * description: Get me
 * header: { Authorization: Bearer <access_token> }
 */
usersRouter.get('/me', accessTokenValidator, wrapRequestHandler(getMeController))

/**
 * description: Update my profile
 * header: { Authorization: Bearer <access_token> }
 * body: UserSchema
 */
usersRouter.patch(
  '/me',
  accessTokenValidator,
  verifiedUserValidator,
  updateMeValidator,
  filterMiddleware<UpdateMeReqBody>([
    'name',
    'date_of_birth',
    'bio',
    'website',
    'location',
    'username',
    'avatar',
    'cover_photo'
  ]),
  wrapRequestHandler(updateMeController)
)

/**
 * description: Get user profile
 */
usersRouter.get('/:username', wrapRequestHandler(getProfileController))

/**
 * description: Follow user
 * body: {followed_user_id: string} user_id of followed user
 * header: { Authorization: Bearer <access_token> }
 */
usersRouter.post(
  '/follow',
  accessTokenValidator,
  verifiedUserValidator,
  followValidator,
  wrapRequestHandler(followController)
)

/**
 * description: Unfollow user
 * body: {followed_user_id: string} user_id of followed user
 * header: { Authorization: Bearer <access_token> }
 */
usersRouter.delete(
  '/follow/:user_id',
  accessTokenValidator,
  verifiedUserValidator,
  unFollowValidator,
  wrapRequestHandler(unFollowController)
)

/**
 * description: Change password
 * body: {old_password: string, password: string, confirm_password: string}
 * header: { Authorization: Bearer <access_token> }
 */
usersRouter.put(
  '/change-password',
  accessTokenValidator,
  verifiedUserValidator,
  changePaswordValidator,
  wrapRequestHandler(changePasswordController)
)

export default usersRouter
