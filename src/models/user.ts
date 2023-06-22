import moment from 'moment-timezone'
import {PoolConnection, escape} from 'mysql'
import {db} from '../loaders'
import {
  IUser,
  IUserCreateOne,
  IUserFindOne,
  IUserUpdate,
  IUserFindAll,
  IUserListForTrainer,
  IUserData
} from '../interfaces/user'
import {Trainer, Ticket} from './'

const utcTime = moment.utc()

const tableName = 'Users'
const tableFranchiseUser = 'Franchises-Users'

async function create(options: IUserCreateOne, connection: PoolConnection): Promise<number> {
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

async function createRelationsFranchises(
  options: {
    userId: number
    franchiseId: number
  },
  connection: PoolConnection
): Promise<void> {
  try {
    await db.query({
      connection,
      sql: `INSERT INTO ?? SET ?`,
      values: [tableFranchiseUser, options]
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

async function findOneWithId(id: number): Promise<IUser> {
  try {
    const [row] = await db.query({
      sql: `SELECT t.id, t.nickname, t.email, t.phone, DATE_FORMAT(t.birth, '%Y-%m-%d') as birth,
            t.gender, t.job, t.createdAt
            FROM ?? t
            WHERE ?`,
      values: [tableName, {id}]
    })
    return row
  } catch (e) {
    throw e
  }
}

async function findAllForTrainer(options: IUserFindAll): Promise<IUserListForTrainer> {
  try {
    const {franchiseId, start, perPage, search, status, trainerId} = options
    const where = []

    if (search) where.push(`(t.nickname like '%${search}%' OR t.phone like '%${search}%')`)
    const currentTime = utcTime.format('YYYY-MM-DDTHH:mm:ss')
    const rows: IUserData[] = await db.query({
      sql: `SELECT t.id, t.nickname, t.phone, t.createdAt,
            (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', tra.id, 'nickname', tra.nickname)) FROM ?? ti
            JOIN ?? tr ON tr.userId = t.id AND tr.ticketId = ti.id
            JOIN ?? tra ON tra.id = tr.trainerId
            WHERE ti.expiredAt > '${currentTime}'
            LIMIT 1
            ) as trainers
            FROM ?? t
            JOIN ?? fu ON fu.userId = t.id AND fu.franchiseId = ?
            ${
              trainerId
                ? `JOIN TicketsRelations tr ON tr.trainerId = ${escape(trainerId)} AND tr.userId = t.id
                   JOIN Tickets ti ON ti.id = tr.ticketId AND ti.expiredAt > '${currentTime}'`
                : ''
            }
            ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
            GROUP BY t.id
            ${status !== undefined ? `HAVING trainers IS ${status ? 'NOT' : ''} NULL` : ``}
            ORDER BY t.createdAt DESC
            LIMIT ${start}, ${perPage}`,
      values: [
        Ticket.tableName,
        Ticket.tableTicketRelation,
        Trainer.tableName,
        tableName,
        tableFranchiseUser,
        franchiseId
      ]
    })
    const [rowTotal] = await db.query({
      sql: `SELECT COUNT(1) as total FROM (
              SELECT t.id, t.nickname, t.phone, t.createdAt,
              (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', tra.id, 'nickname', tra.nickname)) FROM ?? ti
              JOIN ?? tr ON tr.userId = t.id AND tr.ticketId = ti.id
              JOIN ?? tra ON tra.id = tr.trainerId
              WHERE ti.expiredAt > '${currentTime}'
              LIMIT 1
              ) as trainers
              FROM ?? t
              JOIN ?? fu ON fu.userId = t.id AND fu.franchiseId = ?
              ${
                trainerId
                  ? `JOIN TicketsRelations tr ON tr.trainerId = ${escape(trainerId)} AND tr.userId = t.id
                   JOIN Tickets ti ON ti.id = tr.ticketId AND ti.expiredAt > '${currentTime}'`
                  : ''
              }
              ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
              GROUP BY t.id
              ${status !== undefined ? `HAVING trainers IS ${status ? 'NOT' : ''} NULL` : ``}
            ) t
            `,
      values: [
        Ticket.tableName,
        Ticket.tableTicketRelation,
        Trainer.tableName,
        tableName,
        tableFranchiseUser,
        franchiseId
      ]
    })
    return {data: rows, total: rowTotal ? rowTotal.total : 0}
  } catch (e) {
    throw e
  }
}

async function updateOne(options: IUserUpdate): Promise<void> {
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

async function updatePlatform(options: {id: number; platform: 'ios' | 'android'}): Promise<void> {
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

export {
  tableName,
  create,
  createRelationsFranchises,
  findOne,
  findOneWithId,
  findAllForTrainer,
  updateOne,
  updatePlatform
}
