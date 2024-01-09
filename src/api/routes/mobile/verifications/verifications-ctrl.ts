import {Response} from 'express'
import {VerificationService} from '../../../../services'

async function postVerifications(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {type, phone} = req.options

    const ret = await VerificationService.postVerifications({type, phone})
    res.status(200).json(ret)
  } catch (e) {
    if (e.message === 'wrong_input') e.status = 403
    if (e.message === 'not_found') e.status = 404
    if (e.message === 'already_sended') e.status = 405
    if (e.message === 'already_in_use') e.status = 409
    next(e)
  }
}

async function postVerificationsConfirm(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {codeToken, code} = req.options

    const ret = await VerificationService.postVerificationsConfirm({codeToken, code})

    res.status(200).json(ret)
  } catch (e) {
    if (e.message === 'auth_time_expired') e.status = 401
    if (e.message === 'wrong_code') e.status = 403
    next(e)
  }
}

export {postVerifications, postVerificationsConfirm}
