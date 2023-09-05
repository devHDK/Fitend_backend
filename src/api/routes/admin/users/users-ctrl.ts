import {Response} from 'express'
import {UserService} from '../../../../services'

async function getUsers(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {search, status, franchiseId, start, perPage} = req.options
    const ret = await UserService.findAllForAdmin({
      search,
      status,
      franchiseId,
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
    const ret = await UserService.findOneForAdmin(req.options.id)
    res.status(200).json(ret)
  } catch (e) {
    if (e.message === 'not_found') e.status = 404
    next(e)
  }
}

export {getUsers, getUsersWithId}
