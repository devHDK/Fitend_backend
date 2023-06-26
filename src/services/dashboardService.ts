import {WorkoutRecords} from '../models/index'

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

export {findAllWorkoutToday, findAllWorkoutYesterday}
