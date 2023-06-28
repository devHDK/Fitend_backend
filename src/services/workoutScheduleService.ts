import moment from 'moment-timezone'
import {WorkoutSchedule, WorkoutFeedbacks, WorkoutPlan} from '../models'
import {
  IWorkoutScheduleList,
  IWorkoutScheduleFindAll,
  IWorkoutScheduleDetail,
  IWorkoutScheduleCreate,
  IWorkoutScheduleUpdate,
  IWorkoutScheduleListForTrainer
} from '../interfaces/workoutSchedules'
import {IWorkoutFeedbackCreate} from '../interfaces/workoutFeedbacks'
import {db} from '../loaders'

moment.tz.setDefault('Asia/Seoul')

interface IWorkoutFeedbackData extends IWorkoutFeedbackCreate {
  userId: number
  issueIndexes: number[]
}

interface IWorkoutScheduleCreateData extends IWorkoutScheduleCreate {
  workoutPlans: [
    {
      exerciseId: number
      setInfo: [{index: number; reps: number; weight: number; seconds: number}]
    }
  ]
}

interface IWorkoutScheduleUpdateData extends IWorkoutScheduleUpdate {
  workoutPlans?: [
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
  const connection = await db.beginTransaction()
  try {
    const {userId, issueIndexes, ...data} = options
    const workoutSchedule = await WorkoutSchedule.findOneWithId(data.workoutScheduleId)
    if (!workoutSchedule || workoutSchedule.userId !== userId) throw new Error('not_allowed')
    const workoutFeedback = await WorkoutFeedbacks.findOneWithWorkoutScheduleId(data.workoutScheduleId)
    if (workoutFeedback) throw new Error('duplicate_feedback')
    const workoutFeedbackId = await WorkoutFeedbacks.create(data)
    if (issueIndexes && issueIndexes.length > 0) {
      await WorkoutFeedbacks.createRelationIssues({workoutFeedbackId, issueIndexes}, connection)
    }
    await db.commit(connection)
  } catch (e) {
    if (connection) await db.rollback(connection)
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

async function findAllForTrainer(options: IWorkoutScheduleFindAll): Promise<[IWorkoutScheduleListForTrainer]> {
  try {
    return await WorkoutSchedule.findAllForTrainer(options)
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

async function findOneForTrainer(workoutScheduleId: number): Promise<[IWorkoutScheduleDetail]> {
  try {
    return await WorkoutSchedule.findOneForTrainer(workoutScheduleId)
  } catch (e) {
    throw e
  }
}

async function update(options: IWorkoutScheduleUpdateData): Promise<void> {
  const connection = await db.beginTransaction()
  try {
    const {workoutPlans, ...data} = options

    await WorkoutSchedule.update(data, connection)

    if (workoutPlans && workoutPlans.length > 0) {
      await WorkoutPlan.deleteAllWithWorkoutScheduleId(data.id, connection)
      for (let i = 0; i < workoutPlans.length; i++) {
        const {exerciseId, setInfo} = workoutPlans[i]
        await WorkoutPlan.create({exerciseId, workoutScheduleId: data.id, setInfo: JSON.stringify(setInfo)}, connection)
      }
    }

    await db.commit(connection)
  } catch (e) {
    if (connection) await db.rollback(connection)
    throw e
  }
}

async function updateStartDate(options: {id: number; startDate: string; seq: number}): Promise<void> {
  try {
    const workoutSchedule = await WorkoutSchedule.findOneWithId(options.id)
    const today = moment().startOf('day').unix()
    const workoutStartDate = moment(workoutSchedule.startDate).unix()
    if (workoutStartDate < today) throw new Error('not_allowed')
    await WorkoutSchedule.update(options)
  } catch (e) {
    throw e
  }
}

async function deleteOne(id: number): Promise<void> {
  try {
    await WorkoutSchedule.deleteOne(id)
  } catch (e) {
    throw e
  }
}

export {
  create,
  createFeedbacks,
  findAll,
  findAllForTrainer,
  findOne,
  findOneForTrainer,
  update,
  updateStartDate,
  deleteOne
}
