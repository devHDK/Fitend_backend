import {Response} from 'express'
import {UserService} from '../../../../services'

async function postUsersPasswordConfirm(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    await UserService.confirmPassword({id: req.userId, password: req.options.password})
    res.status(200).json()
  } catch (e) {
    if (e.message === 'not_found') e.status = 404
    next(e)
  }
}

async function getMe(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const user = await UserService.getMe({id: req.userId})
    res.status(200).json({user})
  } catch (e) {
    if (e.message === 'ticket_expired') e.status = 401
    if (e.message === 'no_token') e.status = 401
    next(e)
  }
}

async function putFCMToken(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    await UserService.updateFCMToken({
      userId: req.userId,
      token: req.options.token,
      platform: req.options.platform,
      deviceId: req.options.deviceId
    })
    res.status(200).json()
  } catch (e) {
    if (e.message === 'ticket_expired') e.status = 401
    if (e.message === 'no_token') e.status = 401
    next(e)
  }
}

async function putUsersPassword(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {password, newPassword} = req.options
    await UserService.updatePassword({id: req.userId, password, newPassword})
    res.status(200).json()
  } catch (e) {
    if (e.message === 'not_found') e.status = 404
    next(e)
  }
}

export {postUsersPasswordConfirm, getMe, putFCMToken, putUsersPassword}
