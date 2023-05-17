import moment from 'moment-timezone'
import {db} from '../loaders'
import {ITrainer, ITrainerFindOne} from '../interfaces/trainer'

moment.tz.setDefault('Asia/Seoul')

const tableName = 'Trainers'

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

export {
  tableName,
  findOne
}
