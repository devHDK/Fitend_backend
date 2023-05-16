import moment from 'moment-timezone'
import {PoolConnection} from 'mysql'
import crypto from 'crypto'
import {db} from '../loaders'
import {passwordIterations} from '../libs/code'
import {
  IUser,
  IUserCreateOne,
  IUserFindOne,
  IUserUpdate,
  IUserUpdatePassword,
  IUserFindAll,
  IUserListForTrainer,
  IUserData
} from "../interfaces/user";
import {Trainer, Ticket} from './'
import { reduceNull } from "../loaders/mysql";

const utcTime = moment.utc()

const tableName = 'Users'

function verifyPassword(password, hash, salt) {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, passwordIterations.mobile, 64, 'sha512', (err, key) => {
      if (err) reject(err)
      if (key.toString('base64') === hash) resolve(true)
      else resolve(false)
    })
  })
}

async function create(options: IUserCreateOne) {
  try {
    const {email, nickname, password, ...data} = options
    await db.query({
      sql: `INSERT INTO ?? SET ?`,
      values: [tableName, options]
    })
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

async function findAllForTrainer(options: IUserFindAll): Promise<IUserListForTrainer> {
  try {
    const {start, perPage} = options
    const where = []

    const currentTime = utcTime.format('YYYY-MM-DDTHH:mm:ss')
    let rows: IUserData[] = await db.query({
      sql: `SELECT t.id, t.nickname, t.phone, t.createdAt,
            JSON_ARRAYAGG(JSON_OBJECT('id', tra.id, 'nickname', tra.nickname)) as trainers
            FROM ?? t
            LEFT JOIN ?? tr ON tr.userId = t.id
            LEFT JOIN ?? ti ON ti.id = tr.ticketId AND ti.expiredAt > '${currentTime}'
            LEFT JOIN ?? tra ON tra.id = tr.trainerId 
            ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
            GROUP BY t.id
            ORDER BY t.createdAt DESC
            LIMIT ${start}, ${perPage}`,
      values: [tableName, Ticket.tableTicketRelation, Ticket.tableName, Trainer.tableName]
    })
    rows = reduceNull(rows, 'trainers', 'id', null)
    const [rowTotal] = await db.query({
      sql: `SELECT COUNT(1) as total FROM ?? t
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}`,
      values: [tableName]
    })
    return {data: rows, total: rowTotal ? rowTotal.total : 0}
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

export {tableName, verifyPassword, create, findOne, findAllForTrainer, updateOne, updatePassword}
