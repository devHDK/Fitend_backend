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
    const {search, status, start, perPage} = req.options
    const ret = await TicketService.findAll({search, status, start, perPage})
    res.status(200).json(ret)
  } catch (e) {
    next(e)
  }
}

// async function getWorkoutsWithId(req: IRequest, res: Response, next: Function): Promise<void> {
//   try {
//     const ret = await WorkoutService.findOneWithId(req.options.id)
//     if (!ret) throw new Error('not_found')
//     res.status(200).json(ret)
//   } catch (e) {
//     if (e.message === 'not_found') e.status = 404
//     next(e)
//   }
// }
//
// async function putWorkoutsWithId(req: IRequest, res: Response, next: Function): Promise<void> {
//   try {
//     const {id, title, subTitle, totalTime, exercises} = req.options
//     await WorkoutService.update({
//       id,
//       title,
//       subTitle,
//       totalTime,
//       exercises
//     })
//     res.status(200).json()
//   } catch (e) {
//     next(e)
//   }
// }

export {postTickets, getTickets}
