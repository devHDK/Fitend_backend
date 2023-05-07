import {Response} from 'express'
import {db} from '../../../../loaders'
import {UserService} from '../../../../services'

async function createUser(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    console.log('createUser')
    const {email, nickname, password} = req.options
    const ret = await UserService.create({email, nickname, password})

    res.status(200).json(ret)
  } catch (e) {
    next(e)
  }
}
export {createUser}
