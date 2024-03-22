import moment, {Moment} from 'moment-timezone'
import {Response} from 'express'
import {Ticket, Reservation, Trainer, TicketHolding, User, Payroll} from '../models/index'
import {
  ICalculatedPayroll,
  IHolding,
  IMonth,
  IPayrollCreateSave,
  IPayrollFindAll,
  IPayrollFindAllForAdmin,
  IPayrollResponse,
  IPayrollResponseForAdmin,
  IPayrollUpdateSave,
  IReservation
} from '../interfaces/payroll'
import {findBetweenReservationWithTrainerId} from '../models/reservation'

async function createPayrollSave(options: IPayrollCreateSave): Promise<void> {
  try {
    const {sessions, coaching, trainerId, month, ...data} = options

    const monthDuplicate = await Payroll.findSavedPayroll({trainerId, lastDate: month})
    if (monthDuplicate) throw new Error('payroll_duplicate')
    await Payroll.createPayrollSave({
      sessions: JSON.stringify(sessions),
      coaching: JSON.stringify(coaching),
      trainerId,
      month,
      ...data
    })
  } catch (e) {
    throw e
  }
}

async function findAllWithMonth(req: IPayrollFindAll): Promise<IPayrollResponse> {
  try {
    const {trainerId, franchiseId, startDate} = req
    const endDate = moment(startDate).endOf('month').subtract(9, 'hours').format('YYYY-MM-DDTHH:mm:ss')

    const preUser = await User.findThisMonthPreUserCount({trainerId, franchiseId, startDate, endDate})
    const paidUser = await User.findThisMonthPaidUserCount({trainerId, franchiseId, startDate})
    const leaveUser = await User.findThisMonthLeaveUserCount({trainerId, franchiseId, startDate})
    //baseWage 및 percentage
    const wageInfo = await Trainer.findTrainerWageInfo({trainerId, franchiseId})
    //tickets
    const reservations = await Reservation.findBetweenReservationWithTrainerId({
      startTime: moment(startDate).startOf('month').utc().format('YYYY-MM-DDTHH:mm:ss'),
      endTime: endDate,
      trainerId,
      franchiseId
    })

    const coaching = await Ticket.findBetweenFCTicket({
      startDate,
      trainerId,
      franchiseId
    })

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

async function findCalculatedPayroll(req: IPayrollFindAll): Promise<ICalculatedPayroll> {
  try {
    const {trainerId, franchiseId, startDate} = req
    const endDate = moment(startDate).endOf('month').subtract(9, 'hours').format('YYYY-MM-DDTHH:mm:ss')

    const preUser = await User.findThisMonthPreUserCount({trainerId, franchiseId, startDate, endDate})
    const paidUser = await User.findThisMonthPaidUserCount({trainerId, franchiseId, startDate})
    const leaveUser = await User.findThisMonthLeaveUserCount({trainerId, franchiseId, startDate})

    const savedPayroll = await Payroll.findSavedPayroll({trainerId, lastDate: startDate})

    if (!savedPayroll) {
      //baseWage 및 percentage
      const trainerWageInfo = await Trainer.findTrainerWageInfo({trainerId, franchiseId})
      //sessionPay
      const reservations = await Reservation.findBetweenReservationWithTrainerId({
        startTime: moment(startDate).startOf('month').utc().format('YYYY-MM-DDTHH:mm:ss'),
        endTime: endDate,
        trainerId,
        franchiseId
      })
      reservations.forEach(
        (el) => (el.payroll = calculateSessionPay(el.sessionPrice, trainerWageInfo.ptPercentage, el.thisMonthCount))
      )
      const totalReservationPayroll = reservations.reduce((acc, cur) => acc + cur.payroll, 0)

      //coachingPay
      const coaching = await Ticket.findBetweenFCTicket({
        startDate,
        trainerId,
        franchiseId
      })
      coaching.data.forEach((el) => {
        const totalDays = moment(el.expiredAt).diff(moment(el.startedAt), 'days') + 1
        el.usedDate = calculateUseDate(startDate, el.startedAt, el.expiredAt, el.holdingList)
        el.payroll =
          Math.floor(
            (calculateDailyPay(el.type, el.coachingPrice, trainerWageInfo.fcPercentage, totalDays, el.holdingList) *
              el.usedDate) /
              10
          ) * 10
      })

      //totalPay
      const totalCoachingPayroll = coaching.data.reduce((acc, cur) => acc + cur.payroll, 0)
      const monthEndCoachingPayroll = coaching.data.reduce((acc, cur) => {
        const lastDate = moment(startDate).endOf('month')
        const totalDays = moment(cur.expiredAt).diff(moment(cur.startedAt), 'days') + 1
        const monthUsedDate = calculateUseDate(lastDate, cur.startedAt, cur.expiredAt, cur.holdingList)
        return (
          acc +
          Math.floor(
            (calculateDailyPay(cur.type, cur.coachingPrice, trainerWageInfo.fcPercentage, totalDays, cur.holdingList) *
              monthUsedDate) /
              10
          ) *
            10
        )
      }, 0)

      const ret = {
        userCount: {
          preUser,
          paidUser,
          leaveUser
        },
        wageInfo: {
          fcPercentage: trainerWageInfo.fcPercentage,
          ptPercentage: trainerWageInfo.ptPercentage,
          baseWage: trainerWageInfo.baseWage,
          wage: totalReservationPayroll + totalCoachingPayroll,
          monthEndWage: totalReservationPayroll + monthEndCoachingPayroll
        },
        reservations,
        coaching,
        isSaved: false
      }
      return ret
    }
    const totalSessionPay = savedPayroll.sessions.reduce((acc, cur) => acc + cur.payroll, 0)
    const totalCoachingPay = savedPayroll.coaching.data.reduce((acc, cur) => acc + cur.payroll, 0)
    const ret = {
      userCount: {
        preUser,
        paidUser,
        leaveUser
      },
      wageInfo: {
        fcPercentage: savedPayroll.fcPercentage,
        ptPercentage: savedPayroll.ptPercentage,
        baseWage: savedPayroll.baseWage,
        wage: totalSessionPay + totalCoachingPay,
        monthEndWage: totalSessionPay + totalCoachingPay
      },
      reservations: savedPayroll.sessions,
      coaching: savedPayroll.coaching,
      isSaved: true
    }
    return ret
  } catch (e) {
    throw e
  }
}

async function findAllWithMonthForAdmin(options: IPayrollFindAllForAdmin): Promise<IPayrollResponseForAdmin> {
  try {
    const {startDate} = options
    const endDate = moment(startDate).endOf('month').subtract(9, 'hours').format('YYYY-MM-DDTHH:mm:ss')

    const preUser = await User.findThisMonthPreUserCount({startDate, endDate})
    const paidUser = await User.findThisMonthPaidUserCount({startDate})
    const leaveUser = await User.findThisMonthLeaveUserCount({startDate})
    const activeUser = await User.findActiveUserCountForAdmin({startDate})

    const coachList = await Trainer.findThisMonthSales({startDate})
    const totalSales = coachList.reduce((acc, cur) => acc + cur.sales, 0)

    const ret = {
      userCount: {
        preUser,
        paidUser,
        leaveUser,
        activeUser
      },
      totalSales,
      coachList
    }
    return ret
  } catch (e) {
    throw e
  }
}

async function updateSavedPayroll(options: IPayrollUpdateSave): Promise<void> {
  try {
    const {trainerId, month, baseWage, fcPercentage, ptPercentage} = options
    const savedPayroll = await Payroll.findSavedPayroll({trainerId, lastDate: month})
    if (!savedPayroll) throw new Error('not_found')

    savedPayroll.sessions.forEach(
      (el) => (el.payroll = calculateSessionPay(el.sessionPrice, ptPercentage, el.thisMonthCount))
    )

    savedPayroll.coaching.data.forEach((el) => {
      const totalDays = moment(el.expiredAt).diff(moment(el.startedAt), 'days') + 1
      el.usedDate = calculateUseDate(month, el.startedAt, el.expiredAt, el.holdingList)
      el.payroll =
        Math.floor(
          (calculateDailyPay(el.type, el.coachingPrice, fcPercentage, totalDays, el.holdingList) * el.usedDate) / 10
        ) * 10
    })

    const data = {
      trainerId,
      month,
      baseWage,
      ptPercentage,
      fcPercentage,
      sessions: JSON.stringify(savedPayroll.sessions),
      coaching: JSON.stringify(savedPayroll.coaching)
    }

    await Payroll.updateSavedPayroll(data)
  } catch (e) {
    throw e
  }
}

// 세션 페이롤
function calculateSessionPay(sessionPrice: number, ptPercentage: number, thisMonthCount: number) {
  if ((sessionPrice * ptPercentage) / 100 >= 18000) {
    return ((sessionPrice * ptPercentage) / 100) * thisMonthCount
  }
  return 18000 * thisMonthCount
}

// 이번달 사용일 계산
function calculateUseDate(today: Date | Moment, startedAt: string, expiredAt: string, holdingList: IHolding[]) {
  const currentDate = moment(today).startOf('day')
  const monthStart = moment(today).startOf('month')
  const monthEnd = moment(today).endOf('month')
  const startAt = moment(startedAt).startOf('day')
  const endAt = moment(expiredAt).startOf('day')

  const getStartDate = (start: Moment, monthStart: Moment) => (start.isAfter(monthStart) ? start : monthStart)
  const getEndDate = (end: Moment, currentDate: Moment, monthEnd: Moment) =>
    end.isBefore(currentDate) ? end : currentDate.isBefore(monthEnd) ? currentDate : monthEnd

  if (holdingList) {
    const useStart = getStartDate(startAt, monthStart)
    const useEnd = getEndDate(endAt, currentDate, monthEnd)

    const filteredHoldList = holdingList.filter(
      (el) => moment(el.startAt).isSameOrBefore(useEnd) && moment(el.endAt).isSameOrAfter(useStart)
    )

    let useDays = useEnd.diff(useStart, 'days') + 1

    filteredHoldList.forEach((hold) => {
      const holdStartDate = moment(hold.startAt)
      const holdEndDate = moment(hold.endAt)

      if (holdStartDate.isSameOrBefore(useEnd) && holdEndDate.isSameOrAfter(useStart)) {
        const effectiveHoldStart = getStartDate(holdStartDate, useStart)
        const effectiveHoldEnd = getEndDate(holdEndDate, currentDate, useEnd)
        const holdDays = effectiveHoldEnd.diff(effectiveHoldStart, 'days') + 1
        useDays -= holdDays
      }
    })

    return useDays
  }
  const useStart = getStartDate(startAt, monthStart)
  const useEnd = getEndDate(endAt, currentDate, monthEnd)

  return useEnd.diff(useStart, 'days') + 1
}

// 일단가 계산
function calculateDailyPay(
  type: number,
  coachingPrice: number,
  fcPercentage: number,
  totalDays: number,
  holdingList: IHolding[]
) {
  const holdDays = holdingList ? holdingList.reduce((prev, acc) => prev + acc.days, 0) : 0
  let payroll = 0
  if (type === 1) {
    payroll = ((coachingPrice / (totalDays - holdDays)) * fcPercentage) / 100
  }
  if (type === 3) {
    payroll = (((coachingPrice * 3) / (totalDays - holdDays)) * fcPercentage) / 100
  }
  if (type === 6) {
    payroll = (((coachingPrice * 6) / (totalDays - holdDays)) * fcPercentage) / 100
  }
  return payroll
}

export {createPayrollSave, findAllWithMonth, findCalculatedPayroll, findAllWithMonthForAdmin, updateSavedPayroll}
