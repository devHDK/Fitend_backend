import {Response} from 'express'
import {UserService} from '../../../../services'

async function getUsers(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {search, trainerSearch, status, start, perPage} = req.options
    const ret = await UserService.findAllForAdmin({
      search,
      trainerSearch,
      status,
      franchiseId: 1,
      start,
      perPage
    })
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
    if (e.message === 'not_found') e.status = 404
    next(e)
  }
}

async function getUsersBodySpecsWithId(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {id, start, perPage} = req.options
    const ret = await UserService.findBodySpecsWithId({id, start, perPage})
    res.status(200).json(ret)
  } catch (e) {
    next(e)
  }
}

async function putUsers(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {id, nickname, email, password, phone, birth, gender, memo} = req.options
    await UserService.update({id, nickname, email, password, phone, birth, gender, memo})
    res.status(200).json()
  } catch (e) {
    if (e.message === 'already_in_use') e.status = 409
    next(e)
  }
}

export {getUsers, getUsersWithId, getUsersBodySpecsWithId, putUsers}
