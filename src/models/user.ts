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
  IUserData,
  IUserListForAdmin,
  IUserDataForAdmin,
  IUsersWorkoutSchedulesFindAll,
  IUserWithWorkoutList,
  IUserBodySpecCreate,
  IUserPreSurveyCreate,
  IUserBodySpecsData,
  IUserBodySpecList,
  IUserPreSurveyUpdate
} from '../interfaces/user'
import {Trainer, Ticket, TicketHolding, User, Payment} from './'
import {tableTicketRelation} from './ticket'
import {
  IInflowContentCreate,
  IInflowContentFindAll,
  IInflowContentUpdate,
  IUserInflowContents,
  IUserInflowContentsList
} from '../interfaces/inflowContent'
import {createPasswordHash, passwordIterations} from '../libs/code'
import {IUserCount} from '../interfaces/payroll'

moment.tz.setDefault('Asia/Seoul')

const tableName = 'Users'
const tableFranchiseUser = 'Franchises-Users'
const tableFranchise = 'Franchises'
const tableInflowContent = 'InflowContents'
const tableUserBodySpec = 'UserBodySpecs'
const tableUserPreSurvey = 'UserPreSurveys'
const tableUserNexWeekSurvey = 'UserNextWeekSurvey'

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

async function createInflowContent(options: IInflowContentCreate, connection: PoolConnection): Promise<number> {
  try {
    const {insertId} = await db.query({
      connection,
      sql: `INSERT INTO ?? SET ?`,
      values: [tableInflowContent, options]
    })
    return insertId
  } catch (e) {
    throw e
  }
}

async function createNextWeekSurvey(
  options: {userId: number; mondayDate: String},
  connection: PoolConnection
): Promise<number> {
  try {
    const {insertId} = await db.query({
      connection,
      sql: `INSERT INTO ?? SET ?`,
      values: [tableUserNexWeekSurvey, options]
    })
    return insertId
  } catch (e) {
    throw e
  }
}

async function createBodySpec(options: IUserBodySpecCreate, connection: PoolConnection): Promise<number> {
  try {
    const {insertId} = await db.query({
      connection,
      sql: `INSERT INTO ?? SET ?`,
      values: [tableUserBodySpec, options]
    })
    return insertId
  } catch (e) {
    throw e
  }
}

