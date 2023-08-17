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
  IReservationFindAllForUser,
  IReservationListForTicket
} from '../interfaces/reservation'
import {Ticket, Trainer, User} from './index'
import {tableTicketRelation} from './ticket'
import {IReservation} from '../interfaces/payroll'

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
  const {franchiseId, userId, trainerId, startDate, endDate} = options
  try {
    const where = [`t.times = 1`, `t.startTime BETWEEN ${escape(startDate)} AND ${escape(endDate)}`]
    if (trainerId) where.push(`t.trainerId = ${escape(trainerId)}`)
    return await db.query({
      sql: `SELECT t.id, t.startTime, t.endTime, t.status, ti.type as ticketType,
            u.nickname as userNickname, t.seq, ti.totalSession,
            JSON_OBJECT('id', tra.id, 'nickname', tra.nickname, 'profileImage', tra.profileImage) as trainer
            FROM ?? t
            JOIN ?? ti ON ti.id = t.ticketId
            JOIN ?? tr ON tr.ticketId = ti.id AND tr.franchiseId = ${escape(franchiseId)}
            ${userId ? `AND tr.userId = ${escape(userId)}` : ``}
            JOIN ?? u ON u.id = tr.userId 
            JOIN ?? tra ON tra.id = t.trainerId
            ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
            GROUP BY t.id
            ORDER BY t.seq`,
      values: [tableName, Ticket.tableName, Ticket.tableTicketRelation, User.tableName, Trainer.tableName]
    })
  } catch (e) {
    throw e
  }
}

async function findAllForUser(options: IReservationFindAllForUser): Promise<[IReservationList]> {
  const {userId, startDate, interval} = options
  try {
    const startDateUtc = moment(startDate).utc().format('YYYY-MM-DDTHH:mm:ss')
    const where = [
      `t.times = 1`,
      `t.startTime BETWEEN ${escape(startDateUtc)} AND DATE_ADD('${startDateUtc}', 
      INTERVAL ${interval ? escape(interval) : 30} DAY)`
    ]
    return await db.query({
      sql: `SELECT DATE_FORMAT(DATE_ADD(t.startTime, INTERVAL 9 HOUR), '%Y-%m-%d') as startDate,
            JSON_ARRAYAGG(JSON_OBJECT(
            'id', t.id, 'startTime', DATE_FORMAT(t.startTime, '%Y-%m-%dT%H:%i:%s.000Z'), 
            'endTime', DATE_FORMAT(t.endTime, '%Y-%m-%dT%H:%i:%s.000Z'), 'status', t.status, 'times', t.times,
            'ticketType', ti.type, 'seq', t.seq, 'totalSession', ti.totalSession, 'userNickname', u.nickname,
            'ticketStartedAt', ti.startedAt, 'ticketExpiredAt', ti.expiredAt,
            'trainer', JSON_OBJECT('id', tra.id, 'nickname', tra.nickname, 'profileImage', tra.profileImage)
            )) as reservations
            FROM ?? t
            JOIN ?? ti ON ti.id = t.ticketId
            JOIN (
              SELECT tr.ticketId, tr.trainerId FROM ?? tr 
              WHERE tr.userId = ${escape(userId)}
              GROUP BY tr.ticketId
            ) tr2 ON tr2.ticketId = ti.id
            JOIN ?? u ON u.id = ${escape(userId)}
            JOIN ?? tra ON tra.id = tr2.trainerId
            ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
            GROUP BY startDate`,
      values: [tableName, Ticket.tableName, Ticket.tableTicketRelation, User.tableName, Trainer.tableName]
    })
  } catch (e) {
    throw e
  }
}

async function findAllWithTicketId(ticketId: number): Promise<[IReservationListForTicket]> {
  try {
    return await db.query({
      sql: `SELECT r.id, r.seq, r.startTime, r.endTime, ru.nickname as userNickname,
            rt.nickname as trainerNickname, r.status, r.times
            FROM ?? r
            JOIN ?? ru ON ru.id = r.userId
            JOIN ?? rt ON rt.id = r.trainerId
            WHERE r.ticketId = ${escape(ticketId)}
            ORDER BY r.startTime`,
      values: [tableName, User.tableName, Trainer.tableName]
    })
  } catch (e) {
    throw e
  }
}

