import moment from 'moment-timezone'
import {db} from '../loaders'
import {
  ITrainer,
  ITrainerFindOne,
  ITrainerFindOneWageInfo,
  ITrainerList,
  ITrainerUpdate,
  ITrainerWageInfo
} from '../interfaces/trainer'
import {IWageInfo} from '../interfaces/payroll'

moment.tz.setDefault('Asia/Seoul')

const tableName = 'Trainers'
const tableFranchiseTrainer = 'Franchises-Trainers'

async function findAll(franchiseId: number): Promise<[ITrainerList]> {
  try {
    return await db.query({
      sql: `SELECT t.id, t.nickname, t.profileImage
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

async function findDeviceList(): Promise<[{deviceId: string}]> {
  try {
    const row = await db.query({
      sql: `SELECT deviceId
            FROM ?? `,
      values: [tableName]
    })
    return row
  } catch (e) {
    throw e
  }
}

async function findTrainerWageInfo(options: ITrainerFindOneWageInfo): Promise<IWageInfo> {
  try {
    const {trainerId, franchiseId} = options
    const [row] = await db.query({
      sql: `SELECT t.baseWage, t.ptPercentage, t.fcPercentage
            FROM ?? t
            WHERE ? AND ?`,
      values: [tableFranchiseTrainer, {trainerId}, {franchiseId}]
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

export {tableName, tableFranchiseTrainer, findOne, findTrainerWageInfo, findAll, findDeviceList, updateOne}
