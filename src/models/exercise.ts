import moment from 'moment-timezone'
import {db} from '../loaders'
import {IExerciseCreate, IExerciseTag} from '../interfaces/exercise'
import { PoolConnection } from "mysql";

moment.tz.setDefault('Asia/Seoul')

const tableName = 'Exercises'
const tableExerciseTargetMuscle = 'Exercises-TargetMuscles'
const tableExerciseExerciseTag = 'Exercises-ExerciseTags'
const tableExerciseTag = 'ExerciseTags'

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

async function createRelationTargetMuscle(options: {
  targetMuscleIds: [{id: number, type: 'main' | 'sub'}],
  exerciseId: number
}, connection: PoolConnection): Promise<void> {
  const {targetMuscleIds, exerciseId} = options
  const values = targetMuscleIds.map((targetMuscle) => (`(${exerciseId}, '${targetMuscle.id}', '${targetMuscle.type}')`)).join(',')
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

async function createRelationTag(options: {
  exerciseId: number
  exerciseTagId: number
}, connection: PoolConnection): Promise<void> {
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

async function findTags(options: IExerciseTag): Promise<{id: number, name: string}> {
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

export {
  tableName,
  create,
  createRelationTargetMuscle,
  createRelationTag,
  createExerciseTag,
  findTags
}