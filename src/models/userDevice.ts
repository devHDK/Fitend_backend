import moment from 'moment-timezone'
import {PoolConnection} from 'mysql'
import {db} from '../loaders'
import {IUserDeviceUpdate, IUserDevice} from '../interfaces/userDevice'

moment.tz.setDefault('Asia/Seoul')

const tableName = 'UsersDevices'

async function createOne(
  options: {
    userId: number
    type: 'student' | 'presenter'
    token: string
    platform: string
  },
  connection?: PoolConnection
): Promise<void> {
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

async function findOne(userId: number, type: 'student' | 'presenter'): Promise<IUserDevice> {
  try {
    const [row] = await db.query({
      sql: `SELECT t.*
            FROM ?? t
            WHERE ? AND ?`,
      values: [tableName, {userId}, {type}]
    })
    return row
  } catch (e) {
    throw e
  }
}

async function updateOne(options: IUserDeviceUpdate, connection?: PoolConnection): Promise<void> {
  const {userId, type, ...data} = options
  try {
    await db.query({
      connection,
      sql: `UPDATE ?? SET ? WHERE ? AND ?`,
      values: [tableName, data, {userId}, {type}]
    })
  } catch (e) {
    throw e
  }
}

export {tableName, createOne, findOne, updateOne}
