import {Response} from 'express'
import {TicketService} from '../../../../services'

async function getTickets(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const userId = req.userId
    const ret = await TicketService.findAll({
      franchiseId: 1,
      status: 'active',
      userId,
      start: 0,
      perPage: 10
    })
    res.status(200).json(ret)
  } catch (e) {
    next(e)
  }
}

export {getTickets}
