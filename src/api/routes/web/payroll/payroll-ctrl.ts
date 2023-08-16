import {Response} from 'express'
import {PayrollService} from '../../../../services'

async function getPayrollWithMonth(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const ret = await PayrollService.findAllWithMonth(req.franchiseId)
    res.status(200).json({data: ret})
  } catch (e) {
    next(e)
  }
}

export {getPayrollWithMonth}
