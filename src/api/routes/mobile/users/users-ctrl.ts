import {Response} from 'express'
import {db} from '../../../../loaders'
import {UserService} from '../../../../services'
import {IUser} from '../../../../interfaces/user'

async function createUser(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {email, nickname, password} = req.options
    const ret = await UserService.create({email, nickname, password})

    res.status(200).json(ret)
  } catch (e) {
    next(e)
  }
}

async function getOne(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {id} = req.options
    const user = await UserService.getMe({id})

    delete user.password

    res.status(200).json({user})
  } catch (e) {
    next(e)
  }
}

export {createUser, getOne}
