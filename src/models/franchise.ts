import moment from 'moment-timezone'
import {db} from '../loaders'
import {IFranchise} from '../interfaces/franchise'

moment.tz.setDefault('Asia/Seoul')

const tableName = 'Franchises'
const tableFranchiseUser = 'Franchises-Users'

async function findOneWithUserId(id: number): Promise<IFranchise> {
  try {
    const [row] = await db.query({
      sql: `SELECT f.id as franchiseId, f.name as name From ?? f
            JOIN ?? fu ON fu.userId = ${id} AND fu.franchiseId = f.id`,
      values: [tableName, tableFranchiseUser]
    })
    return row
  } catch (e) {
    throw e
  }
}

export {tableName, findOneWithUserId}
