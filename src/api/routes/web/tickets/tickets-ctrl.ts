import {Response} from 'express'
import {TicketService} from '../../../../services'

async function postTickets(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {type, userId, trainerIds, totalSession, startedAt, expiredAt} = req.options
    await TicketService.create({
      type,
      userId,
      trainerIds,
      franchiseId: req.franchiseId,
      totalSession,
      startedAt,
      expiredAt
    })
    res.status(200).json()
  } catch (e) {
    next(e)
  }
}

async function getTickets(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {search, status, trainerId, start, perPage} = req.options
    const ret = await TicketService.findAll({franchiseId: req.franchiseId, search, status, trainerId, start, perPage})
    res.status(200).json(ret)
  } catch (e) {
    next(e)
  }
}

async function getTicketsWithId(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const ret = await TicketService.findOneWithId(req.options.id)
    if (!ret) throw new Error('not_found')
    res.status(200).json(ret)
  } catch (e) {
    if (e.message === 'not_found') e.status = 404
    next(e)
  }
}

async function putTicketsWithId(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {id, type, userId, trainerIds, totalSession, startedAt, expiredAt} = req.options
    await TicketService.update({
      id,
      type,
      userId,
      trainerIds,
      franchiseId: req.franchiseId,
      totalSession,
      startedAt,
      expiredAt
    })
    res.status(200).json()
  } catch (e) {
    if (e.message === 'not_allowed') e.status = 403
    next(e)
  }
}

async function deleteTicketsWithId(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    await TicketService.deleteOne(req.options.id)
    res.status(200).json()
  } catch (e) {
    next(e)
  }
}

export {postTickets, getTickets, getTicketsWithId, putTicketsWithId, deleteTicketsWithId}
