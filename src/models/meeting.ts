import moment from 'moment-timezone'
import {escape, PoolConnection} from 'mysql'
import {db} from '../loaders'

import {Trainer, User} from './index'
import {
  IMeetingCreate,
  IMeetingDetail,
  IMeetingFindAll,
  IMeetingFindAllForUser,
  IMeetingFindOne,
  IMeetingList,
  IMeetingListForMeetingSelect,
  IMeetingUpdate
} from '../interfaces/meetings'

const tableName = 'Meetings'

async function create(options: IMeetingCreate, connection?: PoolConnection): Promise<number> {
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

async function findAll(options: IMeetingFindAll): Promise<[IMeetingList]> {
  const {userId, trainerId, startDate, endDate} = options
  const endTime = moment(endDate).add(1, 'day').format('YYYY-MM-DD')
  try {
    const where = [`t.startTime BETWEEN ${escape(startDate)} AND ${escape(endTime)}`]
    if (trainerId) where.push(`t.trainerId = ${escape(trainerId)}`)
    return await db.query({
      sql: `SELECT t.id, t.startTime, t.endTime, t.status,
            u.nickname as userNickname,
            JSON_OBJECT('id', tra.id, 'nickname', tra.nickname, 'profileImage', tra.profileImage) as trainer
            FROM ?? t
            JOIN ?? u ON u.id = t.userId 
            JOIN ?? tra ON tra.id = t.trainerId
            ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
            GROUP BY t.id
            ORDER BY t.startTime ASC
            `,
      values: [tableName, User.tableName, Trainer.tableName]
    })
  } catch (e) {
    throw e
  }
}

async function findAllForUser(options: IMeetingFindAllForUser): Promise<[IMeetingList]> {
  const {userId, startDate, interval} = options
  try {
    const startDateUtc = moment(startDate).utc().format('YYYY-MM-DDTHH:mm:ss')
    const where = [
      `t.startTime BETWEEN ${escape(startDateUtc)} AND DATE_ADD('${startDateUtc}', 
      INTERVAL ${interval ? escape(interval) : 30} DAY)`,
      `t.userId = ${escape(userId)}`
    ]
    return await db.query({
      sql: `SELECT DATE_FORMAT(DATE_ADD(t.startTime, INTERVAL 9 HOUR), '%Y-%m-%d') as startDate,
            JSON_ARRAYAGG(JSON_OBJECT(
            'id', t.id, 'startTime', DATE_FORMAT(t.startTime, '%Y-%m-%dT%H:%i:%s.000Z'), 
            'endTime', DATE_FORMAT(t.endTime, '%Y-%m-%dT%H:%i:%s.000Z'), 'status', t.status, 
            'userNickname', u.nickname, 'meetingLink', ti.meetingLink,
            'trainer', JSON_OBJECT('id', tra.id, 'nickname', tra.nickname, 'profileImage', tra.profileImage)
            )) as meetings
            FROM ?? t 
            JOIN ?? u ON u.id = ${escape(userId)}
            JOIN ?? tra ON tra.id = t.trainerId
            JOIN ?? ti ON ti.trainerId = tra.id
            ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
            GROUP BY startDate`,
      values: [tableName, User.tableName, Trainer.tableName, Trainer.tableTrainerInfo]
    })
  } catch (e) {
    throw e
  }
}

async function findAllWithTrainerIdForMeetingSelect(options: {
  startDate: string
  endDate: string
  trainerId: number
}): Promise<
  [
    {
      startDate: string
      data: [
        {
          startTime: string
          endTime: string
          type: string
        }
      ]
    }
  ]
> {
  const {trainerId, startDate, endDate} = options
  try {
    const where = [`t.status = 'complete'`, `t.startTime BETWEEN ${escape(startDate)} AND ${escape(endDate)}`]
    where.push(`t.trainerId = ${escape(trainerId)}`)
    return await db.query({
      sql: `SELECT DATE_FORMAT(DATE_ADD(t.startTime, INTERVAL 9 HOUR), '%Y-%m-%d') as startDate,
            JSON_ARRAYAGG(JSON_OBJECT('startTime', DATE_FORMAT(t.startTime, '%Y-%m-%dT%H:%i:%s.000Z'),
            'endTime',DATE_FORMAT(t.endTime, '%Y-%m-%dT%H:%i:%s.000Z'), 'type', 'meeting')) as data
            FROM ?? t
            ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
            GROUP BY startDate
            `,
      values: [tableName]
    })
  } catch (e) {
    throw e
  }
}

async function findOneWithId(id: number): Promise<IMeetingDetail> {
  try {
    const [row] = await db.query({
      sql: `SELECT t.id, t.startTime, t.endTime, t.status,
            u.id as userId, u.nickname as userNickname, tri.meetingLink,
            JSON_OBJECT('id', tra.id, 'nickname', tra.nickname, 'profileImage', tra.profileImage) as trainer
            FROM ?? t
            JOIN ?? u ON u.id = t.userId
            JOIN ?? tra ON tra.id = t.trainerId
            JOIN ?? tri ON tri.trainerId = t.trainerId
            WHERE t.id = ${escape(id)}
            GROUP BY t.id`,
      values: [tableName, User.tableName, Trainer.tableName, Trainer.tableTrainerInfo]
    })
    return row
  } catch (e) {
    throw e
  }
}

async function findOneWithTimeAndTrainerId(
  options: {trainerId: number; startTime: string; endTime: string; reservedId?: number},
  connection?: PoolConnection
): Promise<number> {
  const {trainerId, startTime, endTime, reservedId} = options
  try {
    const [row] = await db.query(
      {
        connection,
        sql: `SELECT count(id) as count FROM ??  
            WHERE trainerId = ${escape(trainerId)}
            AND (((startTime < '${startTime}' AND '${startTime}' < endTime) OR (startTime < '${endTime}' AND '${endTime}'< endTime))
            OR (startTime >= '${startTime}' AND endTime <= '${endTime}')) 
            ${reservedId ? `AND id != ${escape(reservedId)}` : ``}`,
        values: [tableName]
      },
      '*'
    )
    return row.count
  } catch (err) {
    throw err
  }
}

async function findOne(id: number): Promise<IMeetingFindOne> {
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

async function update(options: IMeetingUpdate, connection: PoolConnection): Promise<void> {
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

async function deleteOne(id: number): Promise<void> {
  try {
    await db.query({
      sql: `DELETE FROM ?? WHERE ?`,
      values: [tableName, {id}]
    })
  } catch (e) {
    throw e
  }
}

export {
  tableName,
  create,
  findAll,
  findAllForUser,
  findAllWithTrainerIdForMeetingSelect,
  findOneWithId,
  findOneWithTimeAndTrainerId,
  findOne,
  update,
  deleteOne
}
