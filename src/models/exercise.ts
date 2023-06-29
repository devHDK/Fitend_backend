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
import {Trainer} from './index'

moment.tz.setDefault('Asia/Seoul')

const tableName = 'Exercises'
const tableExerciseTargetMuscle = 'Exercises-TargetMuscles'
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

async function createRelationTargetMuscle(
  options: {
    targetMuscleIds: [{id: number; type: 'main' | 'sub'}]
    exerciseId: number
  },
  connection: PoolConnection
): Promise<void> {
  const {targetMuscleIds, exerciseId} = options
  const values = targetMuscleIds
    .map((targetMuscle) => `(${exerciseId}, '${targetMuscle.id}', '${targetMuscle.type}')`)
    .join(',')
  try {
    await db.query({
      connection,
      sql: `INSERT INTO ?? (exerciseId, targetMuscleId, type) VALUES ${values}`,
      values: [tableExerciseTargetMuscle]
    })
  } catch (e) {
    throw e
  }
}

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
    isBookmark,
    tagIds,
    trainerFilterId,
    types,
    trackingFieldIds,
    targetMuscleIds,
    start,
    perPage
  } = options
  try {
    const where = []
    const values = [tableName, tableExerciseTargetMuscle, tableTargetMuscle, Trainer.tableName, tableTrainerExercise]
    const totalValues = [tableName, tableTrainerExercise]
    const join = []

    if (search) where.push(`t.name like ${escape(`%${search}%`)}`)
    if (isMe) where.push(`t.trainerId = ${escape(trainerId)}`)
    else if (trainerFilterId) where.push(`t.trainerId = ${escape(trainerFilterId)}`)
    if (types && types.length > 0) where.push(`t.type IN ('${types.join(`','`)}')`)
    if (trackingFieldIds && trackingFieldIds.length > 0)
      where.push(`t.trackingFieldId IN (${trackingFieldIds.join(`,`)})`)
    if (tagIds && tagIds.length > 0) {
      join.push(`JOIN ?? eet ON eet.exerciseId = t.id AND eet.exerciseTagId IN (${tagIds.join(',')})`)
      values.push(tableExerciseExerciseTag)
      totalValues.push(tableExerciseExerciseTag)
    }
    if (targetMuscleIds && targetMuscleIds.length > 0) {
      join.push(
        `JOIN ?? etm ON etm.exerciseId = t.id AND etm.targetMuscleId IN (${targetMuscleIds.join(
          ','
        )}) AND etm.type = 'main'`
      )
      values.push(tableExerciseTargetMuscle)
      totalValues.push(tableExerciseTargetMuscle)
    }

    const rows = await db.query({
      sql: `SELECT t.id, t.name, t.videos, t.type, t.trackingFieldId,
            JSON_ARRAYAGG(JSON_OBJECT('id', tm.id, 'name', tm.name)) as targetMuscles,
            t.trainerId, tr.nickname as trainerNickname, t.updatedAt, IF(te.trainerId, true, false) as isBookmark  
            FROM ?? t
            JOIN ?? et ON et.exerciseId = t.id AND et.type = 'main'
            JOIN ?? tm ON tm.id = et.targetMuscleId
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
            ${isBookmark ? `JOIN` : `LEFT JOIN`} ?? te ON te.exerciseId = t.id AND te.trainerId = t.trainerId
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
      sql: `SELECT t.id, t.name, t.type, t.videos, t.trainerId, tr.nickname as trainerNickname,
            tr.profileImage as trainerProfileImage, t.updatedAt, t.description, t.trackingFieldId,
            JSON_ARRAYAGG(JSON_OBJECT('id', tm.id, 'name', tm.name, 'muscleType', tm.type, 'type', et.type)) as targetMuscles,
            (SELECT JSON_ARRAYAGG(ta.name) FROM ?? ta JOIN ?? eet ON eet.exerciseTagId = ta.id AND eet.exerciseId = t.id) as tags,
            IF(te.trainerId, true, false) as isBookmark
            FROM ?? t
            JOIN ?? tr ON tr.id = t.trainerId
            JOIN ?? et ON et.exerciseId = t.id
            JOIN ?? tm ON tm.id = et.targetMuscleId 
            LEFT JOIN ?? te ON te.exerciseId = t.id AND te.trainerId = ${escape(trainerId)}
            WHERE t.?`,
      values: [
        tableExerciseTag,
        tableExerciseExerciseTag,
        tableName,
        Trainer.tableName,
        tableExerciseTargetMuscle,
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

async function deleteRelationTargetMuscle(exerciseId: number, connection: PoolConnection): Promise<void> {
  try {
    await db.query({
      connection,
      sql: `DELETE FROM ?? WHERE ?`,
      values: [tableExerciseTargetMuscle, {exerciseId}]
    })
  } catch (e) {
    throw e
  }
}

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
  tableExerciseTargetMuscle,
  tableExerciseExerciseTag,
  tableExerciseTag,
  tableTargetMuscle,
  tableTrainerExercise,
  create,
  createRelationTargetMuscle,
  createRelationTag,
  createRelationBookmark,
  createExerciseTag,
  findTags,
  findBookmark,
  findAll,
  findAllTags,
  findOneWithId,
  update,
  deleteRelationTargetMuscle,
  deleteRelationTag,
  deleteRelationBookmark
}
