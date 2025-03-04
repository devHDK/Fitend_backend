import moment from 'moment-timezone'
import {PoolConnection, escape} from 'mysql'
import {db} from '../loaders'
import {
  ITicket,
  ITicketDetail,
  ITicketFindAll,
  ITicketList,
  ITicketFindOne,
  ITicketForUser,
  IActiveTicketList,
  ITicketFindAllForAdmin,
  ITicketListForAdmin
} from '../interfaces/tickets'
import {Payment, Reservation, Ticket, TicketHolding, Trainer, User, WorkoutFeedbacks, WorkoutSchedule} from './index'
import {ICoaching, ICoachingForAdmin} from '../interfaces/payroll'

moment.tz.setDefault('Asia/Seoul')

const tableName = 'Tickets'
const tableTicketRelation = 'TicketsRelations'

async function create(
  options: {
    type: 'personal' | 'fitness'
    startedAt: string
    expiredAt: string
    totalSession: number
    serviceSession: number
    sessionPrice: number
    coachingPrice: number
    month?: number
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
    const {franchiseId, search, status, type, userId, trainerId, start, perPage} = options
    const where = []
    const currentTime = moment().format('YYYY-MM-DD')
    if (status !== undefined) {
      if (status === 'banned') {
        where.push(`t.expiredAt < '${currentTime}'`)
      } else if (status === 'active') {
        where.push(`t.expiredAt >= '${currentTime}'`)
      }
    }
    if (type !== undefined) {
      where.push(`t.type = ${escape(type)}`)
    }
    const rows = await db.query({
      sql: `SELECT t.id, t.type, (t.totalSession + t.serviceSession) as totalSession,
            ((t.totalSession + t.serviceSession) - (SELECT COUNT(*) FROM ?? r
            WHERE r.ticketId = t.id AND 
            (r.status = 'attendance' OR (r.status = 'cancel' AND r.times = 1)))) as restSession,
            ((t.totalSession + t.serviceSession) - (SELECT COUNT(*) FROM ?? r
            WHERE r.ticketId = t.id AND r.times = 1)) as availSession,
            DATE_FORMAT(t.startedAt, '%Y-%m-%d') as startedAt,
            DATE_FORMAT(t.expiredAt, '%Y-%m-%d') as expiredAt, t.createdAt,
            JSON_ARRAY(u.nickname) as users,
            (SELECT IF(EXISTS(SELECT * FROM ?? th 
            WHERE th.ticketId = t.id AND th.startAt <= '${currentTime}' AND th.endAt >= '${currentTime}') , TRUE, FALSE) 
            ) as isHolding,
            (SELECT IF(EXISTS(SELECT * FROM ?? p
            WHERE p.ticketID = t.id), TRUE, FALSE)
              ) as isOnline
            FROM ?? t
            JOIN ?? tr ON tr.ticketId = t.id AND tr.franchiseId = ? ${
              trainerId ? `AND tr.trainerId = ${trainerId}` : ``
            } ${userId ? `AND tr.userId = ${userId}` : ``}
            JOIN ?? u ON u.id = tr.userId ${
              search ? `AND (u.nickname like '%${search}%' OR u.phone = '%${search}%')` : ``
            }
            ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
            GROUP BY t.id
            ${status === 'active' ? `HAVING isHolding IS FALSE` : ``}
            ${status === 'hold' ? `HAVING isHolding IS TRUE` : ``}
            ORDER BY t.createdAt DESC
            LIMIT ${start}, ${perPage}`,
      values: [
        Reservation.tableName,
        Reservation.tableName,
        TicketHolding.tableName,
        Payment.tableName,
        tableName,
        tableTicketRelation,
        franchiseId,
        User.tableName
      ]
    })

    rows.forEach((value) => {
      if (value.isHolding === null) {
        value.isHolding = false
      }
    })

    const [rowTotal] = await db.query({
      sql: `SELECT COUNT(1) as total FROM (
              SELECT t.id,
              (SELECT IF(EXISTS(SELECT * FROM ?? th 
                WHERE th.ticketId = t.id AND th.startAt <= '${currentTime}' AND th.endAt >= '${currentTime}') , TRUE, FALSE) 
                ) as isHolding,
                (SELECT IF(EXISTS(SELECT * FROM ?? p
                  WHERE p.ticketID = t.id), TRUE, FALSE)
                    ) as isOnline
              FROM ?? t
              JOIN ?? tr ON tr.ticketId = t.id ${trainerId ? `AND tr.trainerId = ${trainerId}` : ``} ${
        userId ? `AND tr.userId = ${userId}` : ``
      }
              JOIN ?? u ON u.id = tr.userId ${
                search ? `AND (u.nickname like '%${search}%' OR u.phone = '%${search}%')` : ``
              }
              ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
              GROUP BY t.id
              ${status === 'active' ? `HAVING isHolding IS FALSE` : ``}
              ${status === 'hold' ? `HAVING isHolding IS TRUE` : ``}
            ) t
            `,
      values: [TicketHolding.tableName, Payment.tableName, tableName, tableTicketRelation, User.tableName]
    })

    return {data: rows, total: rowTotal ? rowTotal.total : 0}
  } catch (e) {
    throw e
  }
}

