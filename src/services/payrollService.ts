import moment from 'moment-timezone'
import {print} from 'redis'
import {Response} from 'express'
import {Ticket, Reservation, Trainer} from '../models/index'
import {IMonth, IPayrollFindAll, IPayrollResponse} from '../interfaces/payroll'
import {findBetweenReservationWithTrainerId} from '../models/reservation'

async function findAllWithMonth(req: IPayrollFindAll): Promise<IPayrollResponse> {
  try {
    const {trainerId, franchiseId, startDate} = req
    const endDate = moment(startDate).utc().add(1, 'month').format('YYYY-MM-DD')
    const lastMonthStartDate = moment(startDate).utc().subtract(1, 'month').format('YYYY-MM-DD')
    const lastMonthEndDate = moment(lastMonthStartDate).utc().add(1, 'month').format('YYYY-MM-DD')
    //baseWage 및 percentage
    const wageInfo = await Trainer.findTrainerWageInfo({trainerId, franchiseId})
    //tickets
    const reservations = await Reservation.findBetweenReservationWithTrainerId({
      startTime: moment(startDate).utc().format('YYYY-MM-DD'),
      endTime: endDate,
      trainerId,
      franchiseId
    })
    const coaching = await Ticket.findBetweenfcTicket({
      startTime: moment(startDate).utc().format('YYYY-MM-DD'),
      endTime: endDate,
      trainerId,
      franchiseId
    })

    const lastMonthReservations = await Reservation.findBetweenReservationWithTrainerId({
      startTime: lastMonthStartDate,
      endTime: lastMonthEndDate,
      trainerId,
      franchiseId
    })
    const lastMonthCoaching = await Ticket.findBetweenfcTicket({
      startTime: lastMonthStartDate,
      endTime: lastMonthEndDate,
      trainerId,
      franchiseId
    })

    const ret = {
      thisMonth: <IMonth>{
        wageInfo,
        reservations,
        coaching
      },
      lastMonth: <IMonth>{
        wageInfo,
        reservations: lastMonthReservations,
        coaching: lastMonthCoaching
      }
    }

    return ret
  } catch (e) {
    throw e
  }
}

export {findAllWithMonth}
