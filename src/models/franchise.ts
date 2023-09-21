import moment from 'moment-timezone'
import {db} from '../loaders'
import {IFranchise, IFranchiseWithWageInfo} from '../interfaces/franchise'

moment.tz.setDefault('Asia/Seoul')

const tableName = 'Franchises'
const tableFranchiseUser = 'Franchises-Users'
const tableFranchiseTrainer = 'Franchises-Trainers'

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

async function findOneWithTrainerId(id: number): Promise<IFranchiseWithWageInfo> {
  try {
    const [row] = await db.query({
      sql: `SELECT f.id as franchiseId, f.name, ft.baseWage, ft.fcPercentage, ft.ptPercentage From ?? f
            JOIN ?? ft ON ft.trainerId = ${id} AND ft.franchiseId = f.id`,
      values: [tableName, tableFranchiseTrainer]
    })
    return row
  } catch (e) {
    throw e
  }
}

async function findAllForAdmin(): Promise<[IFranchise]> {
  try {
    return await db.query({
      sql: `SELECT f.id as franchisesId, f.name From ?? f`,
      values: [tableName]
    })
  } catch (e) {
    throw e
  }
}

export {tableName, findOneWithUserId, findOneWithTrainerId, findAllForAdmin}
