import moment from 'moment-timezone'
import {escape, PoolConnection} from 'mysql'
import {db} from '../loaders'
import {
  ITrainer,
  ITrainerDataForAdmin,
  ITrainerDetail,
  ITrainerDetailForUser,
  ITrainerFindAllForAdmin,
  ITrainerFindOne,
  ITrainerFindOneWageInfo,
  ITrainerList,
  ITrainerListForAdmin,
  ITrainerListForUser,
  ITrainerUpdate,
  ITrainerMeetingBoundary,
  ITrainerFindExtend
} from '../interfaces/trainer'
import {IWageInfo} from '../interfaces/payroll'
import {Ticket, User} from './'

moment.tz.setDefault('Asia/Seoul')

const tableName = 'Trainers'
const tableFranchiseTrainer = 'Franchises-Trainers'
const tableFranchise = 'Franchises'
const tableTrainerInfo = 'TrainerInfo'

async function create(
  options: {password: string; nickname: string; email: string},
  connection: PoolConnection
): Promise<void> {
  try {
    await db.query({
      connection,
      sql: `INSERT INTO ?? SET ?`,
      values: [tableName, options]
    })
  } catch (e) {
    throw e
  }
}

async function findAll(franchiseId: number): Promise<[ITrainerList]> {
  try {
    return await db.query({
      sql: `SELECT t.id, t.nickname, t.profileImage
            FROM ?? t
            JOIN ?? ft ON ft.trainerId = t.id AND ft.franchiseId = ?`,
      values: [tableName, tableFranchiseTrainer, franchiseId]
    })
  } catch (e) {
    throw e
  }
}

async function findAllForAdmin(options: ITrainerFindAllForAdmin): Promise<ITrainerListForAdmin> {
  try {
    const {franchiseId, start, perPage, search} = options
    const where = []
    const currentTime = moment().format('YYYY-MM-DD')
    if (search) where.push(`(t.nickname like '%${search}%')`)
    const rows: ITrainerDataForAdmin[] = await db.query({
      sql: `SELECT t.id, t.nickname, t.email, t.createdAt,
            (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', f.id, 'name', f.name)) FROM ?? f
            JOIN ?? ft ON ft.trainerId = t.id AND ft.franchiseId = f.id) as franchises,
            COUNT(u.id) as userAvailableCount
            FROM ?? t
            JOIN ?? tr ON tr.trainerId = t.id
            JOIN ?? u ON tr.userId = u.id
            JOIN ?? ti ON ti.id = tr.ticketId AND ti.expiredAt >= '${currentTime}'
            JOIN ?? ft ON ft.trainerId = t.id ${franchiseId ? `AND ft.franchiseId = ${escape(franchiseId)}` : ''}
            ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
            GROUP BY t.id
            ORDER BY t.createdAt DESC
            LIMIT ${start}, ${perPage}`,
      values: [
        tableFranchise,
        tableFranchiseTrainer,
        tableName,
        Ticket.tableTicketRelation,
        User.tableName,
        Ticket.tableName,
        tableFranchiseTrainer
      ]
    })
    const [rowTotal] = await db.query({
      sql: `SELECT COUNT(1) as total FROM (
            SELECT t.id
            FROM ?? t
            JOIN ?? ft ON ft.trainerId = t.id ${franchiseId ? `AND ft.franchiseId = ${escape(franchiseId)}` : ''}
            ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
            GROUP BY t.id
            ORDER BY t.createdAt DESC
            ) t`,
      values: [tableName, tableFranchiseTrainer]
    })
    return {data: rows, total: rowTotal ? rowTotal.total : 0}
  } catch (e) {
    throw e
  }
}

async function findAllForUserSelect(): Promise<[ITrainerListForUser]> {
  try {
    return await db.query({
      sql: `SELECT t.id, t.nickname, t.profileImage, ti.largeProfileImage, ti.shortIntro
            FROM ?? t
            JOIN ?? ti ON ti.trainerId = t.id
            WHERE t.mainVisible = true
            ORDER BY t.id ASC`,
      values: [tableName, tableTrainerInfo]
    })
  } catch (e) {
    throw e
  }
}

async function findExtendTrainer(
  options: ITrainerFindExtend
): Promise<{
  data: ITrainerListForUser[]
  total: number
}> {
  try {
    const {start, perPage, search} = options
    const where = []
    const currentTime = moment().format('YYYY-MM-DD')
    where.push('t.mainVisible = false')
    if (search) where.push(`(t.nickname like '%${search}%')`)
    const rows = await db.query({
      sql: `SELECT t.id, t.nickname, t.profileImage, ti.largeProfileImage, ti.shortIntro
            FROM ?? t
            JOIN ?? ti ON ti.trainerId = t.id
            ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
            GROUP BY t.id
            LIMIT ${start}, ${perPage}`,
      values: [tableName, tableTrainerInfo]
    })
    const [rowTotal] = await db.query({
      sql: `SELECT COUNT(1) as total FROM (
            SELECT t.id
            FROM ?? t
            ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
            GROUP BY t.id
            ) t`,
      values: [tableName]
    })
    return {data: rows, total: rowTotal ? rowTotal.total : 0}
  } catch (e) {
    throw e
  }
}

