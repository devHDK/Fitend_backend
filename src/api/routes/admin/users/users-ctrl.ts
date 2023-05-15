import {Response} from 'express'
import {db} from '../../../../loaders'
import {UserService} from '../../../../services'

async function getUsers(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {search, searchType, status, isMarketing, startAt, endAt, start, perPage} = req.options
    // const ret = await UserService.findAllForAdmin({
    //   search,
    //   searchType,
    //   status,
    //   isMarketing,
    //   startAt,
    //   endAt,
    //   start,
    //   perPage
    // })
    res.status(200).json()
  } catch (e) {
    next(e)
  }
}

async function getUsersWithId(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    // const ret = await UserService.findOneForAdmin(req.options.id)
    res.status(200).json()
  } catch (e) {
    if (e.message === 'not_found') e.status = 404
    next(e)
  }
}

export {
  getUsers,
  getUsersWithId
}
