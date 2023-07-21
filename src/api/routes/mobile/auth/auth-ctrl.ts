import {Response} from 'express'
import {AuthService} from '../../../../services'

async function postAuth(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {email, password, deviceId, platform, token} = req.options
    const ret = await AuthService.signIn({email, password, deviceId, platform, token})
    res.status(200).json(ret)
  } catch (e) {
    if (e.message === 'not_allowed') {
      e.status = 403
      e.message = '접근 권한이 없는 회원입니다.'
    }
    if (e.message === 'not_found') {
      e.status = 404
      e.message = '이메일을 확인해주세요.'
    }
    if (e.message === 'invalid_password') {
      e.status = 409
      e.message = '비밀번호를 확인해주세요.'
    }
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

export {postAuth, postAuthRefresh}
