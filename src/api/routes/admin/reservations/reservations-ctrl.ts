import {Response} from 'express'
import {ReservationService} from '../../../../services'

async function getReservations(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {userId, trainerId, startDate, endDate} = req.options
    const ret = await ReservationService.findAll({
      franchiseId: 1,
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

export {getReservations, getReservationsWithId}
