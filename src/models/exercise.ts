import moment from "moment-timezone"
import { db } from "../loaders"
import {
  IExerciseCreate,
  IExerciseFindAll,
  IExerciseFindOne,
  IExerciseList,
  IExerciseTag,
  IExerciseUpdate
} from "../interfaces/exercise"
import { PoolConnection } from "mysql"
import { Trainer } from "./index"

moment.tz.setDefault('Asia/Seoul')

const tableName = 'Exercises'
const tableExerciseTargetMuscle = 'Exercises-TargetMuscles'
const tableExerciseExerciseTag = 'Exercises-ExerciseTags'
const tableExerciseTag = 'ExerciseTags'
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

async function findAll(options: IExerciseFindAll): Promise<IExerciseList> {
  const {start, perPage} = options
  try {
    const where = []
    const rows = await db.query({
      sql: `SELECT t.id, t.name, t.type,
            JSON_ARRAYAGG(JSON_OBJECT('id', tm.id, 'name', tm.name)) as targetMuscles,
            t.trainerId, tr.nickname as trainerNickname, t.updatedAt  
            FROM ?? t
            JOIN ?? et ON et.exerciseId = t.id
            JOIN ?? tm ON tm.id = et.targetMuscleId
            JOIN ?? tr ON tr.id = t.trainerId
            ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
            GROUP BY t.id
            ORDER BY t.createdAt DESC
            LIMIT ${start}, ${perPage}`,
      values: [tableName, tableExerciseTargetMuscle, tableTargetMuscle, Trainer.tableName, options]
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

async function findOneWithId(id: number): Promise<IExerciseFindOne> {
  try {
    const [row] = await db.query({
      sql: `SELECT t.id, t.name, t.videos, t.trainerId, tr.nickname as trainerNickname,
            tr.profileImage as trainerProfileImage, t.updatedAt, t.description, 
            JSON_ARRAYAGG(JSON_OBJECT('id', tm.id, 'name', tm.name, 'muscleType', tm.type, 'type', et.type)) as targetMuscles
            FROM ?? t
            JOIN ?? tr ON tr.id = t.trainerId
            JOIN ?? et ON et.exerciseId = t.id
            JOIN ?? tm ON tm.id = et.targetMuscleId 
            WHERE t.?`,
      values: [tableName, Trainer.tableName, tableExerciseTargetMuscle, tableTargetMuscle, {id}]
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

export {
  tableName,
  create,
  createRelationTargetMuscle,
  createRelationTag,
  createExerciseTag,
  findTags,
  findAll,
  findOneWithId,
  update,
  deleteRelationTargetMuscle,
  deleteRelationTag
}