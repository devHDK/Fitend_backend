import {WorkoutPlan} from '../models'
import {IWorkoutPlan, IWorkoutPlanFind} from '../interfaces/workoutPlans'

async function findAllWorkoutScheduleInDate(options: IWorkoutPlanFind): Promise<[IWorkoutPlan]> {
  try {
    const ret = await WorkoutPlan.findAllWorkoutsInDate(options)
    console.log(ret)
    return ret
  } catch (e) {
    throw e
  }
}

export {findAllWorkoutScheduleInDate}
