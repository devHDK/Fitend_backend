import {PoolConnection, escape} from 'mysql'
import {db} from '../loaders'
import {INotificationFindAll, INotificationFindAllTrainer, INotificationList} from '../interfaces/notifications'

const tableName = 'TrainerNotifications'

async function create(
  options: {
    userId: number
    type: string
    contents: string
    info?: string
  },
  connection: PoolConnection
): Promise<number> {
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

async function findAll(options: INotificationFindAllTrainer): Promise<INotificationList> {
  try {
    const {trainerId, start, perPage} = options
    const where = [`t.trainerId = ${escape(trainerId)}`]
    const rows = await db.query({
      sql: `SELECT t.*
            FROM ?? t
            ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
            GROUP BY t.id
            ORDER BY t.createdAt DESC
            LIMIT ${start}, ${perPage}`,
      values: [tableName]
    })
    const [rowTotal] = await db.query({
      sql: `SELECT COUNT(1) as total FROM (
              SELECT t.id
              FROM ?? t
              ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
            ) t`,
      values: [tableName]
    })
    return {data: rows, total: rowTotal ? rowTotal.total : 0}
  } catch (e) {
    throw e
  }
}

async function findConfirm(userId: number): Promise<boolean> {
  try {
    const [row] = await db.query({
      sql: `SELECT count(*) as count
            FROM ?? t
            WHERE t.userId = ${escape(userId)} AND t.isConfirm = false`,
      values: [tableName]
    })
    return row && row.count < 1
  } catch (e) {
    throw e
  }
}

async function updateConfirmWithUserId(userId: number, connection?: PoolConnection): Promise<void> {
  try {
    await db.query({
      sql: `UPDATE ?? SET ? WHERE ?`,
      values: [tableName, {isConfirm: true}, {userId}]
    })
  } catch (e) {
    throw e
  }
}

export {tableName, create, findAll, findConfirm, updateConfirmWithUserId}
