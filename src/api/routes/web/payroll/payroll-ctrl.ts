import {Response} from 'express'
import {PayrollService} from '../../../../services'
import {IPayrollFindAll} from '../../../../interfaces/payroll'

async function getPayrollWithMonth(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {startDate} = req.options
    const ret = await PayrollService.findAllWithMonth({trainerId: req.userId, franchiseId: req.franchiseId, startDate})
    res.status(200).json({data: ret})
  } catch (e) {
    next(e)
  }
}

export {getPayrollWithMonth}
