import {PoolConnection} from 'mysql'
import {IWorkoutRecord, IWorkoutRecordCreate, IWorkoutRecordDetail} from '../interfaces/workoutRecords'
import {db} from '../loaders'
import {Exercise, WorkoutPlan} from './index'

const tableName = 'WorkoutRecords'

async function create(options: IWorkoutRecordCreate, connection?: PoolConnection): Promise<void> {
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

async function findOneWithWorkoutPlanId(workoutPlanId: number): Promise<IWorkoutRecord> {
  try {
    const [row] = await db.query({
      sql: `SELECT * FROM ?? WHERE workoutPlanId = ?`,
      values: [tableName, workoutPlanId]
    })
    return row
  } catch (e) {
    throw e
  }
}

async function findAllWithWorkoutPlanId(workoutPlanId: number): Promise<IWorkoutRecordDetail> {
  try {
    return await db.query({
      sql: `SELECT e.name as exerciseName, JSON_ARRAYAGG(tm.name) as targetMuscles,
            t.setInfo 
            FROM ?? t
            JOIN ?? wp ON wp.id = t.workoutPlanId
            JOIN ?? e ON e.id = wp.exerciseId 
            JOIN ?? etm ON etm.exerciseId = e.id
            JOIN ?? tm ON tm.id = etm.targetMuscleId 
            WHERE t.workoutPlanId = ?
            GROUP BY t.id`,
      values: [
        tableName,
        WorkoutPlan.tableName,
        Exercise.tableName,
        Exercise.tableExerciseTargetMuscle,
        Exercise.tableTargetMuscle,
        workoutPlanId
      ]
    })
  } catch (e) {
    throw e
  }
}

export {tableName, create, findOneWithWorkoutPlanId, findAllWithWorkoutPlanId}
