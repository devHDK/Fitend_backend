import moment from 'moment-timezone'
import {PoolConnection, escape} from 'mysql'
import {db} from '../loaders'
import {IStandardExerciseCreate} from '../interfaces/standardExercises'

moment.tz.setDefault('Asia/Seoul')

const tableName = 'StandardExercises'
const tableStandardExerciseTargetMuscle = 'StandardExercises-TargetMuscles'

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

export {create, createRelationTargetMuscle}
