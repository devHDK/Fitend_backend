import moment from 'moment-timezone'
import {escape, PoolConnection} from 'mysql'
import {db} from '../loaders'
import {IReservationCreate, IReservationDetail, IReservationFindAll, IReservationList} from '../interfaces/reservation'

moment.tz.setDefault('Asia/Seoul')

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

// async function createRelationExercises(
//   options: {
//     exercises: [
//       {
//         id: number
//         setInfo: [{index: number; reps: number; weight: number; seconds: number}]
//       }
//     ]
//     ReservationId: number
//   },
//   connection: PoolConnection
// ): Promise<void> {
//   const {exercises, ReservationId} = options
//   const values = exercises
//     .map((exercise) => `(${ReservationId}, '${exercise.id}', '${JSON.stringify(exercise.setInfo)}')`)
//     .join(',')
//   try {
//     await db.query({
//       connection,
//       sql: `INSERT INTO ?? (ReservationId, exerciseId, setInfo) VALUES ${values}`,
//       values: [tableReservationExercise]
//     })
//   } catch (e) {
//     throw e
//   }
// }
//
// async function createRelationBookmark(ReservationId: number, trainerId: number): Promise<void> {
//   try {
//     await db.query({
//       sql: `INSERT INTO ?? SET ?`,
//       values: [tableTrainerReservation, {ReservationId, trainerId}]
//     })
//   } catch (e) {
//     throw e
//   }
// }

async function findAll(options: IReservationFindAll): Promise<IReservationList> {
  const {franchiseId, startDate, endDate} = options
  try {
    const where = []
    const rows = await db.query({
      sql: `SELECT t.id, t.title, t.subTitle, t.totalTime,
            JSON_ARRAYAGG(tm.type) as primaryTypes,
            t.trainerId, tr.nickname as trainerNickname, t.updatedAt, IF(tw.trainerId, true, false) as isBookmark
            FROM ?? t
            JOIN ?? we ON we.ReservationId = t.id
            JOIN ?? et ON et.exerciseId = we.exerciseId AND et.type = 'main'
            ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
            GROUP BY t.id
            ORDER BY t.createdAt DESC`,
      values: [tableName]
    })
    const [rowTotal] = await db.query({
      sql: `SELECT COUNT(1) as total FROM ?? t
            ${where.length ? `WHERE ${where.join(' AND ')}` : ''}`,
      values: [tableName]
    })
    return {data: rows, total: rowTotal ? rowTotal.total : 0}
  } catch (e) {
    throw e
  }
}

// async function findOneWithId(id: number, trainerId: number): Promise<IReservationDetail> {
//   try {
//     const [row] = await db.query({
//       sql: `SELECT t.id, t.title, t.subTitle, t.totalTime,
//             (SELECT JSON_ARRAYAGG(t.type)
//               FROM (
//                 SELECT DISTINCT tm.type
//                 FROM ?? we
//                 JOIN ?? et ON et.exerciseId = we.exerciseId AND et.type = 'main'
//                 JOIN ?? tm ON tm.id = et.targetMuscleId
//                 WHERE we.ReservationId = t.id
//               ) t
//             ) as primaryTypes,
//             t.trainerId, tr.nickname as trainerNickname, tr.profileImage as trainerProfileImage, t.updatedAt,
//             JSON_ARRAYAGG(
//               JSON_OBJECT('id', e.id, 'videos', e.videos, 'name', e.name, 'trackingFieldId', e.trackingFieldId ,'setInfo', we.setInfo,
//               'targetMuscles', (SELECT JSON_ARRAYAGG(t.name)
//                 FROM (
//                   SELECT DISTINCT tm.name
//                   FROM ?? we
//                   JOIN ?? et ON et.exerciseId = e.id AND et.type = 'main'
//                   JOIN ?? tm ON tm.id = et.targetMuscleId
//                   WHERE we.ReservationId = t.id
//                 ) t
//                )
//               )
//             ) as exercises, IF(tw.trainerId, true, false) as isBookmark
//             FROM ?? t
//             JOIN ?? we ON we.ReservationId = t.id
//             JOIN ?? e ON e.id = we.exerciseId
//             JOIN ?? tr ON tr.id = t.trainerId
//             LEFT JOIN ?? tw ON tw.ReservationId = t.id AND tw.trainerId = ${escape(trainerId)}
//             WHERE t.?
//             GROUP BY t.id`,
//       values: [
//         tableReservationExercise,
//         Exercise.tableExerciseTargetMuscle,
//         Exercise.tableTargetMuscle,
//         tableReservationExercise,
//         Exercise.tableExerciseTargetMuscle,
//         Exercise.tableTargetMuscle,
//         tableName,
//         tableReservationExercise,
//         Exercise.tableName,
//         Trainer.tableName,
//         tableTrainerReservation,
//         {id}
//       ]
//     })
//     return row
//   } catch (e) {
//     throw e
//   }
// }

async function findLastReservation(ticketId: number): Promise<number> {
  try {
    const [row] = await db.query({
      sql: `SELECT seq FROM ??
            WHERE ? AND times = 1
            ORDER BY seq DESC`,
      values: [tableName, {ticketId}]
    })
    return row ? row.seq : 0
  } catch (e) {
    throw e
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

// async function update(options: IWorkUpdate, connection: PoolConnection): Promise<void> {
//   const {id, ...data} = options
//   try {
//     await db.query({
//       connection,
//       sql: `UPDATE ?? SET ? WHERE ? `,
//       values: [tableName, data, {id}]
//     })
//   } catch (e) {
//     throw e
//   }
// }
//
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
//
// async function deleteRelationBookmark(ReservationId: number, trainerId: number): Promise<void> {
//   try {
//     await db.query({
//       sql: `DELETE FROM ?? WHERE ? AND ?`,
//       values: [tableTrainerReservation, {ReservationId}, {trainerId}]
//     })
//   } catch (e) {
//     throw e
//   }
// }

export {
  tableName,
  create,
  // createRelationExercises,
  // createRelationBookmark,
  findAll,
  // findOneWithId,
  findLastReservation,
  findOneWithTime
  // update,
  // deleteRelationExercise,
  // deleteRelationBookmark
}