async function findActiveTrainersWithUserId(
  userId: number
): Promise<[{id: number; nickname: string; profileImage: string}]> {
  try {
    const currentTime = moment().format('YYYY-MM-DD')
    return await db.query({
      sql: `SELECT t.id, t.nickname, t.profileImage, tin.workStartTime, tin.workEndTime
            FROM ?? t
            JOIN ?? tr ON tr.trainerId = t.id AND tr.userId = ?
            JOIN ?? ti ON ti.id = tr.ticketId AND ti.expiredAt >= ${escape(currentTime)}
            JOIN ?? tin ON tin.trainerId = t.id
            GROUP BY t.id`,
      values: [tableName, Ticket.tableTicketRelation, userId, Ticket.tableName, tableTrainerInfo]
    })
  } catch (e) {
    throw e
  }
}

async function findLastTrainersWithUserId(options: {
  userId: number
  ticketId: number
}): Promise<[{id: number; nickname: string; profileImage: string}]> {
  try {
    const {userId, ticketId} = options

    const currentTime = moment().format('YYYY-MM-DD')
    return await db.query({
      sql: `SELECT t.id, t.nickname, t.profileImage, tin.workStartTime, tin.workEndTime
            FROM ?? t
            JOIN ?? tr ON tr.trainerId = t.id AND tr.userId = ?
            JOIN ?? ti ON ti.id = ?
            JOIN ?? tin ON tin.trainerId = t.id
            GROUP BY t.id
            `,
      values: [tableName, Ticket.tableTicketRelation, userId, Ticket.tableName, ticketId, tableTrainerInfo]
    })
  } catch (e) {
    throw e
  }
}

async function findOne(options: ITrainerFindOne): Promise<ITrainer> {
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

async function findOneTrainerThread(
  options: ITrainerFindOne
): Promise<{welcomeThreadContent: string; welcomeThreadGallery?: string}> {
  const {id} = options

  try {
    const [row] = await db.query({
      sql: `SELECT t.*
            FROM ?? t
            WHERE t.trainerId = ${escape(id)}`,
      values: [tableTrainerInfo]
    })
    return row
  } catch (e) {
    throw e
  }
}

async function findOneWithIdForAdmin(id: number): Promise<ITrainerDetail> {
  try {
    const [row] = await db.query({
      sql: `SELECT t.id, t.nickname, t.email, t.createdAt, t.profileImage
            FROM ?? t WHERE ?`,
      values: [tableName, {id}]
    })
    return row
  } catch (e) {
    throw e
  }
}

async function findOneWithIdForUser(id: number): Promise<ITrainerDetailForUser> {
  try {
    const [row] = await db.query({
      sql: `SELECT t.id, t.nickname, t.email, t.createdAt, t.profileImage,
            ti.largeProfileImage, ti.shortIntro, ti.intro, ti.instagram, ti.qualification, ti.speciality, ti.coachingStyle, ti.favorite,
            (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', f.id, 'name', f.name)) FROM ?? f
            JOIN ?? ft ON ft.trainerId = t.id AND ft.franchiseId = f.id) as franchises
            FROM ?? t 
            JOIN ?? ti ON ti.trainerId = t.id
            WHERE ?`,
      values: [tableFranchise, tableFranchiseTrainer, tableName, tableTrainerInfo, {id}]
    })
    return row
  } catch (e) {
    throw e
  }
}

async function findDeviceList(): Promise<[{deviceId: string}]> {
  try {
    const row = await db.query({
      sql: `SELECT deviceId
            FROM ?? `,
      values: [tableName]
    })
    return row
  } catch (e) {
    throw e
  }
}

async function findTrainerWageInfo(options: ITrainerFindOneWageInfo): Promise<IWageInfo> {
  try {
    const {trainerId, franchiseId} = options
    const [row] = await db.query({
      sql: `SELECT t.baseWage, t.ptPercentage, t.fcPercentage
            FROM ?? t
            WHERE ? AND ?`,
      values: [tableFranchiseTrainer, {trainerId}, {franchiseId}]
    })
    return row
  } catch (e) {
    throw e
  }
}

async function findTrainersMeetingBoundaryWithId(trainerId: number): Promise<ITrainerMeetingBoundary> {
  try {
    const [row] = await db.query({
      sql: `SELECT ti.trainerId, ti.workStartTime, ti.workEndTime
            FROM ?? ti 
            WHERE ?`,
      values: [tableTrainerInfo, {trainerId}]
    })
    return row
  } catch (e) {
    throw e
  }
}

async function updateOne(options: ITrainerUpdate): Promise<void> {
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

async function updateTrainerMeetingBoundary(options: ITrainerMeetingBoundary): Promise<void> {
  const {trainerId, ...data} = options
  try {
    await db.query({
      sql: `UPDATE ?? SET ? WHERE ? `,
      values: [tableTrainerInfo, data, {trainerId}]
    })
  } catch (e) {
    throw e
  }
}

export {
  tableName,
  tableFranchiseTrainer,
  tableTrainerInfo,
  create,
  findOne,
  findOneTrainerThread,
  findTrainerWageInfo,
  findAll,
  findActiveTrainersWithUserId,
  findLastTrainersWithUserId,
  findAllForAdmin,
  findAllForUserSelect,
  findExtendTrainer,
  findOneWithIdForAdmin,
  findOneWithIdForUser,
  findDeviceList,
  findTrainersMeetingBoundaryWithId,
  updateOne,
  updateTrainerMeetingBoundary
}
