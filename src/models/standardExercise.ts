import moment from 'moment-timezone'
import {PoolConnection, escape} from 'mysql'
import {db} from '../loaders'
import {
  IStandardExerciseCreate,
  IStandardExerciseFindAll,
  IStandardExerciseUpdate,
  IStandardExercisesFindOne,
  IStandardExercisesList
} from '../interfaces/standardExercises'
import {Exercise, TargetMuscle, Trainer} from '.'

moment.tz.setDefault('Asia/Seoul')

const tableName = 'StandardExercises'
const tableStandardExerciseTargetMuscle = 'StandardExercises-TargetMuscles'
const tableStandardExercisesExercises = 'StandardExercises-Exercises'
const tableExercisesDevision = 'ExercisesDevision'

async function create(options: IStandardExerciseCreate, connection: PoolConnection): Promise<number> {
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
    targetMuscleIds: {id: number; type: string}[]
    standardExerciseId: number
  },
  connection: PoolConnection
): Promise<void> {
  const {targetMuscleIds, standardExerciseId} = options
  const values = targetMuscleIds
    .map((targetMuscle) => `(${standardExerciseId}, '${targetMuscle.id}', '${targetMuscle.type}')`)
    .join(',')
  try {
    await db.query({
      connection,
      sql: `INSERT INTO ?? (standardExerciseId, targetMuscleId, type) VALUES ${values}`,
      values: [tableStandardExerciseTargetMuscle]
    })
  } catch (e) {
    throw e
  }
}

async function createRelationExercises(
  options: {
    exerciseIds: {id: number}[]
    standardExerciseId: number
  },
  connection: PoolConnection
): Promise<void> {
  const {exerciseIds, standardExerciseId} = options
  const values = exerciseIds.map((exercise) => `(${standardExerciseId}, '${exercise.id}')`).join(',')
  try {
    await db.query({
      connection,
      sql: `INSERT INTO ?? (standardExerciseId, exerciseId) VALUES ${values}`,
      values: [tableStandardExercisesExercises]
    })
  } catch (e) {
    throw e
  }
}

async function findAll(options: IStandardExerciseFindAll): Promise<IStandardExercisesList> {
  const {search, targetMuscleIds, devisionId, machineType, start, perPage} = options
  try {
    const where = []
    const join = []
    const values = [tableName, tableExercisesDevision, tableStandardExerciseTargetMuscle, TargetMuscle.tableName]
    const totalValues = [tableName]
    if (search) where.push(`t.name like ${escape(`%${search}%`)} OR t.nameEn like ${escape(`%${search}%`)}`)
    if (machineType) where.push(`t.machineType like ${escape(`%${machineType}%`)}`)
    if (devisionId) where.push(`t.devisionId = ${escape(devisionId)}`)
    if (targetMuscleIds && targetMuscleIds.length > 0) {
      join.push(
        `JOIN ?? stm ON stm.standardExerciseId = t.id AND stm.targetMuscleId IN (${targetMuscleIds.join(
          ','
        )}) AND stm.type = 'main'`
      )
      values.push(tableStandardExerciseTargetMuscle)
      totalValues.push(tableStandardExerciseTargetMuscle)
    }

    const rows = await db.query({
      sql: `SELECT t.id, t.name, t.machineType, t.jointType, ed.name as devision,
            JSON_ARRAYAGG(JSON_OBJECT('id', tm.id, 'name', tm.name)) as targetMuscles
            FROM ?? t
            JOIN ?? ed ON t.devisionId = ed.id
            JOIN ?? st ON st.standardExerciseId = t.id AND st.type = 'main'
            JOIN ?? tm ON tm.id = st.targetMuscleId
            ${join.length ? `${join.join(' ')}` : ''}
            ${where.length ? `WHERE ${where.join(' AND ')}` : ''} 
            GROUP BY t.id
            ORDER BY t.createdAt DESC
            LIMIT ${start}, ${perPage}`,
      values
    })
    const [rowTotal] = await db.query({
      sql: `SELECT COUNT(1) as total FROM ?? t
            ${join.length ? `${join.join(' ')}` : ''}
            ${where.length ? `WHERE ${where.join(' AND ')}` : ''} 
          `,
      values: totalValues
    })
    return {data: rows, total: rowTotal ? rowTotal.total : 0}
  } catch (e) {
    throw e
  }
}

async function findOneWithId({id, trainerId}: {id: number; trainerId: number}): Promise<IStandardExercisesFindOne> {
  try {
    const [row] = await db.query({
      sql: `SELECT t.id, t.name, t.nameEn, t.machineType, t.jointType, ed.name as devision,
            JSON_ARRAYAGG(JSON_OBJECT('id', tm.id, 'name', tm.name, 'muscleType', tm.type, 'type', st.type)) as targetMuscles,
            (SELECT JSON_ARRAYAGG(
              JSON_OBJECT('id', e.id, 'description', e.description, 'trainerId', e.trainerId, 'trainerNickname', tra.nickname,
              'isBookmark', IF(te.trainerId, true, false)
            ))
            FROM ?? e
            JOIN ?? see ON see.standardExerciseId = t.id AND see.exerciseId = e.id
            JOIN ?? tra ON e.trainerId = tra.id
            LEFT JOIN ?? te ON te.exerciseId = e.id AND te.trainerId = ${escape(trainerId)}
            ) as linkedExercises
            FROM ?? t
            JOIN ?? ed ON ed.id = t.devisionId
            JOIN ?? st ON st.standardExerciseId = t.id
            JOIN ?? tm ON tm.id = st.targetMuscleId
            WHERE t.?`,
      values: [
        Exercise.tableName,
        tableStandardExercisesExercises,
        Trainer.tableName,
        Exercise.tableTrainerExercise,
        tableName,
        tableExercisesDevision,
        tableStandardExerciseTargetMuscle,
        TargetMuscle.tableName,
        {id}
      ]
    })
    return row
  } catch (e) {
    throw e
  }
}

async function findExerciseIds(id: number): Promise<[number]> {
  try {
    const [row] = await db.query({
      sql: `SELECT JSON_ARRAYAGG(se.exerciseId) as id
            FROM ?? se
            WHERE se.standardExerciseId = ${escape(id)}
            `,
      values: [tableStandardExercisesExercises]
    })
    return row.id
  } catch (e) {
    throw e
  }
}

async function update(options: IStandardExerciseUpdate, connection: PoolConnection): Promise<void> {
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

async function deleteRelationTargetMuscle(standardExerciseId: number, connection: PoolConnection): Promise<void> {
  try {
    await db.query({
      connection,
      sql: `DELETE FROM ?? WHERE ?`,
      values: [tableStandardExerciseTargetMuscle, {standardExerciseId}]
    })
  } catch (e) {
    throw e
  }
}

export {
  tableName,
  tableExercisesDevision,
  tableStandardExerciseTargetMuscle,
  tableStandardExercisesExercises,
  create,
  createRelationTargetMuscle,
  createRelationExercises,
  findAll,
  findOneWithId,
  findExerciseIds,
  update,
  deleteRelationTargetMuscle
}
