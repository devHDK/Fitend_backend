import {Response} from 'express'
import {TicketService} from '../../../../services'

async function getTickets(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const userId = req.userId
    const ret = await TicketService.findAllForUser({
      userId
    })
    res.status(200).json(ret)
  } catch (e) {
    next(e)
  }
}

export {getTickets}
