import moment from 'moment-timezone'
import {PoolConnection, escape} from 'mysql'
import {db} from '../loaders'
import {IWorkoutPlan, IWorkoutPlanFind, IWorkoutPlanCreate} from '../interfaces/workoutPlans'
import {StandardExercise} from '.'

moment.tz.setDefault('Asia/Seoul')

const tableName = 'WorkoutPlans'

async function create(options: IWorkoutPlanCreate, connection?: PoolConnection): Promise<number> {
  try {
    const {insertId} = await db.query({
      connection,
      sql: `INSERT INTO ?? SET ?`,
      values: [tableName, options]
    })
    return insertId
  } catch (e) {
    throw e
  }
}

async function findOne(options: IWorkoutPlanFind): Promise<IWorkoutPlan> {
  try {
    const [row] = await db.query({
      sql: `SELECT t.*
            FROM ?? t
            WHERE ?`,
      values: [tableName, options]
    })
    return row
  } catch (e) {
    throw e
  }
}

async function findStandardExerciseId(options: IWorkoutPlanFind): Promise<number> {
  try {
    const [row] = await db.query({
      sql: `SELECT se.standardExerciseId as id
            FROM ?? t
            JOIN ?? se ON se.exerciseId = t.exerciseId
            WHERE t.?`,
      values: [tableName, StandardExercise.tableStandardExercisesExercises, options]
    })
    return row.id
  } catch (e) {
    throw e
  }
}

async function deleteAllWithWorkoutScheduleId(workoutScheduleId: number, connection?: PoolConnection): Promise<void> {
  try {
    await db.query({
      sql: `DELETE FROM ?? WHERE ?`,
      values: [tableName, {workoutScheduleId}]
    })
  } catch (e) {
    throw e
  }
}

export {tableName, create, findOne, findStandardExerciseId, deleteAllWithWorkoutScheduleId}
