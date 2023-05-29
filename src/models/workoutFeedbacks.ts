import {PoolConnection} from 'mysql'
import {IWorkoutFeedback, IWorkoutFeedbackCreate} from '../interfaces/workoutFeedbacks'
import {db} from '../loaders'

const tableName = 'WorkoutFeedbacks'

async function create(options: IWorkoutFeedbackCreate, connection?: PoolConnection): Promise<void> {
  try {
    await db.query({
      connection,
      sql: `INSERT INTO ?? SET ?`,
      values: [tableName, options]
    })
  } catch (e) {
    throw e
  }
}

async function findOneWithWorkoutScheduleId(workoutScheduleId: number): Promise<IWorkoutFeedback> {
  try {
    const [row] = await db.query({
      sql: `SELECT t.*
            FROM ?? t
            WHERE t.?`,
      values: [tableName, {workoutScheduleId}]
    })
    return row
  } catch (e) {
    throw e
  }
}

export {tableName, create, findOneWithWorkoutScheduleId}
