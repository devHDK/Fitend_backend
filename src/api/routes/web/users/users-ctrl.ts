import {Response} from 'express'
import {UserService} from '../../../../services'

async function postUsers(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {nickname, email, password, phone, birth, gender, job} = req.options
    await UserService.create({franchiseId: req.userId, nickname, email, password, phone, birth, gender, job})
    res.status(200).json()
  } catch (e) {
    if (e.message === 'already_in_use') e.status = 409
    next(e)
  }
}

async function getUsers(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {search, status, start, perPage} = req.options
    const ret = await UserService.findAllForTrainer({franchiseId: req.franchiseId, start, perPage, search, status})
    res.status(200).json(ret)
  } catch (e) {
    next(e)
  }
}

async function getUsersWithId(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const ret = await UserService.findOneWithId(req.options.id)
    res.status(200).json(ret)
  } catch (e) {
    next(e)
  }
}

async function putUsers(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {id, nickname, email, password, phone, birth, gender, job} = req.options
    await UserService.update({id, nickname, email, password, phone, birth, gender, job})
    res.status(200).json()
  } catch (e) {
    if (e.message === 'already_in_use') e.status = 409
    next(e)
  }
}

export {postUsers, getUsers, getUsersWithId, putUsers}
