import {Response} from 'express'
import {Payment} from '../../../../models'
import {PaymentService} from '../../../../services'

async function getPayment(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {search, trainerId, start, perPage} = req.options
    const ret = await PaymentService.findAll({search, trainerId, start, perPage})
    res.status(200).json(ret)
  } catch (e) {
    next(e)
  }
}

export {getPayment}
