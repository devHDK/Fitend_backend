import moment from 'moment-timezone'
import {v4 as uuid} from 'uuid'
import {PoolConnection} from 'mysql'
import {db} from '../loaders'
import {IWorkoutPlan, IWorkoutPlanFind} from '../interfaces/workoutPlans'
import {WorkoutSchedule} from './index'

moment.tz.setDefault('Asia/Seoul')

const tableName = 'WorkoutPlans'

async function findOne(options: IWorkoutPlanFind): Promise<[IWorkoutPlan]> {
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

async function findAllWorkoutScheduleInDate(options: IWorkoutPlanFind): Promise<[IWorkoutPlan]> {
  try {
    const startDate = moment(options.startDate).format('YYYY-MM-DD')
    const perPage = options.perPage
    const rows = await db.query({
      sql: `SELECT t.*
            FROM ?? t
            JOIN ?? ws ON ws.id = t.workoutScheduleId
            WHERE ws.date BETWEEN DATE(${startDate}) AND DATE_ADD(${startDate},INTERVAL ${perPage} DAY)`,
      values: [tableName, WorkoutSchedule.tableName]
    })
    return rows
  } catch (e) {
    throw e
  }
}

export {tableName, findOne, findAllWorkoutScheduleInDate}