async function createPreSurvey(options: IUserPreSurveyCreate, connection: PoolConnection): Promise<number> {
  try {
    const {insertId} = await db.query({
      connection,
      sql: `INSERT INTO ?? SET ?`,
      values: [tableUserPreSurvey, options]
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

async function findAllForTrainer(options: IUserFindAll): Promise<IUserListForTrainer> {
  try {
    const {franchiseId, start, perPage, search, status, trainerId} = options
    const where = []

    if (search) where.push(`(t.nickname like '%${search}%' OR t.phone like '%${search}%')`)
    const currentTime = moment().format('YYYY-MM-DD')
    const rows: IUserData[] = await db.query({
      sql: `SELECT t.id, t.nickname, t.phone, t.createdAt,
            (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', tra.id, 'nickname', tra.nickname)) FROM ?? ti
            JOIN ?? tr ON tr.userId = t.id AND tr.ticketId = ti.id
            JOIN ?? tra ON tra.id = tr.trainerId
            WHERE ti.expiredAt >= '${currentTime}'
            LIMIT 1
            ) as trainers,
            (SELECT IF(EXISTS(SELECT * FROM ?? th
              JOIN ?? tr ON tr.userId = t.id
              JOIN ?? ti ON tr.ticketId = ti.id AND th.ticketId = ti.id
              WHERE th.startAt <= '${currentTime}' AND th.endAt >= '${currentTime}'), TRUE, FALSE) 
              ) as isHolding
            FROM ?? t
            JOIN ?? fu ON fu.userId = t.id AND fu.franchiseId = ?
            ${
              trainerId
                ? `JOIN TicketsRelations tr ON tr.trainerId = ${escape(trainerId)} AND tr.userId = t.id
                   JOIN Tickets ti ON ti.id = tr.ticketId AND ti.expiredAt >= '${currentTime}'`
                : ''
            }
            ${where.length ? `WHERE ${where.join(' AND ')}` : ''} 
            GROUP BY t.id
            ${status === 'active' ? `HAVING trainers IS NOT NULL AND isHolding IS false` : ``}
            ${status === 'banned' ? `HAVING trainers IS NULL` : ``}
            ${status === 'hold' ? `HAVING isHolding IS true` : ``}
            ORDER BY t.createdAt DESC
            LIMIT ${start}, ${perPage}`,
      values: [
        Ticket.tableName,
        Ticket.tableTicketRelation,
        Trainer.tableName,
        TicketHolding.tableName,
        Ticket.tableTicketRelation,
        Ticket.tableName,
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
              WHERE ti.expiredAt >= '${currentTime}'
              LIMIT 1
              ) as trainers,
              (SELECT IF(EXISTS(SELECT * FROM ?? th
                JOIN ?? tr ON tr.userId = t.id
                JOIN ?? ti ON tr.ticketId = ti.id AND th.ticketId = ti.id
                WHERE th.startAt <= '${currentTime}' AND th.endAt >= '${currentTime}'), TRUE, FALSE) 
                ) as isHolding
              FROM ?? t
              JOIN ?? fu ON fu.userId = t.id AND fu.franchiseId = ?
              ${
                trainerId
                  ? `JOIN TicketsRelations tr ON tr.trainerId = ${escape(trainerId)} AND tr.userId = t.id
                   JOIN Tickets ti ON ti.id = tr.ticketId AND ti.expiredAt >= '${currentTime}'`
                  : ''
              }
              ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
              GROUP BY t.id
              ${status === 'active' ? `HAVING trainers IS NOT NULL AND isHolding IS false` : ``}
              ${status === 'banned' ? `HAVING trainers IS NULL` : ``}
              ${status === 'hold' ? `HAVING isHolding IS true` : ``}
            ) t
            `,
      values: [
        Ticket.tableName,
        Ticket.tableTicketRelation,
        Trainer.tableName,
        TicketHolding.tableName,
        Ticket.tableTicketRelation,
        Ticket.tableName,
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

async function findUserInflowForTrainer(options: IInflowContentFindAll): Promise<IUserInflowContentsList> {
  try {
    const {franchiseId, trainerId} = options

    const currentTime = moment().format('YYYY-MM-DD')
    const rows: IUserInflowContents[] = await db.query({
      sql: `SELECT t.id, t.nickname, t.phone, t.gender, t.birth, t.createdAt, t.inflowComplete,
            (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', tra.id, 'nickname', tra.nickname)) FROM ?? ti
            JOIN ?? tr ON tr.userId = t.id AND tr.ticketId = ti.id
            JOIN ?? tra ON tra.id = tr.trainerId
            WHERE ti.expiredAt >= '${currentTime}'
            LIMIT 1
            ) as trainers,
            (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', ic.id, 'name', ic.name, 'complete', ic.complete, 'memo', ic.memo)) 
            FROM ?? us 
            JOIN ?? ic ON ic.userId = us.id
            WHERE us.id = t.id
            ) as inflowContents
            FROM ?? t
            JOIN ?? fu ON fu.userId = t.id AND fu.franchiseId = ?
            ${
              trainerId
                ? `JOIN TicketsRelations tr ON tr.trainerId = ${escape(trainerId)} AND tr.userId = t.id
                   JOIN Tickets ti ON ti.id = tr.ticketId AND ti.expiredAt >= '${currentTime}'`
                : ''
            }
            WHERE t.inflowComplete is false
            GROUP BY t.id
            ORDER BY t.createdAt DESC
            `,
      values: [
        Ticket.tableName,
        Ticket.tableTicketRelation,
        Trainer.tableName,
        User.tableName,
        tableInflowContent,
        tableName,
        tableFranchiseUser,
        franchiseId
      ]
    })

    return rows
  } catch (e) {
    throw e
  }
}

async function findUsersWorkoutSchedules(options: IUsersWorkoutSchedulesFindAll): Promise<IUserWithWorkoutList> {
  try {
    const {franchiseId, trainerId} = options

    const currentTime = moment().format('YYYY-MM-DD')
    const rows = await db.query({
      sql: `SELECT t.id, t.nickname, t.phone, t.gender, t.birth, t.createdAt
            FROM ?? t
            JOIN ?? fu ON fu.userId = t.id AND fu.franchiseId = ?
            ${
              trainerId
                ? `JOIN TicketsRelations tr ON tr.trainerId = ${escape(trainerId)} AND tr.userId = t.id
                   JOIN Tickets ti ON ti.id = tr.ticketId AND ti.expiredAt >= '${currentTime}'`
                : ''
            }
            GROUP BY t.id
            ORDER BY t.createdAt DESC
            `,
      values: [tableName, tableFranchiseUser, franchiseId]
    })
    return rows
  } catch (e) {
    throw e
  }
}

async function findAllForAdmin(options: IUserFindAll): Promise<IUserListForAdmin> {
  try {
    const {franchiseId, start, perPage, search, status} = options
    const where = []

    if (search) where.push(`(u.nickname like '%${search}%' OR u.phone like '%${search}%')`)
    const currentTime = moment().format('YYYY-MM-DD')
    const rows: IUserDataForAdmin[] = await db.query({
      sql: `SELECT u.id, u.email, u.nickname, u.phone, u.createdAt,
            (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', fu.franchiseId, 'name', f.name)) FROM ?? f
            JOIN ?? fu ON u.id = fu.userId AND f.id = fu.franchiseId) as franchises,
            (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', tra.id, 'nickname', tra.nickname)) FROM ?? ti
              JOIN ?? tr ON tr.userId = u.id AND tr.ticketId = ti.id
              JOIN ?? tra ON tra.id = tr.trainerId
              WHERE ti.expiredAt > '${currentTime}'
              LIMIT 1
              ) as trainers
            FROM ?? u
            JOIN ?? fu ON fu.userId = u.id ${franchiseId ? `AND fu.franchiseId = ${escape(franchiseId)}` : ''}
            ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
            GROUP BY u.id
            ${status !== undefined ? `HAVING trainers IS ${status ? 'NOT' : ''} NULL` : ``}
            ORDER BY u.createdAt DESC
            LIMIT ${start}, ${perPage}`,
      values: [
        tableFranchise,
        tableFranchiseUser,
        Ticket.tableName,
        Ticket.tableTicketRelation,
        Trainer.tableName,
        tableName,
        tableFranchiseUser
      ]
    })
    const [rowTotal] = await db.query({
      sql: `SELECT COUNT(1) as total FROM (
            SELECT u.id
            FROM ?? u
            JOIN ?? fu ON fu.userId = u.id ${franchiseId ? `AND fu.franchiseId = ${escape(franchiseId)}` : ''}
            ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
            GROUP BY u.id
            ${status !== undefined ? `HAVING trainers IS ${status ? 'NOT' : ''} NULL` : ``}
            ) u
            `,
      values: [tableName, tableFranchiseUser]
    })
    return {data: rows, total: rowTotal ? rowTotal.total : 0}
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

async function findUserBodySpecWithId(options: {userId: number}): Promise<{height: number; weight: number}> {
  try {
    const {userId} = options

    const [row] = await db.query({
      sql: `SELECT t.height, t.weight
            FROM ?? t
            WHERE ?
            ORDER BY t.createdAt DESC
            LIMIT 1
            `,
      values: [tableUserBodySpec, {userId}]
    })
    return row
  } catch (e) {
    throw e
  }
}

async function findUserBodySpecWithIdForTrainer(options: {
  id: number
  start: number
  perPage: number
}): Promise<IUserBodySpecList> {
  const {id, start, perPage} = options
  try {
    const rows: IUserBodySpecsData[] = await db.query({
      sql: `SELECT t.id as bodySpecId, t.height, t.weight, t.createdAt
            FROM ?? t
            WHERE t.userId = ?
            GROUP BY t.id
            ORDER BY t.createdAt DESC
            LIMIT ${start}, ${perPage}
            `,
      values: [tableUserBodySpec, id]
    })
    const [rowTotal] = await db.query({
      sql: `SELECT COUNT(1) as total FROM (
            SELECT t.id as bodySpecId, t.height, t.weight, t.createdAt
            FROM ?? t
            WHERE t.userId = ?
            GROUP BY t.id
            ) t
            `,
      values: [tableUserBodySpec, id]
    })
    return {data: rows, total: rowTotal ? rowTotal.total : 0}
  } catch (e) {
    throw e
  }
}

async function findNextWeekSurvey(mondayDate: string, userId: number): Promise<number> {
  try {
    const [row] = await db.query({
      sql: `SELECT COUNT(*) as count
            FROM (
            SELECT userId
            FROM ?? 
            WHERE mondayDate = ${escape(mondayDate)} AND ?
            ) t`,
      values: [tableUserNexWeekSurvey, {userId}]
    })
    return row ? row.count : 0
  } catch (e) {
    throw e
  }
}

async function findPreUserCount(franchiseId: number, trainerId: number): Promise<number> {
  try {
    const currentTime = moment().format('YYYY-MM-DD')
    const [row] = await db.query({
      sql: `SELECT COUNT(t.id) as count
            FROM (
            SELECT u.id
            FROM ?? u
            JOIN ?? fu ON fu.userId = u.id AND fu.franchiseId = ?
            JOIN ?? tr ON tr.userId = u.id AND tr.franchiseId = ? AND tr.trainerId = ${escape(trainerId)}
            JOIN ?? ti ON tr.ticketId = ti.id AND ti.type = 'fitness' AND ti.month = 0 AND ti.expiredAt >= '${currentTime}'
            GROUP BY u.id) t`,
      values: [tableName, tableFranchiseUser, franchiseId, Ticket.tableTicketRelation, franchiseId, Ticket.tableName]
    })
    return row ? row.count : 0
  } catch (e) {
    throw e
  }
}

async function findPaidUserCount(franchiseId: number, trainerId: number): Promise<number> {
  try {
    const currentTime = moment().format('YYYY-MM-DD')
    const [row] = await db.query({
      sql: `SELECT COUNT(t.id) as count
            FROM (
            SELECT u.id
            FROM ?? u
            JOIN ?? fu ON fu.userId = u.id AND fu.franchiseId = ?
            JOIN ?? tr ON tr.userId = u.id AND tr.franchiseId = ? AND tr.trainerId = ${escape(trainerId)}
            JOIN ?? ti ON tr.ticketId = ti.id AND ti.type = 'fitness' AND ti.month != 0 
            AND ti.month IS NOT NULL AND ti.expiredAt >= '${currentTime}'
            GROUP BY u.id) t`,
      values: [tableName, tableFranchiseUser, franchiseId, Ticket.tableTicketRelation, franchiseId, Ticket.tableName]
    })
    return row ? row.count : 0
  } catch (e) {
    throw e
  }
}

async function findThisMonthPreUserCount(options: {
  trainerId: number
  franchiseId: number
  startDate: Date
}): Promise<number> {
  try {
    const {trainerId, franchiseId, startDate} = options
    const currentTime = moment().format('YYYY-MM-DD')

    const [row] = await db.query({
      sql: `SELECT COUNT(t.id) as count
            FROM (SELECT u.id FROM ?? u
            JOIN ?? tr ON tr.userId = u.id AND tr.franchiseId = ${escape(franchiseId)} 
            AND tr.trainerId = ${escape(trainerId)}
            JOIN ?? ti ON ti.id = tr.ticketId AND ti.type = 'fitness' AND ti.month = 0 AND ti.expiredAt >= '${currentTime}'
            GROUP BY u.id) t`,
      values: [tableName, Ticket.tableTicketRelation, Ticket.tableName]
    })
    return row ? row.count : 0
  } catch (e) {
    throw e
  }
}

async function findThisMonthPaidUserCount(options: {
  trainerId: number
  franchiseId: number
  startDate: Date
}): Promise<number> {
  try {
    const {trainerId, franchiseId, startDate} = options
    const thisMonthStart = moment(startDate).startOf('month').format('YYYY-MM-DD')
    const thisMonthEnd = moment(startDate).endOf('month').format('YYYY-MM-DD')

    const [row] = await db.query({
      sql: `SELECT COUNT(t.id) as count
            FROM (SELECT u.id FROM ?? u
            JOIN ?? tr ON tr.userId = u.id AND tr.franchiseId = ${escape(franchiseId)}
            AND tr.trainerId = ${escape(trainerId)}
            JOIN ?? ti ON ti.id = tr.ticketId AND ti.type = 'fitness'
            JOIN ?? p ON ti.id = p.ticketId 
            AND p.createdAt BETWEEN ${escape(thisMonthStart)} AND ${escape(thisMonthEnd)}
            GROUP BY u.id) t
            `,
      values: [tableName, Ticket.tableTicketRelation, Ticket.tableName, Payment.tableName]
    })
    return row ? row.count : 0
  } catch (e) {
    throw e
  }
}

async function findThisMonthLeaveUserCount(options: {
  trainerId: number
  franchiseId: number
  startDate: Date
}): Promise<number> {
  try {
    const {trainerId, franchiseId, startDate} = options
    const currentTime = moment().format('YYYY-MM-DD')
    const thisMonthStart = moment(startDate).startOf('month').format('YYYY-MM-DD')

    const [row] = await db.query({
      sql: `SELECT COUNT(t.id) as count
            FROM (SELECT u.id FROM ?? u
            JOIN ?? tr ON tr.userId = u.id AND tr.franchiseId = ${escape(franchiseId)}
            AND tr.trainerId = ${escape(trainerId)}
            JOIN ?? ti ON ti.id = tr.ticketId  AND ti.type = 'fitness' AND ti.expiredAt 
            BETWEEN ${escape(thisMonthStart)} AND ${escape(currentTime)}
            AND NOT EXISTS (
              SELECT * FROM ?? ti2 
              JOIN ?? tr2 ON tr2.ticketId = ti2.id AND tr2.userId = u.id
              WHERE ti2.startedAt > ti.expiredAt AND ti2.type = 'fitness'
              )
            GROUP BY u.id) t
            `,
      values: [tableName, Ticket.tableTicketRelation, Ticket.tableName, Ticket.tableName, Ticket.tableTicketRelation]
    })
    return row ? row.count : 0
  } catch (e) {
    throw e
  }
}

async function findExpiredSevenDaysCount(franchiseId: number, trainerId: number): Promise<number> {
  try {
    const currentTime = moment().format('YYYY-MM-DD')
    const [row] = await db.query({
      sql: `SELECT COUNT(t.id) as count
            FROM (
            SELECT u.id
            FROM ?? u
            JOIN ?? fu ON fu.userId = u.id AND fu.franchiseId = ?
            JOIN ?? tr ON tr.userId = u.id AND tr.franchiseId = ? AND tr.trainerId = ${escape(trainerId)}
            JOIN ?? ti ON tr.ticketId = ti.id AND ti.type = 'fitness' 
            AND TIMESTAMPDIFF(DAY, ${escape(currentTime)}, ti.expiredAt) BETWEEN 0 AND 7
            GROUP BY u.id) t`,
      values: [tableName, tableFranchiseUser, franchiseId, Ticket.tableTicketRelation, franchiseId, Ticket.tableName]
    })
    return row ? row.count : 0
  } catch (e) {
    throw e
  }
}

async function findActivePersonalUsers(
  franchiseId: number,
  startDate: string,
  endDate: string,
  trainerId: number
): Promise<number> {
  try {
    const [row] = await db.query({
      sql: `SELECT COUNT(t.id) as count
            FROM (
            SELECT u.id
            FROM ?? u
            JOIN ?? fu ON fu.userId = u.id AND fu.franchiseId = ?
            JOIN ?? tr ON tr.userId = u.id AND tr.franchiseId = ?
            ${trainerId ? `AND tr.trainerId = ${escape(trainerId)}` : ''}
            JOIN ?? ti ON ti.id = tr.ticketId AND ti.expiredAt >= ${escape(startDate)} 
            AND ti.startedAt < ${escape(endDate)} AND ti.type = 'personal'
            GROUP BY u.id) t`,
      values: [tableName, tableFranchiseUser, franchiseId, Ticket.tableTicketRelation, franchiseId, Ticket.tableName]
    })
    return row ? row.count : 0
  } catch (e) {
    throw e
  }
}

async function findActiveFitnessUsers(
  franchiseId: number,
  startDate: string,
  endDate: string,
  trainerId: number
): Promise<number> {
  try {
    const [row] = await db.query({
      sql: `SELECT COUNT(t.id) as count
            FROM (
            SELECT u.id
            FROM ?? u
            JOIN ?? fu ON fu.userId = u.id AND fu.franchiseId = ?
            JOIN ?? tr ON tr.userId = u.id AND tr.franchiseId = ?
            ${trainerId ? `AND tr.trainerId = ${escape(trainerId)}` : ''}
            JOIN ?? ti ON ti.id = tr.ticketId AND ti.expiredAt >= ${escape(startDate)}
            AND ti.startedAt < ${escape(endDate)} AND ti.type = 'fitness'
            GROUP BY u.id) t`,
      values: [tableName, tableFranchiseUser, franchiseId, Ticket.tableTicketRelation, franchiseId, Ticket.tableName]
    })
    return row ? row.count : 0
  } catch (e) {
    throw e
  }
}

async function findActivePersonalUsersForAdminWithTrainerId(
  trainerId: number,
  startDate: string,
  endDate: string
): Promise<number> {
  try {
    const [row] = await db.query({
      sql: `SELECT COUNT(tb.id) as count
            FROM (
            SELECT u.id
            FROM ?? u
            JOIN ?? tr ON tr.userId = u.id AND tr.trainerId = ?
            JOIN ?? ti ON ti.id = tr.ticketId AND ti.expiredAt >= ${escape(startDate)} 
            AND ti.startedAt < ${escape(endDate)} AND ti.type = 'personal'
            GROUP BY u.id) tb`,
      values: [tableName, tableTicketRelation, trainerId, Ticket.tableName]
    })
    return row ? row.count : 0
  } catch (e) {
    throw e
  }
}

async function findActiveFitnessUsersForAdminWithTrainerId(
  trainerId: number,
  startDate: string,
  endDate: string
): Promise<number> {
  try {
    const [row] = await db.query({
      sql: `SELECT COUNT(tb.id) as count
            FROM (
            SELECT u.id
            FROM ?? u
            JOIN ?? tr ON tr.userId = u.id AND tr.trainerId = ?
            JOIN ?? ti ON ti.id = tr.ticketId AND ti.expiredAt >= ${escape(startDate)} 
            AND ti.startedAt < ${escape(endDate)} AND ti.type = 'fitness'
            GROUP BY u.id) tb`,
      values: [tableName, tableTicketRelation, trainerId, Ticket.tableName]
    })
    return row ? row.count : 0
  } catch (e) {
    throw e
  }
}

async function findPreSurveyWithId(
  id: number
): Promise<{
  experience: number
  purpose: number
  achievement: number[]
  obstacle: number[]
  place: string
  preferDays: number[]
}> {
  try {
    const [row] = await db.query({
      sql: `SELECT up.experience, up.purpose, up.obstacle, up.place, up.preferDays, up.achievement
            FROM ?? up
            WHERE up.userId = ?`,
      values: [tableUserPreSurvey, id]
    })
    return row
  } catch (e) {
    throw e
  }
}

async function findOneWithId(id: number): Promise<IUser> {
  try {
    const currentTime = moment().format('YYYY-MM-DD')
    const [row] = await db.query({
      sql: `SELECT t.id, t.nickname, t.email, t.phone, DATE_FORMAT(t.birth, '%Y-%m-%d') as birth,
            t.gender, t.memo, t.createdAt,
            (SELECT IF(EXISTS(SELECT * FROM ?? th
              JOIN ?? tr ON tr.userId = t.id
              JOIN ?? ti ON tr.ticketId = ti.id AND th.ticketId = ti.id
              WHERE th.startAt <= '${currentTime}' AND th.endAt >= '${currentTime}'), TRUE, FALSE) 
              ) as isHolding
            FROM ?? t
            WHERE ?`,
      values: [TicketHolding.tableName, Ticket.tableTicketRelation, Ticket.tableName, tableName, {id}]
    })
    return row
  } catch (e) {
    throw e
  }
}

async function updateOne(options: IUserUpdate, connection?: PoolConnection): Promise<void> {
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

async function updatePasswordForUser(
  options: {password: string; id: number},
  connection?: PoolConnection
): Promise<string> {
  try {
    const {password, id} = options
    const passwordHash = await createPasswordHash(password, passwordIterations.mobile)
    await db.query(
      {
        connection,
        sql: `UPDATE ?? SET ? WHERE ?`,
        values: [
          this.tableName,
          {
            password: JSON.stringify({
              password: passwordHash.password,
              salt: passwordHash.salt
            })
          },
          {id}
        ]
      },
      'MASTER'
    )
    return passwordHash.salt
  } catch (e) {
    throw e
  }
}

async function updateOnePreSurvey(options: IUserPreSurveyUpdate, connection?: PoolConnection): Promise<void> {
  const {userId, ...data} = options
  try {
    await db.query({
      connection,
      sql: `UPDATE ?? SET ? WHERE ? `,
      values: [tableUserPreSurvey, data, {userId}]
    })
  } catch (e) {
    throw e
  }
}

async function updateOneInflowContent(options: IInflowContentUpdate, connection?: PoolConnection): Promise<void> {
  const {id, ...data} = options
  try {
    await db.query({
      connection,
      sql: `UPDATE ?? SET ? WHERE ? `,
      values: [tableInflowContent, data, {id}]
    })
  } catch (e) {
    throw e
  }
}

async function updateBadgeCount(id: number, connection?: PoolConnection): Promise<void> {
  try {
    await db.query({
      connection,
      sql: `UPDATE ?? SET badgeCount = badgeCount + 1 WHERE ? `,
      values: [tableName, {id}]
    })
  } catch (e) {
    throw e
  }
}

async function updateInflowContentComplete(id: number, connection?: PoolConnection): Promise<void> {
  try {
    await db.query({
      connection,
      sql: `UPDATE ?? SET inflowComplete = true WHERE ? `,
      values: [tableName, {id}]
    })
  } catch (e) {
    throw e
  }
}

async function deleteOneInflowContent(options: {id: number}, connection?: PoolConnection): Promise<{id: number}> {
  const {id} = options
  try {
    const {affectedRows} = await db.query({
      connection,
      sql: `DELETE FROM ?? WHERE ? `,
      values: [tableInflowContent, {id}]
    })
    if (affectedRows > 0) return options
  } catch (e) {
    throw e
  }
}

export {
  tableName,
  create,
  createInflowContent,
  createNextWeekSurvey,
  createBodySpec,
  createPreSurvey,
  createRelationsFranchises,
  findAllForTrainer,
  findUserInflowForTrainer,
  findUsersWorkoutSchedules,
  findAllForAdmin,
  findOne,
  findNextWeekSurvey,
  updatePasswordForUser,
  findOneWithId,
  findUserBodySpecWithId,
  findUserBodySpecWithIdForTrainer,
  findActivePersonalUsers,
  findActiveFitnessUsers,
  findPreSurveyWithId,
  findPreUserCount,
  findPaidUserCount,
  findThisMonthPreUserCount,
  findThisMonthPaidUserCount,
  findThisMonthLeaveUserCount,
  findExpiredSevenDaysCount,
  updateOne,
  updateOneInflowContent,
  updateOnePreSurvey,
  updateBadgeCount,
  updateInflowContentComplete,
  findActivePersonalUsersForAdminWithTrainerId,
  findActiveFitnessUsersForAdminWithTrainerId,
  deleteOneInflowContent
}
