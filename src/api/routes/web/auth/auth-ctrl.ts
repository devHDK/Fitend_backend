import {Response} from 'express'
import {AuthService, TrainerService} from '../../../../services'
import {refreshToken} from '../../../../services/authService'

async function postAuth(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {email, password, platform, deviceId, token} = req.options
    const ret = await TrainerService.signIn({email, password, platform, deviceId, token})

    res.status(200).json(ret)
  } catch (e) {
    if (e.message === 'not_found') e.status = 404
    if (e.message === 'invalid_password') e.status = 409
    next(e)
  }
}

async function postAuthRefresh(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {accessToken, refreshToken} = req.options
    const ret = await AuthService.refreshToken(accessToken, refreshToken)
    res.status(200).json({accessToken: ret})
  } catch (e) {
    if (e.message === 'invalid_token') {
      e.status = 401
      e.message = '유효하지 않은 토큰입니다.'
    }
    next(e)
  }
}

async function postAuthLogout(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    await AuthService.signOutTrainer(req.userId, req.options.platform, req.options.deviceId)
    res.status(200).json()
  } catch (e) {
    next(e)
  }
}

async function putAuthPassword(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {password, newPassword} = req.options
    const ret = await TrainerService.updatePassword({trainerId: req.userId, password, newPassword})
    res.status(200).json(ret)
  } catch (e) {
    if (e.message === 'not_found') e.status = 404
    next(e)
  }
}

export {postAuth, postAuthRefresh, postAuthLogout, putAuthPassword}
