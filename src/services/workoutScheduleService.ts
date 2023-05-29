import {WorkoutSchedule, WorkoutFeedbacks} from '../models'
import {IWorkoutScheduleList, IWorkoutScheduleFindAll, IWorkoutScheduleDetail} from '../interfaces/workoutSchedules'
import {IWorkoutFeedbackCreate} from '../interfaces/workoutFeedbacks'

interface IWorkoutFeedbackData extends IWorkoutFeedbackCreate {
  userId: number
}

async function createFeedbacks(options: IWorkoutFeedbackData): Promise<void> {
  try {
    const {userId, ...data} = options
    const workoutSchedule = await WorkoutSchedule.findOneWithId(data.workoutScheduleId)
    if (!workoutSchedule || workoutSchedule.userId !== userId) throw new Error('not_allowed')
    const workoutFeedback = await WorkoutFeedbacks.findOneWithWorkoutScheduleId(data.workoutScheduleId)
    if (workoutFeedback) throw new Error('duplicate_feedback')
    await WorkoutFeedbacks.create(data)
  } catch (e) {
    throw e
  }
}

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

export {createFeedbacks, findAll, findOne}
