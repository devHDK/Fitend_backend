import {Response} from 'express'
import {db} from '../../../../loaders'
import {InquiryService, PointService, UserGiftiConService, UserService} from '../../../../services'

async function getUsers(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {search, searchType, status, isMarketing, startAt, endAt, start, perPage} = req.options
    const ret = await UserService.findAllForAdmin({
      search,
      searchType,
      status,
      isMarketing,
      startAt,
      endAt,
      start,
      perPage
    })
    res.status(200).json(ret)
  } catch (e) {
    next(e)
  }
}

async function getUsersDelete(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {search, searchType, startAt, endAt, start, perPage} = req.options
    const ret = await UserService.findAllDeleteForAdmin({
      search,
      searchType,
      startAt,
      endAt,
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

// async function getUsersMissionsWithId(req: IRequest, res: Response, next: Function): Promise<void> {
//   try {
//     const {status, isMarketing, startAt, endAt, start, perPage} = req.options
//     const ret = await UserService.findAllForAdmin({status, isMarketing, startAt, endAt, start, perPage})
//     res.status(200).json(ret)
//   } catch (e) {
//     next(e)
//   }
// }

async function getUsersPointsWithId(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {id: userId, type, status, search, searchType, startAt, endAt, start, perPage} = req.options
    const ret = await PointService.findAllWithUserIdForAdmin({
      type,
      status,
      search,
      searchType,
      startAt,
      endAt,
      start,
      perPage,
      userId
    })
    res.status(200).json(ret)
  } catch (e) {
    next(e)
  }
}

async function getUsersGifticonsWithId(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {id: userId, categoryId, searchType, search, startAt, endAt, start, perPage} = req.options
    const ret = await UserGiftiConService.findAllWithUserIdForAdmin({
      userId,
      categoryId,
      search,
      searchType,
      startAt,
      endAt,
      start,
      perPage
    })
    res.status(200).json(ret)
  } catch (e) {
    next(e)
  }
}

async function getUsersInquiriesWithId(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {id: userId, typeId, search, startAt, endAt, start, perPage} = req.options
    const ret = await InquiryService.findAllWithUserIdForAdmin({
      userId,
      typeId,
      search,
      startAt,
      endAt,
      start,
      perPage
    })
    res.status(200).json(ret)
  } catch (e) {
    next(e)
  }
}

async function putUsersPointsWithId(req: IRequest, res: Response, next: Function): Promise<void> {
  const connection = await db.beginTransaction()
  try {
    const {id: userId, point, type} = req.options
    const totalPoint = await UserService.findOne({id: userId})
    if (totalPoint + point < 0) throw new Error('not_enough_point')
    await PointService.create(
      {
        userId,
        point,
        type
      },
      connection
    )
    await UserService.updatePoint({userId, point}, connection)
    await db.commit(connection)
    res.status(200).json()
  } catch (e) {
    if (connection) await db.rollback(connection)
    if (e.message === 'not_enough_point') e.status = 409
    next(e)
  }
}

async function putUsersStatus(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {id, status} = req.options
    if (status === 'delete') await UserService.updateStatus({id, status, deleteType: 'force', deletedAt: new Date()})
    else throw new Error('not_allowed')
    res.status(200).json()
  } catch (e) {
    if (e.message === 'not_allowed') e.status = 403
    next(e)
  }
}

export {
  getUsers,
  getUsersDelete,
  getUsersWithId,
  getUsersPointsWithId,
  getUsersGifticonsWithId,
  getUsersInquiriesWithId,
  putUsersPointsWithId,
  putUsersStatus
}
