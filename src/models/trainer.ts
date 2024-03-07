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
  ITrainerFindExtend,
  ICreateTrainerInfoForAdmin,
  ITrainerInfoUpdate
} from '../interfaces/trainer'
import {IWageInfo} from '../interfaces/payroll'
import {Ticket, User} from './'
import {IFranchiseTrainers} from '../interfaces/franchise'

moment.tz.setDefault('Asia/Seoul')

const tableName = 'Trainers'
const tableFranchiseTrainer = 'Franchises-Trainers'
const tableFranchise = 'Franchises'
const tableTrainerInfo = 'TrainerInfo'

async function create(
  options: {
    password: string
    nickname: string
    email: string
    profileImage: string
    mainVisible: boolean
    role: 'master' | 'external'
    status: 'able' | 'disable'
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

async function createTrainerInfo(options: ICreateTrainerInfoForAdmin, connection: PoolConnection): Promise<void> {
  try {
    return await db.query({
      connection,
      sql: `INSERT INTO ?? SET ?`,
      values: [tableTrainerInfo, options]
    })
  } catch (e) {
    throw e
  }
}

async function createRelationsFranchises(
  options: {
    trainerId: number
    franchiseId: number
    fcPercentage: number
    ptPercentage: number
    baseWage: number
  },
  connection: PoolConnection
): Promise<void> {
  try {
    await db.query({
      connection,
      sql: `INSERT INTO ?? SET ?`,
      values: [tableFranchiseTrainer, options]
    })
  } catch (e) {
    throw e
  }
}

async function findAll(franchiseId: number): Promise<[ITrainerList]> {
  try {
    return await db.query({
      sql: `SELECT t.id, t.nickname, t.profileImage, t.role
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
    const {start, status, perPage, search} = options
    const where = []
    if (search) where.push(`(t.nickname like '%${search}%')`)
    if (status && status !== 'all') where.push(`(t.status = ${escape(status)})`)
    const rows: ITrainerDataForAdmin[] = await db.query({
      sql: `SELECT t.id, t.nickname, t.role, t.profileImage, tri.shortIntro, t.status, t.createdAt
            FROM ?? t
            JOIN ?? tri ON tri.trainerId = t.id
            ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
            GROUP BY t.id
            ORDER BY t.createdAt DESC
            LIMIT ${start}, ${perPage}`,
      values: [tableName, tableTrainerInfo]
    })
    const [rowTotal] = await db.query({
      sql: `SELECT COUNT(1) as total FROM (
            SELECT t.id, t.nickname, t.role, t.profileImage, tri.shortIntro, t.status, t.createdAt
            FROM ?? t
            JOIN ?? tri ON tri.trainerId = t.id
            ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
            GROUP BY t.id
            ORDER BY t.createdAt DESC
            ) t`,
      values: [tableName, tableTrainerInfo]
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
      sql: `SELECT t.*, ti.meetingLink
            FROM ?? t
            JOIN ?? ti ON ti.trainerId = t.id
            WHERE ?`,
      values: [tableName, tableTrainerInfo, options]
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
      sql: `SELECT t.id, t.nickname, t.email, t.profileImage, tri.largeProfileImage, t.status, t.mainVisible, t.role,
            tri.instagram, tri.meetingLink, tri.shortIntro, tri.intro, tri.qualification, tri.speciality, tri.coachingStyle, tri.favorite,
            tri.welcomeThreadContent, ft.fcPercentage
            FROM ?? t
            JOIN ?? tri ON t.id = tri.trainerId
            JOIN ?? ft ON t.id = ft.trainerId
            WHERE ?`,
      values: [tableName, tableTrainerInfo, tableFranchiseTrainer, {id}]
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

async function findOneRelationFranchise(trainerId: number, connection: PoolConnection): Promise<IFranchiseTrainers> {
  try {
    const [rows] = await db.query({
      connection,
      sql: `SELECT ft.* FROM ?? ft WHERE ?`,
      values: [tableFranchiseTrainer, {trainerId}]
    })
    return rows
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

async function updateOne(options: ITrainerUpdate, connection: PoolConnection): Promise<void> {
  const {id, ...data} = options
  try {
    await db.query({
      sql: `UPDATE ?? SET ? WHERE ? `,
      values: [tableName, data, {id}],
      connection
    })
  } catch (e) {
    throw e
  }
}

async function updateForAdmin(options: ITrainerUpdate, connection: PoolConnection): Promise<void> {
  const {id, ...data} = options
  try {
    await db.query({
      sql: `UPDATE ?? SET ? WHERE ? `,
      values: [tableName, data, {id}],
      connection
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

async function updateTrainerInfoForAdmin(options: ITrainerInfoUpdate, connection: PoolConnection): Promise<void> {
  const {trainerId, ...data} = options
  try {
    await db.query({
      connection,
      sql: `UPDATE ?? SET ? WHERE ? `,
      values: [tableTrainerInfo, data, {trainerId}]
    })
  } catch (e) {
    throw e
  }
}

async function deleteRelationFranchise(trainerId: number, connection: PoolConnection): Promise<void> {
  try {
    await db.query({
      connection,
      sql: `DELETE FROM ?? WHERE ?`,
      values: [tableFranchiseTrainer, {trainerId}]
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
  createTrainerInfo,
  createRelationsFranchises,
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
  findOneRelationFranchise,
  findDeviceList,
  findTrainersMeetingBoundaryWithId,
  updateForAdmin,
  updateOne,
  updateTrainerMeetingBoundary,
  updateTrainerInfoForAdmin,
  deleteRelationFranchise
}