async function findAllTicketsForAdmin(options: ITicketFindAllForAdmin): Promise<ITicketListForAdmin> {
  try {
    const {search, trainerSearch, status, type, start, perPage} = options
    const where = []
    const currentTime = moment().format('YYYY-MM-DD')
    if (status !== undefined) {
      if (status === 'expired') {
        where.push(`t.expiredAt < '${currentTime}'`)
      } else if (status === 'active') {
        where.push(`t.expiredAt >= '${currentTime}'`)
      }
    }
    if (type !== undefined) {
      where.push(`t.type = ${escape(type)}`)
    }
    const rows = await db.query({
      sql: `SELECT t.id, t.type, u.nickname as userName, tra.nickname as trainerName,
            DATE_FORMAT(t.startedAt, '%Y-%m-%d') as startedAt,
            DATE_FORMAT(t.expiredAt, '%Y-%m-%d') as expiredAt, t.createdAt,
            (SELECT IF(EXISTS(SELECT * FROM ?? th 
            WHERE th.ticketId = t.id AND th.startAt <= '${currentTime}' AND th.endAt >= '${currentTime}') , TRUE, FALSE) 
            ) as isHolding,
            (SELECT IF(EXISTS(SELECT * FROM ?? t2
            WHERE t2.id = t.id AND t2.month > 0), TRUE, FALSE)
              ) as isPaid
            FROM ?? t
            JOIN ?? tr ON tr.ticketId = t.id
            JOIN ?? tra ON tra.id = tr.trainerId ${trainerSearch ? `AND (tra.nickname like '%${trainerSearch}%')` : ``}
            JOIN ?? u ON u.id = tr.userId ${search ? `AND (u.nickname like '%${search}%')` : ``}
            ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
            GROUP BY t.id
            ${status === 'active' ? `HAVING isHolding IS FALSE` : ``}
            ${status === 'hold' ? `HAVING isHolding IS TRUE` : ``}
            ORDER BY t.createdAt DESC
            LIMIT ${start}, ${perPage}`,
      values: [TicketHolding.tableName, tableName, tableName, tableTicketRelation, Trainer.tableName, User.tableName]
    })

    rows.forEach((value) => {
      if (value.isHolding === null) {
        value.isHolding = false
      }
    })

    const [rowTotal] = await db.query({
      sql: `SELECT COUNT(1) as total FROM (
              SELECT t.id,
              (SELECT IF(EXISTS(SELECT * FROM ?? th 
              WHERE th.ticketId = t.id AND th.startAt <= '${currentTime}' AND th.endAt >= '${currentTime}') , TRUE, FALSE) 
              ) as isHolding,
              (SELECT IF(EXISTS(SELECT * FROM ?? t2
              WHERE t2.id = t.id AND t2.month > 0), TRUE, FALSE)
              ) as isPaid
              FROM ?? t
              JOIN ?? tr ON tr.ticketId = t.id
              JOIN ?? tra ON tra.id = tr.trainerId ${
                trainerSearch ? `AND (tra.nickname like '%${trainerSearch}%')` : ``
              }
              JOIN ?? u ON u.id = tr.userId ${
                search ? `AND (u.nickname like '%${search}%' OR u.phone = '%${search}%')` : ``
              }
              ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
              GROUP BY t.id
              ${status === 'active' ? `HAVING isHolding IS FALSE` : ``}
              ${status === 'hold' ? `HAVING isHolding IS TRUE` : ``}
            ) t
            `,
      values: [TicketHolding.tableName, tableName, tableName, tableTicketRelation, Trainer.tableName, User.tableName]
    })

    return {data: rows, total: rowTotal ? rowTotal.total : 0}
  } catch (e) {
    throw e
  }
}

