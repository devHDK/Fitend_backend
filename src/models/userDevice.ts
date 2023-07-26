import moment from 'moment-timezone'
import {PoolConnection} from 'mysql'
import {db} from '../loaders'
import {IUserDeviceUpdate, IUserDevice} from '../interfaces/userDevice'

moment.tz.setDefault('Asia/Seoul')

const tableName = 'UsersDevices'

async function createOne(
  options: {
    userId: number
    token: string
    platform: string
    badgeCount: number
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

async function upsertOne(
  options: {
    userId: number
    platform: 'ios' | 'android'
    deviceId: string
    token: string
  },
  connection: PoolConnection
): Promise<void> {
  try {
    const {userId, token} = options
    await db.query({
      connection,
      sql: `INSERT INTO ?? 
            SET ?
            ON DUPLICATE KEY UPDATE 
            token = ?`,
      values: [tableName, options, token]
    })
  } catch (e) {
    throw e
  }
}

async function findOne(userId: number, deviceId: string, platform: 'ios' | 'android'): Promise<IUserDevice> {
  try {
    const [row] = await db.query({
      sql: `SELECT t.*
            FROM ?? t
            WHERE ? AND ? AND ?`,
      values: [tableName, {userId}, {deviceId}, {platform}]
    })
    return row
  } catch (e) {
    throw e
  }
}

async function findAllWithUserId(userId: number, platform: 'ios' | 'android'): Promise<[IUserDevice]> {
  try {
    return await db.query({
      sql: `SELECT *
            FROM ?? 
            WHERE isNotification = true AND ? AND ?`,
      values: [tableName, {userId}, {platform}]
    })
  } catch (e) {
    throw e
  }
}

async function updateOne(options: IUserDeviceUpdate, connection?: PoolConnection): Promise<void> {
  const {userId, platform, ...data} = options
  try {
    await db.query({
      connection,
      sql: `UPDATE ?? SET ? WHERE ? AND ?`,
      values: [tableName, data, {userId}, {platform}]
    })
  } catch (e) {
    throw e
  }
}

export {tableName, createOne, upsertOne, findOne, findAllWithUserId, updateOne}
