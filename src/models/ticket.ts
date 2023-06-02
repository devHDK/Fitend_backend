import moment from 'moment-timezone'
import {PoolConnection, escape} from 'mysql'
import {db} from '../loaders'
import {ITicketDetail, ITicketFindAll, ITicketList} from '../interfaces/tickets'
import {Trainer, User} from './index'

moment.tz.setDefault('Asia/Seoul')

const tableName = 'Tickets'
const tableTicketRelation = 'TicketsRelations'

async function create(
  options: {
    type: 'personal' | 'fitness'
    startedAt: string
    expiredAt: string
    totalSession: number
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

async function createRelationExercises(
  options: {
    userId: number
    trainerIds: number[]
    ticketId: number
    franchiseId: number
  },
  connection: PoolConnection
): Promise<void> {
  const {userId, trainerIds, ticketId, franchiseId} = options
  const values = trainerIds.map((trainerId) => `(${userId}, ${trainerId}, ${ticketId}, ${franchiseId})`).join(',')
  try {
    await db.query({
      connection,
      sql: `INSERT INTO ?? (userId, trainerId, ticketId, franchiseId) VALUES ${values}`,
      values: [tableTicketRelation]
    })
  } catch (e) {
    throw e
  }
}

async function findAll(options: ITicketFindAll): Promise<ITicketList> {
  try {
    const {franchiseId, search, status, start, perPage} = options
    const where = []
    if (status !== undefined) {
      const currentTime = moment().format('YYYY-MM-DD')
      if (status) {
        where.push(`t.startedAt <= ${currentTime}`)
        where.push(`t.expiredAt >= ${currentTime}`)
      } else {
        where.push(`t.startedAt >= ${currentTime}`)
        where.push(`t.expiredAt <= ${currentTime}`)
      }
    }
    const rows = await db.query({
      sql: `SELECT t.id, t.type, t.totalSession, DATE_FORMAT(t.startedAt, '%Y-%m-%d') as startedAt,
            DATE_FORMAT(t.expiredAt, '%Y-%m-%d') as expiredAt, t.createdAt,
            JSON_ARRAY(u.nickname) as users
            FROM ?? t
            JOIN ?? tr ON tr.ticketId = t.id AND tr.franchiseId = ?
            JOIN ?? u ON u.id = tr.userId ${
              search ? `AND (u.nickname like '%${search}%' OR u.phone = '%${search}%'` : ``
            }
            ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
            GROUP BY t.id
            ORDER BY t.createdAt DESC
            LIMIT ${start}, ${perPage}`,
      values: [tableName, tableTicketRelation, franchiseId, User.tableName]
    })
    const [rowTotal] = await db.query({
      sql: `SELECT COUNT(1) as total FROM (
              SELECT t.id
              FROM ?? t
              JOIN ?? tr ON tr.ticketId = t.id
              JOIN ?? u ON u.id = tr.userId ${
                search ? `AND (u.nickname like '%${search}%' OR u.phone = '%${search}%'` : ``
              }
              ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
              GROUP BY t.id
            ) t
            `,
      values: [tableName, tableTicketRelation, User.tableName]
    })
    return {data: rows, total: rowTotal ? rowTotal.total : 0}
  } catch (e) {
    throw e
  }
}

async function findOneWithId(id: number): Promise<ITicketDetail> {
  try {
    const [row] = await db.query({
      sql: `SELECT t.id, t.type, t.totalSession, DATE_FORMAT(t.startedAt, '%Y-%m-%d') as startedAt,
            DATE_FORMAT(t.expiredAt, '%Y-%m-%d') as expiredAt, t.createdAt,
            (
              SELECT JSON_ARRAYAGG(
                JSON_OBJECT('id', u.id, 'nickname', u.nickname)
              )
              FROM (
                SELECT u.id, u.nickname
                FROM ?? u
                JOIN ?? tr ON tr.ticketId = t.id
                WHERE u.id = tr.userId
                GROUP BY u.id
              ) u
            ) as users,
            (
              SELECT JSON_ARRAYAGG(
                JSON_OBJECT('id', tra.id, 'nickname', tra.nickname)
              )
              FROM (
                SELECT tra.id, tra.nickname
                FROM ?? tra
                JOIN ?? tr ON tr.ticketId = t.id
                WHERE tra.id = tr.trainerId
                GROUP BY tra.id
              ) tra
            ) as trainers
            FROM ?? t
            WHERE t.?
            GROUP BY t.id`,
      values: [User.tableName, tableTicketRelation, Trainer.tableName, tableTicketRelation, tableName, {id}]
    })
    return row
  } catch (e) {
    throw e
  }
}

async function findCounts(
  userId: number
): Promise<{personalCount: number; fitnessCount: number; expiredCount: number}> {
  try {
    const [row] = await db.query({
      sql: `SELECT 
            (SELECT COUNT(t.id) 
            FROM ?? t 
            WHERE t.type = 'personal' AND EXISTS (
             SELECT 1
             FROM ?? tr
             WHERE tr.ticketId = t.id AND tr.userId = ${escape(userId)}
            )) as personalCount,
            (SELECT COUNT(t.id) 
            FROM ?? t 
            WHERE t.type = 'fitness' AND EXISTS (
             SELECT 1
             FROM ?? tr
             WHERE tr.ticketId = t.id AND tr.userId = ${escape(userId)}
            )) as fitnessCount,
            (SELECT COUNT(t.id) 
            FROM ?? t 
            JOIN ?? tr ON tr.ticketId = t.id AND tr.userId = ${escape(userId)}
            WHERE t.expiredAt < NOW()
            GROUP BY t.id) as expiredCount`,
      values: [tableName, tableTicketRelation, tableName, tableTicketRelation, tableName, tableTicketRelation]
    })
    return row
  } catch (e) {
    throw e
  }
}

async function update(
  options: {
    id: number
    type: 'personal' | 'fitness'
    totalSession: number
    startedAt: string
    expiredAt: string
  },
  connection: PoolConnection
): Promise<void> {
  const {id, ...data} = options
  try {
    await db.query({
      connection,
      sql: `UPDATE ?? SET ? WHERE ? `,
      values: [tableName, data, {id}]
    })
  } catch (e) {
    throw e
  }
}

async function deleteOne(id: number, connection?: PoolConnection): Promise<void> {
  try {
    await db.query({
      connection,
      sql: `DELETE FROM ?? WHERE ?`,
      values: [tableName, {id}]
    })
  } catch (e) {
    throw e
  }
}

async function deleteRelations(ticketId: number, connection: PoolConnection): Promise<void> {
  try {
    await db.query({
      connection,
      sql: `DELETE FROM ?? WHERE ?`,
      values: [tableTicketRelation, {ticketId}]
    })
  } catch (e) {
    throw e
  }
}

export {
  tableName,
  tableTicketRelation,
  create,
  createRelationExercises,
  findAll,
  findOneWithId,
  findCounts,
  update,
  deleteOne,
  deleteRelations
}