async function findUserTicketCountWithUserId(userId: number): Promise<number | null> {
  try {
    const [row] = await db.query({
      sql: `SELECT COUNT(*) as total
            FROM ?? tr
            WHERE tr.userId = ${escape(userId)}
            `,
      values: [tableTicketRelation]
    })
    return row.total
  } catch (e) {
    throw e
  }
}

async function findAllForUser(options: {userId: number}, connection?: PoolConnection): Promise<ITicketList> {
  try {
    const {userId} = options
    const status = 'active'
    const where = []
    const currentTime = moment().format('YYYY-MM-DD')

    where.push(`t.expiredAt >= '${currentTime}'`)

    const rows = await db.query({
      connection,
      sql: `SELECT t.id, t.type, (t.totalSession + t.serviceSession) as totalSession,
            ((t.totalSession + t.serviceSession) - (SELECT COUNT(*) FROM ?? r
            WHERE r.ticketId = t.id AND 
            (r.status = 'attendance' OR (r.status = 'cancel' AND r.times = 1)))) as restSession,
            ((t.totalSession + t.serviceSession) - (SELECT COUNT(*) FROM ?? r
            WHERE r.ticketId = t.id AND r.times = 1)) as availSession,
            DATE_FORMAT(t.startedAt, '%Y-%m-%d') as startedAt,
            DATE_FORMAT(t.expiredAt, '%Y-%m-%d') as expiredAt, t.createdAt,
            JSON_ARRAY(u.nickname) as users,
            p.receiptId,
            t.month,
            (SELECT IF(EXISTS(SELECT * FROM ?? th 
            WHERE th.ticketId = t.id AND th.startAt <= '${currentTime}' AND th.endAt >= '${currentTime}') , TRUE, FALSE) 
            ) as isHolding
            FROM ?? t
            JOIN ?? tr ON tr.ticketId = t.id AND tr.userId = ${userId}
            JOIN ?? u ON u.id = tr.userId 
            LEFT JOIN ?? p on p.ticketId = t.id
            ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
            GROUP BY t.id
            ${status === 'active' ? `HAVING isHolding IS FALSE` : ``}
            ORDER BY t.id ASC`,
      values: [
        Reservation.tableName,
        Reservation.tableName,
        TicketHolding.tableName,
        tableName,
        tableTicketRelation,
        User.tableName,
        Payment.tableName
      ]
    })

    rows.forEach((value) => {
      if (value.isHolding === null) {
        value.isHolding = false
      }
    })

    return rows
  } catch (e) {
    throw e
  }
}

async function findActiveTickets(options: {userId: number}, connection?: PoolConnection): Promise<IActiveTicketList> {
  try {
    const {userId} = options
    const where = []
    const currentTime = moment().format('YYYY-MM-DD')

    where.push(`t.startedAt >= '${currentTime}'`)

    const rows = await db.query({
      connection,
      sql: `SELECT t.id, t.type, (t.totalSession + t.serviceSession) as totalSession,
            ((t.totalSession + t.serviceSession) - (SELECT COUNT(*) FROM ?? r
            WHERE r.ticketId = t.id AND 
            (r.status = 'attendance' OR (r.status = 'cancel' AND r.times = 1)))) as restSession,
            ((t.totalSession + t.serviceSession) - (SELECT COUNT(*) FROM ?? r
            WHERE r.ticketId = t.id AND r.times = 1)) as availSession,
            DATE_FORMAT(t.startedAt, '%Y-%m-%d') as startedAt,
            DATE_FORMAT(t.expiredAt, '%Y-%m-%d') as expiredAt, t.createdAt,
            JSON_ARRAY(u.nickname) as users,
            p.receiptId
            FROM ?? t
            JOIN ?? tr ON tr.ticketId = t.id AND tr.userId = ${userId}
            JOIN ?? u ON u.id = tr.userId 
            LEFT JOIN ?? p on p.ticketId = t.id
            ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
            GROUP BY t.id
            ORDER BY t.id ASC`,
      values: [
        Reservation.tableName,
        Reservation.tableName,
        tableName,
        tableTicketRelation,
        User.tableName,
        Payment.tableName
      ]
    })

    return rows
  } catch (e) {
    throw e
  }
}

