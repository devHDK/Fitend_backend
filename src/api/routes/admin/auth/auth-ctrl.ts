import {Response} from 'express'
import {AdministratorService} from '../../../../services'

async function postAuth(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {username, password} = req.options
    const accessToken = await AdministratorService.signIn(username, password)
    res.status(200).json({accessToken})
  } catch (e) {
    if (e.message === 'not_found') e.status = 404
    next(e)
  }
}

export {postAuth}
