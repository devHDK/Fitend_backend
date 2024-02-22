import moment from 'moment-timezone'
import {Reservation, Ticket, User, WorkoutRecords} from '../models/index'

moment.tz.setDefault('Asia/Seoul')

async function findActiveUsers(
  franchiseId: number,
  trainerId: number
): Promise<{
  preUserCount: number
  paidUserCount: number
  expiredSevenDaysCount: number
}> {
  try {
    const preUserCount = await User.findPreUserCount(franchiseId, trainerId)
    const paidUserCount = await User.findPaidUserCount(franchiseId, trainerId)
    const expiredSevenDaysCount = await User.findExpiredSevenDaysCount(franchiseId, trainerId)
    return {
      preUserCount,
      paidUserCount,
      expiredSevenDaysCount
    }
  } catch (e) {
    throw e
  }
}

async function findSessions(
  franchiseId: number,
  trainerId: number
): Promise<{
  burnRate: {total: number; used: number}
  thisMonth: {attendance: number; noShow: number}
}> {
  try {
    const thisMonthStart = moment().startOf('month').subtract(9, 'hour').format('YYYY-MM-DDTHH:mm:ss')
    const thisMonthEnd = moment().endOf('month').subtract(9, 'hour').format('YYYY-MM-DDTHH:mm:ss')
    const burnRate = await Reservation.findBurnRate(franchiseId, trainerId)
    const thisMonth = await Reservation.findAttendanceNoShowCount(franchiseId, thisMonthStart, thisMonthEnd, trainerId)
    return {burnRate, thisMonth}
  } catch (e) {
    throw e
  }
}

async function findAllWorkoutToday(
  franchiseId: number,
  today: string,
  trainerId: number
): Promise<
  [
    {
      userId: number
      userNickname: string
      trainerNickname: string
      createdAt: string
    }
  ]
> {
  try {
    return await WorkoutRecords.findAllToday(franchiseId, today, trainerId)
  } catch (e) {
    throw e
  }
}

async function findAllWorkoutYesterday(
  franchiseId: number,
  today: string,
  trainerId: number
): Promise<
  [
    {
      userId: number
      memberNickname: string
      trainerNickname: string
    }
  ]
> {
  try {
    return await WorkoutRecords.findAllYesterday(franchiseId, today, trainerId)
  } catch (e) {
    throw e
  }
}

async function findAllWorkoutUsers(
  franchiseId: number,
  today: string,
  trainerId: number
): Promise<
  [
    {
      userId: number
      userNickname: string
      monthCount: number
      doneCount: number
      recentDate: string
      trainers: string[]
    }
  ]
> {
  try {
    return await WorkoutRecords.findAllUsers(franchiseId, today, trainerId)
  } catch (e) {
    throw e
  }
}

async function findExpiredThreeSessions(
  franchiseId: number,
  trainerId: number
): Promise<
  [
    {
      userId: 0
      userNickname: 'string'
      trainerNickname: 'string'
      restSession: 0
    }
  ]
> {
  try {
    return await Ticket.findExpiredThreeSessions(franchiseId, trainerId)
  } catch (e) {
    throw e
  }
}

export {
  findActiveUsers,
  findSessions,
  findAllWorkoutToday,
  findAllWorkoutYesterday,
  findAllWorkoutUsers,
  findExpiredThreeSessions
}
