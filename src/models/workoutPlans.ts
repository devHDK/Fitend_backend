import moment from 'moment-timezone'
import {v4 as uuid} from 'uuid'
import {PoolConnection} from 'mysql'
import {db} from '../loaders'
import {IWorkoutPlan, IWorkoutPlanFind} from '../interfaces/workoutPlans'

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

async function findAllWorkoutsInDate(options: IWorkoutPlanFind): Promise<[IWorkoutPlan]> {
  try {
    const startDate = moment(options.date).format('YYYY-MM-DD')
    const rows = await db.query({
      sql: `SELECT t.*
            FROM ?? t
            WHERE DATE(??) <= t.date `,
      values: [tableName, startDate]
    })
    return rows
  } catch (e) {
    throw e
  }
}

export {tableName, findOne, findAllWorkoutsInDate}
