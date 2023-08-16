import moment from 'moment-timezone'
import {Ticket, Reservation, Trainer} from '../models/index'
import {IPayrollFindAll} from '../interfaces/payroll'

async function findAllWithMonth(req: IPayrollFindAll) {
  try {
    const {trainerId, franchiseId, startDate} = req
    const endDate = moment(startDate).utc().add(1, 'month').format('YYYY-MM-DD')
    const lastMonthStartDate = moment(startDate).utc().subtract(1, 'month').format('YYYY-MM-DD')
    const lastMonthEndDate = moment(lastMonthStartDate).utc().add(1, 'month').format('YYYY-MM-DD')
    //baseWage 및 percentage
    //tickets
    //coaching
    //lastMonth baseWage 및 percentage
    //lastMonth tickets
    //lastMonth coaching
  } catch (e) {
    throw e
  }
}

export {findAllWithMonth}
