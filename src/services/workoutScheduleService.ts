import {WorkoutSchedule} from '../models'
import {IWorkoutScheduleList, IWorkoutScheduleFindAll, IWorkoutScheduleDetail} from '../interfaces/workoutSchedules'

async function findAll(options: IWorkoutScheduleFindAll): Promise<[IWorkoutScheduleList]> {
  try {
    return await WorkoutSchedule.findAll(options)
  } catch (e) {
    throw e
  }
}

async function findOne(workoutScheduleId: number): Promise<[IWorkoutScheduleDetail]> {
  try {
    return await WorkoutSchedule.findOne(workoutScheduleId)
  } catch (e) {
    throw e
  }
}

export {findAll, findOne}
