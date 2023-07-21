import moment from 'moment-timezone'
import {User, WorkoutRecords} from '../models/index'

moment.tz.setDefault('Asia/Seoul')

async function findAllWorkoutToday(
  franchiseId: number,
  today: string
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
    return await WorkoutRecords.findAllToday(franchiseId, today)
  } catch (e) {
    throw e
  }
}

async function findAllWorkoutYesterday(
  franchiseId: number,
  today: string
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
    return await WorkoutRecords.findAllYesterday(franchiseId, today)
  } catch (e) {
    throw e
  }
}

async function findActiveUsers(
  franchiseId: number
): Promise<{
  personalActiveUsers: {thisMonthCount: number; lastMonthCount: number}
  fitnessActiveUsers: {thisMonthCount: number; lastMonthCount: number}
}> {
  try {
    const thisMonthStart = moment().startOf('month').format('YYYY-MM-DD')
    const thisMonthEnd = moment().add(1, 'day').format('YYYY-MM-DD')
    const lastMonthStart = moment().subtract(1, 'month').startOf('month').format('YYYY-MM-DD')
    const lastMonthEnd = moment().subtract(1, 'month').endOf('month').add(1, 'day').format('YYYY-MM-DD')
    const thisMonthCount = await User.findActivePersonalUsers(franchiseId, thisMonthStart, thisMonthEnd)
    const lastMonthCount = await User.findActivePersonalUsers(franchiseId, lastMonthStart, lastMonthEnd)
    const fcThisMonthCount = await User.findActiveFitnessUsers(franchiseId, thisMonthStart, thisMonthEnd)
    const fcLastMonthCount = await User.findActiveFitnessUsers(franchiseId, lastMonthStart, lastMonthEnd)
    return {
      personalActiveUsers: {thisMonthCount, lastMonthCount},
      fitnessActiveUsers: {thisMonthCount: fcThisMonthCount, lastMonthCount: fcLastMonthCount}
    }
  } catch (e) {
    throw e
  }
}

async function findAllWorkoutUsers(
  franchiseId: number,
  today: string
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
    return await WorkoutRecords.findAllUsers(franchiseId, today)
  } catch (e) {
    throw e
  }
}

export {findAllWorkoutToday, findAllWorkoutYesterday, findActiveUsers, findAllWorkoutUsers}
