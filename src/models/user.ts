import moment from 'moment-timezone'
import {v4 as uuid} from 'uuid'
import {PoolConnection} from 'mysql'
import {db} from '../loaders'
import {IUser, IUserCreateOne, IUserFindOne, IUserUpdate, IUserUpdatePassword} from '../interfaces/user'

moment.tz.setDefault('Asia/Seoul')

const tableName = 'Users'

async function create(options: IUserCreateOne, connection?: PoolConnection): Promise<IUser> {
  try {
    options.deviceId = uuid()
    const {accountInfo, ...data} = options
    const {insertId} = await db.query({
      connection,
      sql: `INSERT INTO ?? SET ?`,
      values: [
        tableName,
        {
          accountInfo: JSON.stringify(accountInfo),
          ...data
        }
      ]
    })
    options.id = insertId
    options.point = 0
    if (!options.cityId) options.cityId = null
    if (!options.isMarried) options.isMarried = null
    return options
  } catch (e) {
    throw e
  }
}

async function findOne(options: IUserFindOne): Promise<IUser> {
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

async function updatePassword(options: IUserUpdatePassword, connection?: PoolConnection): Promise<void> {
  try {
    const {id, accountInfo} = options
    await db.query({
      connection,
      sql: `UPDATE ?? SET ? WHERE ?`,
      values: [tableName, {accountInfo: JSON.stringify(accountInfo)}, {id}]
    })
  } catch (e) {
    throw e
  }
}

async function updateOne(options: IUserUpdate, connection?: PoolConnection): Promise<IUser> {
  const {id, ...data} = options
  try {
    if (!data.nickname) delete data.nickname
    if (!data.cityId) delete data.cityId
    if (!data.accountInfo) delete data.accountInfo
    else data.accountInfo = JSON.stringify(data.accountInfo)
    if (!data.deleteType) delete data.deleteType
    if (!data.deleteDescription) delete data.deleteDescription
    if (!data.deviceId) delete data.deviceId
    if (data.isMarried === undefined || data.isMarried === null) delete data.isMarried
    const {affectedRows} = await db.query({
      connection,
      sql: `UPDATE ?? SET ? WHERE ? `,
      values: [tableName, data, {id}]
    })
    if (affectedRows > 0) return options
  } catch (e) {
    throw e
  }
}

export {
  tableName,
  create,
  findOne,
  updateOne,
  updatePassword
}
