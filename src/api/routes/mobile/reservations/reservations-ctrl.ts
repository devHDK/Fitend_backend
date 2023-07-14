import {Response} from 'express'
import {ReservationService} from '../../../../services'

async function getReservations(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {startDate, interval} = req.options
    const ret = await ReservationService.findAllForUser({userId: req.userId, startDate, interval})
    res.status(200).json({data: ret})
  } catch (e) {
    next(e)
  }
}

export {getReservations}