async function findOneWithId(id: number): Promise<IReservationDetail> {
  try {
    const [row] = await db.query({
      sql: `SELECT t.id, t.startTime, t.endTime, t.status, t.times, ti.id as ticketId, ti.type as ticketType,
            u.id as userId, u.nickname as userNickname, t.seq, ti.totalSession, ti.startedAt, ti.expiredAt, 
            JSON_OBJECT('id', tra.id, 'nickname', tra.nickname, 'profileImage', tra.profileImage) as trainer
            FROM ?? t
            JOIN ?? ti ON ti.id = t.ticketId
            JOIN ?? tr ON tr.ticketId = ti.id
            JOIN ?? u ON u.id = tr.userId
            JOIN ?? tra ON tra.id = t.trainerId
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

async function findValidCount(ticketId: number): Promise<number> {
  try {
    const [row] = await db.query({
      sql: `SELECT COUNT(*) as count 
            FROM ?? 
            WHERE ticketId = ${escape(ticketId)} AND times = 1`,
      values: [tableName]
    })
    return row ? row.count : 0
  } catch (e) {
    throw e
  }
}

async function findAttendanceNoShowCount(
  franchiseId: number,
  thisMonthStart: string,
  thisMonthEnd: string
): Promise<{attendance: number; noShow: number}> {
  try {
    const [row] = await db.query({
      sql: `SELECT 
            (SELECT COUNT(t.id)
            FROM (
            SELECT t.id FROM ?? t
            JOIN ?? ti ON ti.id = t.ticketId
            JOIN ?? tr ON tr.ticketId = ti.id AND tr.franchiseId = ${escape(franchiseId)}
            WHERE t.status = 'attendance' AND t.ticketId = ti.id
            AND t.startTime BETWEEN ${escape(thisMonthStart)} AND ${escape(thisMonthEnd)}
            GROUP BY t.id
            ) t) as attendance,
            (SELECT COUNT(t.id)
            FROM (
            SELECT t.id FROM ?? t
            JOIN ?? ti ON ti.id = t.ticketId
            JOIN ?? tr ON tr.ticketId = ti.id AND tr.franchiseId = ${escape(franchiseId)}
            WHERE t.status = 'cancel' AND t.times = 1 AND t.ticketId = ti.id
            AND t.startTime BETWEEN ${escape(thisMonthStart)} AND ${escape(thisMonthEnd)}
            GROUP BY t.id
            ) t) as noShow
            `,
      values: [
        tableName,
        Ticket.tableName,
        Ticket.tableTicketRelation,
        tableName,
        Ticket.tableName,
        Ticket.tableTicketRelation
      ]
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
      connection,
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

async function findBetweenReservationWithTrainerId(
  options: {
    startTime: string
    endTime: string
    trainerId: number
    franchiseId: number
  },
  connection?: PoolConnection
): Promise<[IReservation]> {
  const {startTime, endTime, trainerId, franchiseId} = options
  try {
    return await db.query({
      connection,
      sql: `SELECT t.ticketId, ti.type, u.nickname as nickname, ti.sessionPrice, ti.coachingPrice, ti.totalSession,
            (ti.totalSession - (SELECT MAX(r2.seq) FROM ?? r2 
                WHERE r2.ticketId = tr.ticketId AND r2.times != 0 AND 
                r2.startTime > ${escape(startTime)} AND r2.startTime < ${escape(endTime)})) as leftSession,
            (SELECT COUNT(*) FROM ?? r 
                WHERE r.ticketId = tr.ticketId AND r.times != 0 AND 
                r.startTime > ${escape(startTime)} AND r.startTime < ${escape(endTime)}) as thisMonthCount
            FROM ?? t 
            JOIN ?? tr ON tr.ticketId = t.ticketId 
            JOIN ?? ti ON ti.id = tr.ticketId
            JOIN ?? u ON t.userId = u.id
            WHERE t.trainerId = ? AND t.startTime > ${escape(startTime)} AND t.startTime < ${escape(endTime)}
            AND t.times != 0 AND tr.franchiseId = ?
            GROUP BY t.ticketId`,
      values: [
        tableName,
        tableName,
        tableName,
        tableTicketRelation,
        Ticket.tableName,
        User.tableName,
        trainerId,
        franchiseId
      ]
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
      connection,
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

async function findBurnRate(franchiseId: number): Promise<{total: number; used: number}> {
  try {
    const [row] = await db.query({
      sql: `SELECT 
            (
            SELECT SUM(t.totalSession) FROM ?? t 
            JOIN ?? tr ON tr.ticketId = t.id AND tr.franchiseId = ${escape(franchiseId)}
            WHERE t.expiredAt > NOW()
            ) total,
            (
            SELECT COUNT(t.id)
            FROM (
            SELECT t.id FROM ?? t
            JOIN ?? ti ON ti.id = t.ticketId
            JOIN ?? tr ON tr.ticketId = ti.id AND tr.franchiseId = ${escape(franchiseId)} 
            AND ti.expiredAt > NOW()
            WHERE t.status = 'attendance' OR (t.status = 'cancel' AND t.times = 1)
            GROUP BY t.id
            ) t
            ) used`,
      values: [Ticket.tableName, Ticket.tableTicketRelation, tableName, Ticket.tableName, Ticket.tableTicketRelation]
    })
    return row
  } catch (err) {
    throw err
  }
}

async function findOneWithTime(
  options: {ticketId: number; startTime: string; endTime: string; reservedId?: number},
  connection?: PoolConnection
): Promise<number> {
  const {ticketId, startTime, endTime, reservedId} = options
  try {
    const [row] = await db.query(
      {
        connection,
        sql: `SELECT count(id) as count FROM ??  
            WHERE times != 0 AND ticketId = ${escape(ticketId)}
            AND (((startTime < '${startTime}' AND '${startTime}' < endTime) OR (startTime < '${endTime}' AND '${endTime}'< endTime))
            OR (startTime >= '${startTime}' AND endTime <= '${endTime}')) 
            ${reservedId ? `AND id != ${escape(reservedId)}` : ``}`,
        values: [this.tableName]
      },
      '*'
    )
    return row.count
  } catch (err) {
    throw err
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
  findAllWithTicketId,
  findOneWithId,
  findOne,
  findValidCount,
  findCountByTicketIdAndPrevStartTime,
  findBetweenReservation,
  findBetweenReservationWithTrainerId,
  findAllByTicketIdAndLaterStartTime,
  findBurnRate,
  findAttendanceNoShowCount,
  findOneWithTime,
  update
  // deleteRelationExercise
}
