import moment from 'moment-timezone'
import {PoolConnection, escape} from 'mysql'
import {db} from '../loaders'
import {ITrainerDevice, ITrainerDeviceUpdate} from '../interfaces/trainerDevice'

moment.tz.setDefault('Asia/Seoul')

const tableName = 'TrainersDevices'

async function createOne(
  options: {
    trainerId: number
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
    trainerId: number
    platform: 'ios' | 'android'
    deviceId: string
    token: string
  },
  connection: PoolConnection
): Promise<void> {
  try {
    const {trainerId, token} = options
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

async function findOne(trainerId: number, deviceId: string, platform: 'ios' | 'android'): Promise<ITrainerDevice> {
  try {
    const [row] = await db.query({
      sql: `SELECT t.*
            FROM ?? t
            WHERE ? AND ? AND ?`,
      values: [tableName, {trainerId}, {deviceId}, {platform}]
    })
    return row
  } catch (e) {
    throw e
  }
}

async function findOneWithTokenAndUnmatchDevice(token: string, deviceId: string): Promise<ITrainerDevice> {
  try {
    const [row] = await db.query({
      sql: `SELECT t.*
            FROM ?? t
            WHERE ? AND deviceId != ${escape(deviceId)}`,
      values: [tableName, {token}]
    })
    return row
  } catch (e) {
    throw e
  }
}

async function findOneWithDeviceId(deviceId: string, trainerId: number): Promise<ITrainerDevice> {
  try {
    const [row] = await db.query({
      sql: `SELECT t.*
            FROM ?? t
            WHERE ? AND ?`,
      values: [tableName, {deviceId}, {trainerId}]
    })
    return row
  } catch (e) {
    throw e
  }
}

async function findAllWithUserId(trainerId: number): Promise<[ITrainerDevice]> {
  try {
    return await db.query({
      sql: `SELECT *
            FROM ?? 
            WHERE isNotification = true AND ?`,
      values: [tableName, {trainerId}]
    })
  } catch (e) {
    throw e
  }
}

async function updateOne(options: ITrainerDeviceUpdate, connection?: PoolConnection): Promise<void> {
  const {trainerId, platform, deviceId, ...data} = options
  try {
    await db.query({
      connection,
      sql: `UPDATE ?? SET ? WHERE ? AND ? AND ?`,
      values: [tableName, data, {trainerId}, {platform}, {deviceId}]
    })
  } catch (e) {
    throw e
  }
}

async function deleteOne(deviceId: string, trainerId: number, connection?: PoolConnection): Promise<void> {
  try {
    await db.query({
      connection,
      sql: `DELETE FROM ?? WHERE ? AND ? `,
      values: [tableName, {deviceId}, {trainerId}]
    })
  } catch (e) {
    throw e
  }
}

export {
  tableName,
  createOne,
  upsertOne,
  findOne,
  findOneWithDeviceId,
  findOneWithTokenAndUnmatchDevice,
  findAllWithUserId,
  updateOne,
  deleteOne
}