async function findAllTicketsForUser(options: {userId: number}, connection?: PoolConnection): Promise<ITicketForUser> {
  try {
    const {userId} = options
    const currentTime = moment().format('YYYY-MM-DD')

    const rows = await db.query({
      connection,
      sql: `SELECT t.id, t.type, t.totalSession, t.serviceSession,
            ((t.totalSession + t.serviceSession) - (SELECT COUNT(*) FROM ?? r
            WHERE r.ticketId = t.id AND 
            (r.status = 'attendance' OR (r.status = 'cancel' AND r.times = 1)))) as restSession,
            ((t.totalSession + t.serviceSession) - (SELECT COUNT(*) FROM ?? r
            WHERE r.ticketId = t.id AND r.times = 1)) as availSession,
            DATE_FORMAT(t.startedAt, '%Y-%m-%d') as startedAt,
            DATE_FORMAT(t.expiredAt, '%Y-%m-%d') as expiredAt,
            t.createdAt, t.sessionPrice, t.coachingPrice,
            JSON_ARRAY(u.nickname) as users,
            p.receiptId,
            t.month,
            (SELECT IF(EXISTS(SELECT * FROM ?? th 
            WHERE th.ticketId = t.id AND th.startAt <= '${currentTime}' AND th.endAt >= '${currentTime}') , TRUE, FALSE) 
            ) as isHolding
            FROM ?? t
            JOIN ?? tr ON tr.ticketId = t.id AND tr.userId = ${userId}
            JOIN ?? u ON u.id = tr.userId 
            LEFT JOIN ?? p on p.ticketId = t.id
            GROUP BY t.id
            ORDER BY t.id DESC`,
      values: [
        Reservation.tableName,
        Reservation.tableName,
        TicketHolding.tableName,
        tableName,
        tableTicketRelation,
        User.tableName,
        Payment.tableName
      ]
    })

    rows.forEach((value) => {
      if (value.isHolding === null) {
        value.isHolding = false
      }
    })

    return rows
  } catch (e) {
    throw e
  }
}

async function findLastTicketUser(options: {userId: number}, connection?: PoolConnection): Promise<ITicketList> {
  try {
    const {userId} = options
    const where = []
    const currentTime = moment().format('YYYY-MM-DD')

    const rows = await db.query({
      connection,
      sql: `SELECT t.id, t.type,  (t.totalSession + t.serviceSession) as totalSession,
            ((t.totalSession + t.serviceSession) - (SELECT COUNT(*) FROM ?? r
            WHERE r.ticketId = t.id AND 
            (r.status = 'attendance' OR (r.status = 'cancel' AND r.times = 1)))) as restSession,
            ((t.totalSession + t.serviceSession) - (SELECT COUNT(*) FROM ?? r
            WHERE r.ticketId = t.id AND r.times = 1)) as availSession,
            DATE_FORMAT(t.startedAt, '%Y-%m-%d') as startedAt,
            DATE_FORMAT(t.expiredAt, '%Y-%m-%d') as expiredAt, t.createdAt,
            JSON_ARRAY(u.nickname) as users,
            p.receiptId,
            t.month,
            (SELECT IF(EXISTS(SELECT * FROM ?? th 
            WHERE th.ticketId = t.id AND th.startAt <= '${currentTime}' AND th.endAt >= '${currentTime}') , TRUE, FALSE) 
            ) as isHolding
            FROM ?? t
            JOIN ?? tr ON tr.ticketId = t.id AND tr.userId = ${userId}
            JOIN ?? u ON u.id = tr.userId 
            LEFT JOIN ?? p on p.ticketId = t.id
            GROUP BY t.id
            ORDER BY t.id DESC
            LIMIT 1
            `,

      values: [
        Reservation.tableName,
        Reservation.tableName,
        TicketHolding.tableName,
        tableName,
        tableTicketRelation,
        User.tableName,
        Payment.tableName
      ]
    })

    rows.forEach((value) => {
      if (value.isHolding === null) {
        value.isHolding = false
      }
    })

    return rows
  } catch (e) {
    throw e
  }
}

