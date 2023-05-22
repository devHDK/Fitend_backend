import {WorkoutSchedule} from '../models'
import {IWorkoutScheduleList, IWorkoutScheduleFindAll} from '../interfaces/workoutSchedules'

async function findAll(options: IWorkoutScheduleFindAll): Promise<[IWorkoutScheduleList]> {
  try {
    return await WorkoutSchedule.findAll(options)
  } catch (e) {
    throw e
  }
}

export {findAll}
