import {WorkoutSchedule, WorkoutFeedbacks, WorkoutPlan} from '../models'
import {
  IWorkoutScheduleList,
  IWorkoutScheduleFindAll,
  IWorkoutScheduleDetail,
  IWorkoutScheduleCreate
} from '../interfaces/workoutSchedules'
import {IWorkoutFeedbackCreate} from '../interfaces/workoutFeedbacks'
import {db} from '../loaders'

interface IWorkoutFeedbackData extends IWorkoutFeedbackCreate {
  userId: number
}

interface IWorkoutScheduleCreateData extends IWorkoutScheduleCreate {
  workoutPlans: [
    {
      exerciseId: number
      setInfo: [{index: number; reps: number; weight: number; seconds: number}]
    }
  ]
}

async function create(options: IWorkoutScheduleCreateData): Promise<void> {
  const connection = await db.beginTransaction()
  try {
    const {workoutPlans, ...data} = options
    const workoutScheduleId = await WorkoutSchedule.create(data, connection)
    for (let i = 0; i < workoutPlans.length; i++) {
      const {exerciseId, setInfo} = workoutPlans[i]
      await WorkoutPlan.create({exerciseId, workoutScheduleId, setInfo: JSON.stringify(setInfo)}, connection)
    }
    await db.commit(connection)
  } catch (e) {
    if (connection) await db.rollback(connection)
    throw e
  }
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

export {create, createFeedbacks, findAll, findOne}
