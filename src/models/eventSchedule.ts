import {escape, PoolConnection} from 'mysql'
import {db} from '../loaders'
import {
  IEventScheduleDetail,
  IEventScheduleFindAll,
  IEventScheduleCreate,
  IEventScheduleList,
  IEventScheduleUpdate,
  IEventListForMeetingSelect
} from '../interfaces/eventSchedule'
import {Trainer} from './index'

const tableName = 'EventSchedules'

async function create(options: IEventScheduleCreate, connection?: PoolConnection): Promise<number> {
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

async function findAll(options: IEventScheduleFindAll): Promise<[IEventScheduleList]> {
  const {franchiseId, trainerId, startDate, endDate} = options
  try {
    const where = [
      `t.franchiseId = ${escape(franchiseId)}`,
      `t.startTime BETWEEN ${escape(startDate)} AND ${escape(endDate)}`
    ]
    if (trainerId) where.push(`t.trainerId = ${escape(trainerId)}`)
    return await db.query({
      sql: `SELECT t.id, t.startTime, t.endTime, t.title, t.type,
            JSON_OBJECT('id', tra.id, 'nickname', tra.nickname, 'profileImage', tra.profileImage) as trainer
            FROM ?? t
            JOIN ?? tra ON tra.id = t.trainerId
            ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
            GROUP BY t.id`,
      values: [tableName, Trainer.tableName]
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
    const where = [`t.startTime BETWEEN ${escape(startDate)} AND ${escape(endDate)}`]
    where.push(`t.trainerId = ${escape(trainerId)}`)
    return await db.query({
      sql: `SELECT DATE_FORMAT(DATE_ADD(t.startTime, INTERVAL 9 HOUR), '%Y-%m-%d') as startDate,
            JSON_ARRAYAGG(JSON_OBJECT('startTime', DATE_FORMAT(t.startTime, '%Y-%m-%dT%H:%i:%s.000Z'),
            'endTime',DATE_FORMAT(t.endTime, '%Y-%m-%dT%H:%i:%s.000Z'), 'type', 'event')) as data
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

async function findOneWithId(id: number): Promise<IEventScheduleDetail> {
  try {
    const [row] = await db.query({
      sql: `SELECT t.id, t.startTime, t.endTime, t.title, t.type,
            JSON_OBJECT('id', tra.id, 'nickname', tra.nickname, 'profileImage', tra.profileImage) as trainer
            FROM ?? t
            JOIN ?? tra ON tra.id = t.trainerId
            WHERE t.id = ${escape(id)}`,
      values: [tableName, Trainer.tableName]
    })
    return row
  } catch (e) {
    throw e
  }
}
//
// async function findOne(id: number): Promise<IReservationFindOne> {
//   try {
//     const [row] = await db.query({
//       sql: `SELECT t.* FROM ?? t WHERE t.id = ${escape(id)}`,
//       values: [tableName]
//     })
//     return row
//   } catch (e) {
//     throw e
//   }
// }

// async function findOneWithTime({
//   trainerId,
//   startTime,
//   endTime
// }: {
//   trainerId: number
//   startTime: string
//   endTime: string
// }): Promise<number> {
//   try {
//     const [row] = await db.query({
//       sql: `SELECT count(id) as count FROM ??
//             WHERE trainerId = ${escape(trainerId)}
//             AND (((startTime < ${escape(startTime)} AND ${escape(startTime)} < endTime)
//             OR (startTime < ${escape(endTime)} AND ${escape(endTime)}< endTime))
//             OR (startTime >= ${escape(startTime)} AND endTime <= ${escape(endTime)}))
//             `,
//       values: [tableName]
//     })
//     return row && row.count
//   } catch (e) {
//     throw e
//   }
// }

async function update(options: IEventScheduleUpdate): Promise<void> {
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

export {tableName, create, findAll, findAllWithTrainerIdForMeetingSelect, findOneWithId, update, deleteOne}
