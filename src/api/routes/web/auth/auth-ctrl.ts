import {Response} from 'express'
import {TrainerService} from '../../../../services'

async function postAuth(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {email, password} = req.options
    const ret = await TrainerService.signIn({email, password})
    res.status(200).json(ret)
  } catch (e) {
    if (e.message === 'not_found') e.status = 404
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

export {postAuth, putAuthPassword}
