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

export {getReservations}
