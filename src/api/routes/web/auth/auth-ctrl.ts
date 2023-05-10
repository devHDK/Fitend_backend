import {Response} from 'express'
import {TrainerService} from '../../../../services'

async function postAuth(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {email, password} = req.options
    const ret = await TrainerService.signIn({email, password})
    res.status(200).json(ret)
  } catch (e) {
    if (e.message === 'not_found') {
      e.status = 404
      e.code = 1001
      e.message = '이메일 또는 비밀번호를 확인해주세요.'
    }
    next(e)
  }
}

async function postAuthRefresh(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {accessToken, refreshToken} = req.options
    const ret = await TrainerService.refreshToken(accessToken, refreshToken)
    res.status(200).json({accessToken: ret})
  } catch (e) {
    if (e.message === 'invalid_token') {
      e.status = 401
      e.code = 1000
      e.message = '유효하지 않은 토큰입니다.'
    }
    next(e)
  }
}

export {
  postAuth,
  postAuthRefresh
}
