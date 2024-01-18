import {Response} from 'express'
import {Payment} from '../../../../models'

async function getPayment(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {search, start, perPage} = req.options
    const ret = await Payment.findAll({search, start, perPage})
    res.status(200).json(ret)
  } catch (e) {
    next(e)
  }
}

export {getPayment}
