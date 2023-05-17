import {Response} from 'express'
import {UserService} from '../../../../services'

async function postUsers(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {nickname, email, password, phone, birth, gender} = req.options
    await UserService.create({nickname, email, password, phone, birth, gender})
    res.status(200).json()
  } catch (e) {
    if (e.message === 'ER_DUP_ENTRY') e.status = 409
    next(e)
  }
}

async function getUsers(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {start, perPage} = req.options
    const ret = await UserService.findAllForTrainer({start, perPage})
    res.status(200).json(ret)
  } catch (e) {
    next(e)
  }
}

async function putUsers(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {id, nickname, email, password, phone, birth, gender} = req.options
    await UserService.update({id, nickname, email, password, phone, birth, gender})
    res.status(200).json()
  } catch (e) {
    if (e.message === 'ER_DUP_ENTRY') e.status = 409
    next(e)
  }
}

export {
  postUsers,
  getUsers,
  putUsers
}
