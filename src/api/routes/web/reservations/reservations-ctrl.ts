import {Response} from 'express'
import {ReservationService} from '../../../../services'

async function postReservations(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {ticketId, startTime, endTime} = req.options
    await ReservationService.create({
      trainerId: req.userId,
      ticketId,
      startTime,
      endTime
    })
    res.status(200).json()
  } catch (e) {
    if (e.message === 'not_allowed') e.status = 403
    if (e.message === 'not_found') e.status = 404
    if (e.message === 'reservation_duplicate') e.status = 409
    next(e)
  }
}

// async function getReservations(req: IRequest, res: Response, next: Function): Promise<void> {
//   try {
//     const {search, isMe, isBookmark, types, trainerId, start, perPage} = req.options
//     const ret = await ReservationService.findAll({
//       search,
//       trainerId: req.userId,
//       isMe,
//       isBookmark,
//       trainerFilterId: trainerId,
//       types,
//       start,
//       perPage
//     })
//     res.status(200).json(ret)
//   } catch (e) {
//     next(e)
//   }
// }
//
// async function getReservationsWithId(req: IRequest, res: Response, next: Function): Promise<void> {
//   try {
//     const ret = await ReservationService.findOneWithId(req.options.id, req.userId)
//     if (!ret) throw new Error('not_found')
//     res.status(200).json(ret)
//   } catch (e) {
//     if (e.message === 'not_found') e.status = 404
//     next(e)
//   }
// }
//
// async function putReservationsWithId(req: IRequest, res: Response, next: Function): Promise<void> {
//   try {
//     const {id, title, subTitle, totalTime, exercises} = req.options
//     await ReservationService.update({
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
//
// async function deleteReservationsWithId(req: IRequest, res: Response, next: Function): Promise<void> {
//   try {
//     const {id} = req.options
//     await ReservationService.updateBookmark({
//       workoutId: id,
//       trainerId: req.userId
//     })
//     res.status(200).json()
//   } catch (e) {
//     next(e)
//   }
// }

export {postReservations}
