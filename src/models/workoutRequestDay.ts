import moment from 'moment-timezone'
import {PoolConnection, escape} from 'mysql'
import {db} from '../loaders'
import {IWorkoutRequestDayCreate, IWorkoutRequestDayDelete, IWorkoutRequestDayFindAll, IWorkoutRequestDayList} from '../interfaces/workoutRequestDay'

moment.tz.setDefault('Asia/Seoul')

const tableName = 'WorkoutsRequestDays'

async function create(options: IWorkoutRequestDayCreate, connection?: PoolConnection): Promise<number> {
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

async function findAll(options: IWorkoutRequestDayFindAll): Promise<[IWorkoutRequestDayList]> {
  const {userId, startDate, endDate} = options
  try {
    return await db.query({
      sql: `SELECT workoutDate FROM ?? 
            WHERE userId = ${escape(userId)} AND
            workoutDate BETWEEN 
            ${escape(startDate)} AND 
            ${endDate ? escape(endDate) : escape(moment(startDate).add(30, 'day').format('YYYY-MM-DD'))}`,
      values: [tableName]
    })
  } catch (e) {
    throw e
  }
}

async function deleteOne({userId, workoutDate}: IWorkoutRequestDayDelete): Promise<void> {
  try {
    await db.query({
      sql: `DELETE FROM ?? WHERE ? AND ?`,
      values: [tableName, {userId}, {workoutDate}]
    })
  } catch (e) {
    throw e
  }
}

export {tableName, create, findAll, deleteOne}
