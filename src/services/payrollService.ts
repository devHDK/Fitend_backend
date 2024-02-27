import moment from 'moment-timezone'
import {print} from 'redis'
import {Response} from 'express'
import {Ticket, Reservation, Trainer, TicketHolding, User} from '../models/index'
import {IMonth, IPayrollFindAll, IPayrollResponse} from '../interfaces/payroll'
import {findBetweenReservationWithTrainerId} from '../models/reservation'

async function findAllWithMonth(req: IPayrollFindAll): Promise<IPayrollResponse> {
  try {
    const {trainerId, franchiseId, startDate} = req
    const endDate = moment(startDate).endOf('month').subtract(9, 'hours').format('YYYY-MM-DDTHH:mm:ss')

    const preUser = await User.findThisMonthPreUserCount({trainerId, franchiseId, startDate})
    const paidUser = await User.findThisMonthPaidUserCount({trainerId, franchiseId, startDate})
    const leaveUser = await User.findThisMonthLeaveUserCount({trainerId, franchiseId, startDate})
    //baseWage 및 percentage
    const wageInfo = await Trainer.findTrainerWageInfo({trainerId, franchiseId})
    //tickets
    const reservations = await Reservation.findBetweenReservationWithTrainerId({
      startTime: moment(startDate).utc().format('YYYY-MM-DDTHH:mm:ss'),
      endTime: endDate,
      trainerId,
      franchiseId
    })

    let coaching = []
    for (let i = 0; i < 6; i++) {
      const tempRet = await Ticket.findBetweenFCTicket({
        startTime: moment(startDate).utc().format('YYYY-MM-DDTHH:mm:ss'),
        endTime: endDate,
        trainerId,
        franchiseId,
        plusMonth: i
      })

      coaching = [...coaching, ...tempRet]
    }

    const ret = {
      thisMonth: <IMonth>{
        userCount: {
          preUser,
          paidUser,
          leaveUser
        },
        wageInfo,
        reservations,
        coaching
      }
    }

    return ret
  } catch (e) {
    throw e
  }
}

export {findAllWithMonth}
