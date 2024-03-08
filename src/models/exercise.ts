import moment from 'moment-timezone'
import {PoolConnection, escape} from 'mysql'
import {db} from '../loaders'
import {
  IExerciseCreate,
  IExerciseFindAll,
  IExerciseFindOne,
  IExerciseList,
  IExerciseTag,
  IExerciseUpdate
} from '../interfaces/exercise'
import {Exercise, StandardExercise, Trainer, WorkoutPlan} from './index'
import {IWorkoutScheduleExercise} from '../interfaces/workoutSchedules'

moment.tz.setDefault('Asia/Seoul')

const tableName = 'Exercises'
// const tableExerciseTargetMuscle = 'Exercises-TargetMuscles'
const tableExerciseExerciseTag = 'Exercises-ExerciseTags'
const tableExerciseTag = 'ExerciseTags'
const tableTrainerExercise = 'Trainers-Exercises'
const tableTargetMuscle = 'TargetMuscles'

async function create(options: IExerciseCreate, connection: PoolConnection): Promise<number> {
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

// async function createRelationTargetMuscle(
//   options: {
//     targetMuscleIds: [{id: number; type: 'main' | 'sub'}]
//     exerciseId: number
//   },
//   connection: PoolConnection
// ): Promise<void> {
//   const {targetMuscleIds, exerciseId} = options
//   const values = targetMuscleIds
//     .map((targetMuscle) => `(${exerciseId}, '${targetMuscle.id}', '${targetMuscle.type}')`)
//     .join(',')
//   try {
//     await db.query({
//       connection,
//       sql: `INSERT INTO ?? (exerciseId, targetMuscleId, type) VALUES ${values}`,
//       values: [tableExerciseTargetMuscle]
//     })
//   } catch (e) {
//     throw e
//   }
// }

async function createRelationTag(
  options: {
    exerciseId: number
    exerciseTagId: number
  },
  connection: PoolConnection
): Promise<void> {
  try {
    await db.query({
      connection,
      sql: `INSERT INTO ?? SET ?`,
      values: [tableExerciseExerciseTag, options]
    })
  } catch (e) {
    throw e
  }
}

async function createRelationBookmark(exerciseId: number, trainerId: number): Promise<void> {
  try {
    await db.query({
      sql: `INSERT INTO ?? SET ?`,
      values: [tableTrainerExercise, {exerciseId, trainerId}]
    })
  } catch (e) {
    throw e
  }
}

async function createExerciseTag(options: {name: string}, connection: PoolConnection): Promise<number> {
  try {
    const {insertId} = await db.query({
      connection,
      sql: `INSERT INTO ?? SET ?`,
      values: [tableExerciseTag, options]
    })
    return insertId
  } catch (e) {
    throw e
  }
}

async function findTags(options: IExerciseTag): Promise<{id: number; name: string}> {
  try {
    const [row] = await db.query({
      sql: `SELECT id, name FROM ?? WHERE ?`,
      values: [tableExerciseTag, options]
    })
    return row
  } catch (e) {
    throw e
  }
}

async function findBookmark(exerciseId: number, trainerId: number): Promise<{id: number; name: string}> {
  try {
    const [row] = await db.query({
      sql: `SELECT * FROM ?? WHERE ? AND ?`,
      values: [tableTrainerExercise, {exerciseId}, {trainerId}]
    })
    return row
  } catch (e) {
    throw e
  }
}

async function findAll(options: IExerciseFindAll): Promise<IExerciseList> {
  const {
    search,
    trainerId,
    isMe,
    devisionId,
    machineType,
    isBookmark,
    tagIds,
    trainerFilterId,
    jointType,
    trackingFieldIds,
    targetMuscleIds,
    start,
    perPage
  } = options
  try {
    const where = []
    const values = [
      tableName,
      StandardExercise.tableStandardExercisesExercises,
      StandardExercise.tableName,
      StandardExercise.tableStandardExerciseTargetMuscle,
      tableTargetMuscle,
      Trainer.tableName,
      tableTrainerExercise
    ]
    const totalValues = [
      tableName,
      StandardExercise.tableStandardExercisesExercises,
      StandardExercise.tableName,
      Exercise.tableTrainerExercise
    ]
    const join = []

    if (search) where.push(`(stde.name like ${escape(`%${search}%`)} OR stde.nameEn like ${escape(`%${search}%`)} )`)
    if (isMe) where.push(`t.trainerId = ${escape(trainerId)}`)
    else where.push(`t.trainerId != ${escape(trainerId)}`)

    if (machineType) where.push(`stde.machineType = ${escape(machineType)}`)
    if (jointType) where.push(`stde.jointType = ${escape(jointType)}`)
    if (devisionId) where.push(`stde.devisionId = ${escape(devisionId)}`)
    if (trackingFieldIds && trackingFieldIds.length > 0)
      // if (types && types.length > 0) where.push(`t.type IN ('${types.join(`','`)}')`)
      where.push(`stde.trackingFieldId IN (${trackingFieldIds.join(`,`)})`)
    if (tagIds && tagIds.length > 0) {
      for (let i = 0; i < tagIds.length; i++) {
        join.push(
          `JOIN ?? eet${escape(i)} ON eet${escape(i)}.exerciseId = t.id AND eet${escape(i)}.exerciseTagId = ${escape(
            tagIds[i]
          )}`
        )
        values.push(tableExerciseExerciseTag)
        totalValues.push(tableExerciseExerciseTag)
      }
    }
    if (targetMuscleIds && targetMuscleIds.length > 0) {
      join.push(
        `JOIN ?? setm2 ON setm2.standardExerciseId = stde.id AND setm2.targetMuscleId IN (${targetMuscleIds.join(
          ','
        )}) AND setm2.type = 'main'`
      )
      values.push(StandardExercise.tableStandardExerciseTargetMuscle)
      totalValues.push(StandardExercise.tableStandardExerciseTargetMuscle)
    }

    const rows = await db.query({
      sql: `SELECT t.id, stde.name, t.videos, stde.machineType, stde.trackingFieldId, stde.devisionId, stde.jointType,
            JSON_ARRAYAGG(JSON_OBJECT('id', tm.id, 'name', tm.name)) as targetMuscles,
            t.trainerId, tr.nickname as trainerNickname, t.updatedAt, IF(te.trainerId, true, false) as isBookmark  
            FROM ?? t
            JOIN ?? se ON se.exerciseId = t.id
            JOIN ?? stde ON stde.id = se.standardExerciseId
            JOIN ?? setm ON setm.standardExerciseId = stde.id AND setm.type = 'main'
            JOIN ?? tm ON tm.id = setm.targetMuscleId
            JOIN ?? tr ON tr.id = t.trainerId
            ${isBookmark ? `JOIN` : `LEFT JOIN`} ?? te ON te.exerciseId = t.id AND te.trainerId = ${escape(trainerId)}
            ${join.length ? `${join.join(' ')}` : ''}
            ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
            GROUP BY t.id
            ORDER BY t.createdAt DESC
            LIMIT ${start}, ${perPage}`,
      values
    })
    const [rowTotal] = await db.query({
      sql: `SELECT COUNT(1) as total FROM ?? t
            JOIN ?? se ON se.exerciseId = t.id
            JOIN ?? stde ON stde.id = se.standardExerciseId
            ${isBookmark ? `JOIN` : `LEFT JOIN`} ?? te ON te.exerciseId = t.id AND te.trainerId = ${escape(trainerId)}
            ${join.length ? `${join.join(' ')}` : ''}
            ${where.length ? `WHERE ${where.join(' AND ')}` : ''}`,
      values: totalValues
    })
    return {data: rows, total: rowTotal ? rowTotal.total : 0}
  } catch (e) {
    throw e
  }
}

async function findAllTags(search: string): Promise<[{id: number; name: string}]> {
  try {
    return await db.query({
      sql: `SELECT * FROM ?? WHERE name like ${escape(`%${search}%`)} LIMIT 20`,
      values: [tableExerciseTag]
    })
  } catch (e) {
    throw e
  }
}

async function findOneWithId(id: number, trainerId: number): Promise<IExerciseFindOne> {
  try {
    const [row] = await db.query({
      sql: `SELECT t.id, stde.name,stde.nameEn,stde.machineType, t.videos, t.trainerId, tr.nickname as trainerNickname,
            tr.profileImage as trainerProfileImage, t.updatedAt, t.description,
            stde.trackingFieldId, stde.devisionId, stde.jointType,
            JSON_ARRAYAGG(JSON_OBJECT('id', tm.id, 'name', tm.name, 'muscleType', tm.type, 'type', setm.type)) as targetMuscles,
            (SELECT JSON_ARRAYAGG(ta.name) FROM ?? ta JOIN ?? eet ON eet.exerciseTagId = ta.id AND eet.exerciseId = t.id) as tags,
            IF(te.trainerId, true, false) as isBookmark
            FROM ?? t
            JOIN ?? se ON se.exerciseId = t.id
            JOIN ?? stde ON stde.id = se.standardExerciseId
            JOIN ?? tr ON tr.id = t.trainerId
            JOIN ?? setm ON setm.standardExerciseId = stde.id
            JOIN ?? tm ON tm.id = setm.targetMuscleId 
            LEFT JOIN ?? te ON te.exerciseId = t.id AND te.trainerId = ${escape(trainerId)}
            WHERE t.?`,
      values: [
        tableExerciseTag,
        tableExerciseExerciseTag,
        tableName,
        StandardExercise.tableStandardExercisesExercises,
        StandardExercise.tableName,
        Trainer.tableName,
        StandardExercise.tableStandardExerciseTargetMuscle,
        tableTargetMuscle,
        tableTrainerExercise,
        {id}
      ]
    })
    return row
  } catch (e) {
    throw e
  }
}

async function findOneWithWorkoutScheduleId(workoutScheduleId: number): Promise<IWorkoutScheduleExercise[]> {
  try {
    return await db.query({
      sql: `SELECT wp.id as workoutPlanId, stde.name, e.description, stde.trackingFieldId, e.videos, wp.setInfo, wp.circuitGroupNum,
            wp.setType, wp.circuitSeq, wp.isVideoRecord, stde.devisionId,
            (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', tm.id, 'name', tm.name, 'muscleType', tm.type, 'type', setm.type))
            FROM ?? tm
            JOIN ?? setm ON setm.targetMuscleId = tm.id 
            JOIN ?? stde ON stde.id = setm.standardExerciseId
            JOIN ?? se ON se.standardExerciseId = stde.id AND se.exerciseId = e.id
            ) as targetMuscles,
            tra.nickname as trainerNickname, tra.profileImage as trainerProfileImage
            FROM ?? e
            JOIN ?? se ON se.exerciseId = e.id
            JOIN ?? stde ON stde.id = se.standardExerciseId
            JOIN ?? wp ON wp.workoutScheduleId = ${escape(workoutScheduleId)} AND wp.exerciseId = e.id
            JOIN ?? tra ON tra.id = e.trainerId
            ORDER BY wp.id`,
      values: [
        tableTargetMuscle,
        StandardExercise.tableStandardExerciseTargetMuscle,
        StandardExercise.tableName,
        StandardExercise.tableStandardExercisesExercises,
        tableName,
        StandardExercise.tableStandardExercisesExercises,
        StandardExercise.tableName,
        WorkoutPlan.tableName,
        Trainer.tableName
      ]
    })
  } catch (e) {
    throw e
  }
}

async function findOneWithName(name: string): Promise<[{id: number}]> {
  try {
    return await db.query({
      sql: `SELECT t.id FROM ?? t 
            WHERE t.name = ?
            GROUP BY t.id`,
      values: [tableName, name]
    })
  } catch (e) {
    throw e
  }
}

async function update(options: IExerciseUpdate, connection: PoolConnection): Promise<void> {
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

// async function deleteRelationTargetMuscle(exerciseId: number, connection: PoolConnection): Promise<void> {
//   try {
//     await db.query({
//       connection,
//       sql: `DELETE FROM ?? WHERE ?`,
//       values: [tableExerciseTargetMuscle, {exerciseId}]
//     })
//   } catch (e) {
//     throw e
//   }
// }

async function deleteRelationTag(exerciseId: number, connection: PoolConnection): Promise<void> {
  try {
    await db.query({
      connection,
      sql: `DELETE FROM ?? WHERE ?`,
      values: [tableExerciseExerciseTag, {exerciseId}]
    })
  } catch (e) {
    throw e
  }
}

async function deleteRelationBookmark(exerciseId: number, trainerId: number): Promise<void> {
  try {
    await db.query({
      sql: `DELETE FROM ?? WHERE ? AND ?`,
      values: [tableTrainerExercise, {exerciseId}, {trainerId}]
    })
  } catch (e) {
    throw e
  }
}

export {
  tableName,
  tableExerciseExerciseTag,
  tableExerciseTag,
  tableTargetMuscle,
  tableTrainerExercise,
  create,
  createRelationTag,
  createRelationBookmark,
  createExerciseTag,
  findTags,
  findBookmark,
  findAll,
  findAllTags,
  findOneWithId,
  findOneWithWorkoutScheduleId,
  findOneWithName,
  update,
  deleteRelationTag,
  deleteRelationBookmark
}