async function findOne(options: ITicketFindOne): Promise<ITicket> {
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

async function findBetweenFCTicket(options: {
  startDate: Date
  trainerId: number
  franchiseId: number
}): Promise<IResponseList<ICoaching>> {
  try {
    const {startDate, trainerId, franchiseId} = options
    const currentTime = moment(startDate).format('YYYY-MM-DD')
    const startMonth = moment(startDate).startOf('month').format('YYYY-MM-DD')

    const rows = await db.query({
      sql: `SELECT t.id as ticketId, u.nickname, t.month as type, t.coachingPrice,
            DATE_FORMAT(t.startedAt, '%Y-%m-%d') as startedAt, DATE_FORMAT(t.expiredAt, '%Y-%m-%d') as expiredAt,
            (SELECT JSON_ARRAYAGG(
              JSON_OBJECT('holdId', th.id, 'startAt', th.startAt, 'endAt', th.endAt, 'days', th.days
            ))
            FROM ?? th
            WHERE th.ticketId = t.id
            )  as holdingList
            FROM ?? t 
            JOIN ?? tr ON tr.ticketId = t.id 
            JOIN ?? u ON u.id = tr.userId
            WHERE tr.trainerId = ? AND tr.franchiseId = ? AND t.type = 'fitness' 
            AND t.expiredAt >= ${escape(startMonth)} AND t.startedAt <= ${escape(currentTime)}`,
      values: [TicketHolding.tableName, tableName, tableTicketRelation, User.tableName, trainerId, franchiseId]
    })

    const [rowTotal] = await db.query({
      sql: `SELECT COUNT(1) as total FROM (
        SELECT u.id FROM ?? u
        JOIN ?? tr ON tr.userId = u.id
        JOIN ?? ti ON ti.id = tr.ticketId
        WHERE tr.trainerId = ? AND tr.franchiseId = ? AND ti.type = 'fitness'
        AND ti.expiredAt >= ${escape(startMonth)} AND ti.startedAt <= ${escape(currentTime)}
      ) t`,
      values: [User.tableName, tableTicketRelation, tableName, trainerId, franchiseId]
    })
    return {data: rows, total: rowTotal ? rowTotal.total : 0}
  } catch (e) {
    throw e
  }
}

async function findFcTicketWithTrainerIdForAdmin(options: {
  startTime: string
  endTime: string
  trainerId: number
}): Promise<[ICoachingForAdmin]> {
  try {
    const {startTime, endTime, trainerId} = options
    const rows = await db.query({
      sql: `SELECT t.id as ticketId, u.nickname, t.type, t.coachingPrice,
            (SELECT COUNT(wf.id) FROM ?? wf 
                JOIN ?? ws ON wf.workoutScheduleId = ws.id
                WHERE ws.trainerId = ${trainerId} AND ws.userId = u.id) as doneCount
            FROM ?? t
            JOIN ?? tr ON t.id = tr.ticketId
            JOIN ?? u ON u.id = tr.userId
            WHERE tr.trainerId = ?
            AND t.startedAt >= ${escape(startTime)} AND t.startedAt <= ${escape(endTime)}
            AND t.type = 'fitness'`,
      values: [
        WorkoutFeedbacks.tableName,
        WorkoutSchedule.tableName,
        tableName,
        tableTicketRelation,
        User.tableName,
        trainerId
      ]
    })
    return rows
  } catch (e) {
    throw e
  }
}

async function findOneWithId(id: number): Promise<ITicketDetail> {
  try {
    const [row] = await db.query({
      sql: `SELECT t.id, t.type, t.totalSession, t.serviceSession, t.sessionPrice, t.coachingPrice,
            ((t.totalSession + t.serviceSession) - (SELECT COUNT(*) FROM ?? r
            WHERE r.ticketId = t.id AND 
            (r.status = 'attendance' OR (r.status = 'cancel' AND r.times = 1)))) as restSession, 
            DATE_FORMAT(t.startedAt, '%Y-%m-%d') as startedAt,
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
      values: [
        Reservation.tableName,
        User.tableName,
        tableTicketRelation,
        Trainer.tableName,
        tableTicketRelation,
        tableName,
        {id}
      ]
    })
    return row
  } catch (e) {
    throw e
  }
}

async function findOneWithUserId(userId: number): Promise<number | null> {
  const currentTime = moment().format('YYYY-MM-DD')
  try {
    const [row] = await db.query({
      sql: `SELECT t.id
            FROM ?? t
            JOIN ?? tr ON tr.userId = ${escape(userId)} AND tr.ticketId = t.id
            WHERE t.expiredAt >= ${escape(currentTime)}
            LIMIT 1`,
      values: [tableName, tableTicketRelation]
    })
    return row
  } catch (e) {
    throw e
  }
}

async function findCounts(
  userId: number
): Promise<{personalCount: number; fitnessCount: number; expiredCount: number}> {
  const currentTime = moment().format('YYYY-MM-DD')
  try {
    const [row] = await db.query({
      sql: `SELECT 
            (SELECT COUNT(t.id) 
            FROM ?? t 
            WHERE t.type = 'personal' AND EXISTS (
             SELECT 1
             FROM ?? tr
             WHERE tr.ticketId = t.id AND tr.userId = ${escape(userId)} AND t.expiredAt >= ${escape(currentTime)}
            )) as personalCount,
            (SELECT COUNT(t.id) 
            FROM ?? t 
            WHERE t.type = 'fitness' AND EXISTS (
             SELECT 1
             FROM ?? tr
             WHERE tr.ticketId = t.id AND tr.userId = ${escape(userId)} AND t.expiredAt >= ${escape(currentTime)}
            )) as fitnessCount,
            (SELECT COUNT(t.id) 
            FROM ?? t 
            JOIN ?? tr ON tr.ticketId = t.id AND tr.userId = ${escape(userId)}
            WHERE t.expiredAt < ${escape(currentTime)}
            ) as expiredCount`,
      values: [tableName, tableTicketRelation, tableName, tableTicketRelation, tableName, tableTicketRelation]
    })
    return row
  } catch (e) {
    throw e
  }
}

async function findExpiredSevenDays(
  franchiseId: number,
  trainerId: number
): Promise<
  [
    {
      userId: 0
      userNickname: 'string'
      trainerNickname: 'string'
      expiredAt: 'string'
    }
  ]
> {
  const currentTime = moment().format('YYYY-MM-DD')
  try {
    const rows = await db.query({
      sql: `SELECT tr.userId as userId, u.nickname as userNickname, t.expiredAt, tra.nickname as trainerNickname
            FROM ?? t
            JOIN ?? tr ON tr.franchiseId = ${escape(franchiseId)} AND t.id = tr.ticketId
            JOIN ?? u ON tr.userId = u.id
            JOIN ?? tra ON tra.id = tr.trainerId
            ${trainerId ? `AND tra.id = ${escape(trainerId)}` : ''}
            WHERE TIMESTAMPDIFF(DAY, ${escape(currentTime)}, t.expiredAt) BETWEEN 0 AND 7
            GROUP BY tr.ticketId ORDER BY t.expiredAt ASC`,
      values: [tableName, tableTicketRelation, User.tableName, Trainer.tableName]
    })
    return rows
  } catch (e) {
    throw e
  }
}

async function findExpiredThreeSessions(
  franchiseId: number,
  trainerId: number
): Promise<
  [
    {
      userId: 0
      userNickname: 'string'
      trainerNickname: 'string'
      restSession: 0
    }
  ]
> {
  const currentTime = moment().format('YYYY-MM-DD')
  try {
    const rows = await db.query({
      sql: `SELECT tr.userId as userId, u.nickname as userNickname, ((t.totalSession + t.serviceSession) - 
            (SELECT COUNT(*) FROM ?? r
            WHERE r.ticketId = t.id AND (r.status = 'attendance' OR (r.status = 'cancel' AND r.times = 1)))) as restSession,
            tra.nickname as trainerNickname
            FROM ?? t
            JOIN ?? tr ON tr.franchiseId = ${escape(franchiseId)} AND t.id = tr.ticketId
            JOIN ?? u ON tr.userId = u.id
            JOIN ?? tra ON tra.id = tr.trainerId
            ${trainerId ? `AND tra.id = ${escape(trainerId)}` : ''}
            WHERE t.type = 'personal' AND t.expiredAt >= ${escape(currentTime)}
            GROUP BY tr.ticketId HAVING restSession <= 3
            ORDER BY restSession ASC`,
      values: [Reservation.tableName, tableName, tableTicketRelation, User.tableName, Trainer.tableName]
    })
    return rows
  } catch (e) {
    throw e
  }
}

async function update(
  options: {
    id: number
    type: 'personal' | 'fitness'
    totalSession: number
    serviceSession: number
    sessionPrice: number
    coachingPrice: number
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
  findAllForUser,
  findAllTicketsForUser,
  findAllTicketsForAdmin,
  findUserTicketCountWithUserId,
  findLastTicketUser,
  findOne,
  findOneWithId,
  findOneWithUserId,
  findBetweenFCTicket,
  findFcTicketWithTrainerIdForAdmin,
  findCounts,
  findExpiredSevenDays,
  findExpiredThreeSessions,
  findActiveTickets,
  update,
  deleteOne,
  deleteRelations
}
