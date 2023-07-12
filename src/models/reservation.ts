import moment from 'moment-timezone'
import {escape, PoolConnection} from 'mysql'
import {db} from '../loaders'
import {
  IReservationCreate,
  IReservationDetail,
  IReservationFindAll,
  IReservationList,
  IReservationUpdate,
  IReservationFindOne,
  IReservationFindAllForUser
} from '../interfaces/reservation'
import {Ticket, Trainer, User} from './index'

const tableName = 'Reservations'

async function create(options: IReservationCreate, connection?: PoolConnection): Promise<number> {
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

async function findAll(options: IReservationFindAll): Promise<[IReservationList]> {
  const {franchiseId, userId, startDate, endDate} = options
  try {
    const where = [`t.status != 'cancel'`, `t.startTime BETWEEN ${escape(startDate)} AND ${escape(endDate)}`]
    return await db.query({
      sql: `SELECT t.id, t.startTime, t.endTime, t.status, ti.type as ticketType,
            u.nickname as userNickname, t.seq, ti.totalSession,
            JSON_OBJECT('id', tra.id, 'nickname', tra.nickname, 'profileImage', tra.profileImage) as trainer
            FROM ?? t
            JOIN ?? ti ON ti.id = t.ticketId
            JOIN ?? tr ON tr.ticketId = ti.id AND tr.franchiseId = ${escape(franchiseId)}
            ${userId ? `AND tr.userId = ${escape(userId)}` : ``}
            JOIN ?? u ON u.id = tr.userId 
            JOIN ?? tra ON tra.id = tr.trainerId
            ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
            GROUP BY t.id`,
      values: [tableName, Ticket.tableName, Ticket.tableTicketRelation, User.tableName, Trainer.tableName]
    })
  } catch (e) {
    throw e
  }
}

async function findAllForUser(options: IReservationFindAllForUser): Promise<[IReservationList]> {
  const {userId, startDate} = options
  try {
    const startDateUtc = moment(startDate).utc().format('YYYY-MM-DDTHH:mm:ss')
    const where = [
      `t.status != 'cancel'`,
      `t.startTime BETWEEN ${escape(startDateUtc)} AND DATE_ADD('${startDateUtc}', INTERVAL 30 DAY)`
    ]
    return await db.query({
      sql: `SELECT t.id, t.startTime, t.endTime, t.status, ti.type as ticketType,
            u.nickname as userNickname, t.seq, ti.totalSession, ti.startedAt as ticketStartedAt, ti.expiredAt as ticketExpiredAt,
            JSON_OBJECT('id', tra.id, 'nickname', tra.nickname, 'profileImage', tra.profileImage) as trainer
            FROM ?? t
            JOIN ?? ti ON ti.id = t.ticketId
            JOIN ?? tr ON tr.ticketId = ti.id AND tr.userId = ${escape(userId)}
            JOIN ?? u ON u.id = tr.userId 
            JOIN ?? tra ON tra.id = tr.trainerId
            ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
            GROUP BY t.id`,
      values: [tableName, Ticket.tableName, Ticket.tableTicketRelation, User.tableName, Trainer.tableName]
    })
  } catch (e) {
    throw e
  }
}

async function findOneWithId(id: number): Promise<IReservationDetail> {
  try {
    const [row] = await db.query({
      sql: `SELECT t.id, t.startTime, t.endTime, t.status, ti.type as ticketType,
            u.nickname as userNickname, t.seq, ti.totalSession, ti.startedAt, ti.expiredAt, 
            JSON_OBJECT('id', tra.id, 'nickname', tra.nickname, 'profileImage', tra.profileImage) as trainer
            FROM ?? t
            JOIN ?? ti ON ti.id = t.ticketId
            JOIN ?? tr ON tr.ticketId = ti.id
            JOIN ?? u ON u.id = tr.userId
            JOIN ?? tra ON tra.id = tr.trainerId
            WHERE t.id = ${escape(id)}
            GROUP BY t.id`,
      values: [tableName, Ticket.tableName, Ticket.tableTicketRelation, User.tableName, Trainer.tableName]
    })
    return row
  } catch (e) {
    throw e
  }
}

async function findOne(id: number): Promise<IReservationFindOne> {
  try {
    const [row] = await db.query({
      sql: `SELECT t.* FROM ?? t WHERE t.id = ${escape(id)}`,
      values: [tableName]
    })
    return row
  } catch (e) {
    throw e
  }
}

async function findCountByTicketIdAndPrevStartTime(
  options: {startTime: string; ticketId: number},
  connection?: PoolConnection
): Promise<number> {
  const {startTime, ticketId} = options
  try {
    const [row] = await db.query({
      connection,
      sql: `SELECT COUNT(*) as prevOrderNum FROM ?? WHERE ? 
                AND startTime < ${escape(startTime)} 
                AND times != 0`,
      values: [tableName, {ticketId}]
    })

    return row ? row.prevOrderNum : 0
  } catch (err) {
    throw err
  }
}

async function findBetweenReservation(
  options: {
    startTime: string
    endTime: string
    ticketId: number
  },
  connection?: PoolConnection
): Promise<[{id: number; startTime: string}]> {
  const {startTime, endTime, ticketId} = options
  try {
    return await db.query({
      sql: `SELECT id, startTime FROM ?? WHERE ? 
                AND startTime > ${escape(startTime)} AND startTime < ${escape(endTime)}
                AND times != 0
                ORDER BY startTime ASC`,
      values: [tableName, {ticketId}]
    })
  } catch (err) {
    throw err
  }
}

async function findAllByTicketIdAndLaterStartTime(
  options: {
    startTime: string
    ticketId: number
  },
  connection?: PoolConnection
): Promise<[{id: number; startTime: string}]> {
  const {startTime, ticketId} = options
  try {
    return await db.query({
      sql: `SELECT id, startTime FROM ?? WHERE ? 
                AND startTime > ${escape(startTime)} 
                AND times != 0
                ORDER BY startTime ASC`,
      values: [tableName, {ticketId}]
    })
  } catch (err) {
    throw err
  }
}

async function findOneWithTime({
  trainerId,
  startTime,
  endTime
}: {
  trainerId: number
  startTime: string
  endTime: string
}): Promise<number> {
  try {
    const [row] = await db.query({
      sql: `SELECT count(id) as count FROM ??
            WHERE (status != 'cancel') AND trainerId = ${escape(trainerId)}
            AND (((startTime < ${escape(startTime)} AND ${escape(startTime)} < endTime) 
            OR (startTime < ${escape(endTime)} AND ${escape(endTime)}< endTime))
            OR (startTime >= ${escape(startTime)} AND endTime <= ${escape(endTime)}))
            `,
      values: [tableName]
    })
    return row && row.count
  } catch (e) {
    throw e
  }
}

async function update(options: IReservationUpdate, connection: PoolConnection): Promise<void> {
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

// async function deleteRelationExercise(ReservationId: number, connection: PoolConnection): Promise<void> {
//   try {
//     await db.query({
//       connection,
//       sql: `DELETE FROM ?? WHERE ?`,
//       values: [tableReservationExercise, {ReservationId}]
//     })
//   } catch (e) {
//     throw e
//   }
// }

export {
  tableName,
  create,
  findAll,
  findAllForUser,
  findOneWithId,
  findOne,
  findOneWithTime,
  findCountByTicketIdAndPrevStartTime,
  findBetweenReservation,
  findAllByTicketIdAndLaterStartTime,
  update
  // deleteRelationExercise
}
