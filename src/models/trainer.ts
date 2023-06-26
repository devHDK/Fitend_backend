import moment from 'moment-timezone'
import {db} from '../loaders'
import {ITrainer, ITrainerFindOne, ITrainerList, ITrainerUpdate} from '../interfaces/trainer'

moment.tz.setDefault('Asia/Seoul')

const tableName = 'Trainers'
const tableFranchiseTrainer = 'Franchises-Trainers'

async function findAll(franchiseId: number): Promise<[ITrainerList]> {
  try {
    return await db.query({
      sql: `SELECT t.id, t.nickname
            FROM ?? t
            JOIN ?? ft ON ft.trainerId = t.id AND ft.franchiseId = ?`,
      values: [tableName, tableFranchiseTrainer, franchiseId]
    })
  } catch (e) {
    throw e
  }
}

async function findOne(options: ITrainerFindOne): Promise<ITrainer> {
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

async function updateOne(options: ITrainerUpdate): Promise<void> {
  const {id, ...data} = options
  try {
    await db.query({
      sql: `UPDATE ?? SET ? WHERE ? `,
      values: [tableName, data, {id}]
    })
  } catch (e) {
    throw e
  }
}

export {tableName, tableFranchiseTrainer, findOne, findAll, updateOne}
