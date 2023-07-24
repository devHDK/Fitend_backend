import {Response} from 'express'
import {ReservationService} from '../../../../services'

async function postReservations(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {trainerId, userId, ticketId, reservations} = req.options
    await ReservationService.create({
      trainerId,
      userId,
      ticketId,
      reservations
    })
    res.status(200).json()
  } catch (e) {
    if (e.message === 'not_allowed') e.status = 403
    if (e.message === 'expired_ticket') e.status = 403
    if (e.message === 'not_found') e.status = 404
    if (e.message === 'reservation_duplicate') e.status = 409
    if (e.message === 'over_sessions') e.status = 409
    next(e)
  }
}

async function getReservations(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {userId, trainerId, startDate, endDate} = req.options
    const ret = await ReservationService.findAll({
      franchiseId: req.franchiseId,
      userId,
      trainerId,
      startDate,
      endDate
    })
    res.status(200).json({data: ret})
  } catch (e) {
    next(e)
  }
}

async function getReservationsWithId(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const ret = await ReservationService.findOneWithId(req.options.id)
    if (!ret) throw new Error('not_found')
    res.status(200).json(ret)
  } catch (e) {
    if (e.message === 'not_found') e.status = 404
    next(e)
  }
}

async function putReservationsWithId(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {id, startTime, endTime, status} = req.options
    await ReservationService.update({id, startTime, endTime, status})
    res.status(200).json()
  } catch (e) {
    if (e.message === 'not_allowed') e.status = 403
    if (e.message === 'reservation_duplicate') e.status = 409
    next(e)
  }
}

// async function deleteReservationsWithId(req: IRequest, res: Response, next: Function): Promise<void> {
//   try {
//     const {id} = req.options
//     await ReservationService.deleteOne(id)
//     res.status(200).json()
//   } catch (e) {
//     next(e)
//   }
// }

export {postReservations, getReservations, getReservationsWithId, putReservationsWithId}
