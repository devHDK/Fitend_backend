import {Response} from 'express'
import {PayrollService} from '../../../../services'

async function postPayroll(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {trainerId, month, baseWage, ptPercentage, fcPercentage, sessions, coaching} = req.options
    await PayrollService.createPayrollSave({trainerId, month, baseWage, ptPercentage, fcPercentage, sessions, coaching})
    res.status(200).json()
  } catch (e) {
    if (e.message === 'payroll_duplicate') e.status = 409
    next(e)
  }
}

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

async function putPayrollWithTrainerId(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {month, baseWage, ptPercentage, fcPercentage} = req.options
    await PayrollService.updateSavedPayroll({trainerId: req.options.id, month, baseWage, ptPercentage, fcPercentage})
    res.status(200).json()
  } catch (e) {
    if (e.message === 'not_found') e.status = 404
    next(e)
  }
}

export {postPayroll, getPayrollWithMonth, getPayrollWithTrainerId, putPayrollWithTrainerId}
