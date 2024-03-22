import {Response} from 'express'
import {PayrollService} from '../../../../services'

async function getPayrollWithMonth(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {startDate} = req.options
    const ret = await PayrollService.findAllWithMonthForAdmin({startDate})
    res.status(200).json(ret)
  } catch (e) {
    next(e)
  }
}

async function getPayrollWithTrainerId(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {startDate, trainerId} = req.options
    const ret = await PayrollService.findCalculatedPayroll({
      trainerId,
      franchiseId: 1,
      startDate
    })
    res.status(200).json(ret)
  } catch (e) {
    next(e)
  }
}

export {getPayrollWithMonth, getPayrollWithTrainerId}
