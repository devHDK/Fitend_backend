import moment from 'moment-timezone'
import {escape} from 'mysql'
import {db} from '../loaders'
import {
  ITrainer,
  ITrainerDataForAdmin,
  ITrainerDetail,
  ITrainerFindAllForAdmin,
  ITrainerFindOne,
  ITrainerFindOneWageInfo,
  ITrainerList,
  ITrainerListForAdmin,
  ITrainerUpdate,
  ITrainerWageInfo
} from '../interfaces/trainer'
import {IWageInfo} from '../interfaces/payroll'
import {Ticket, User} from './'

moment.tz.setDefault('Asia/Seoul')

const tableName = 'Trainers'
const tableFranchiseTrainer = 'Franchises-Trainers'
const tableFranchise = 'Franchises'

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
            JOIN ?? ti ON ti.id = tr.ticketId AND ti.expiredAt > '${currentTime}'
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

async function findOneWithIdForAdmin(id: number): Promise<ITrainerDetail> {
  try {
    const [row] = await db.query({
      sql: `SELECT t.id, t.nickname, t.email, t.createdAt 
            FROM ?? t WHERE ?`,
      values: [tableName, {id}]
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

export {
  tableName,
  tableFranchiseTrainer,
  findOne,
  findTrainerWageInfo,
  findAll,
  findDeviceList,
  updateOne,
  findAllForAdmin,
  findOneWithIdForAdmin
}
