import moment from 'moment-timezone'
import {PoolConnection, escape} from 'mysql'
import {db} from '../loaders'
import {
  IStandardExerciseCreate,
  IStandardExerciseFindAll,
  IStandardExercisesList
} from '../interfaces/standardExercises'
import {TargetMuscle} from '.'

moment.tz.setDefault('Asia/Seoul')

const tableName = 'StandardExercises'
const tableStandardExerciseTargetMuscle = 'StandardExercises-TargetMuscles'
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

export {create, createRelationTargetMuscle, findAll}
