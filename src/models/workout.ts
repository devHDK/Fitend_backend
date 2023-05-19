import moment from "moment-timezone"
import { db } from "../loaders"
import {
  IWorkoutCreate, IWorkoutFindAll, IWorkoutList
} from "../interfaces/workout"
import { PoolConnection } from "mysql"
import {Trainer, Exercise} from "./"

moment.tz.setDefault('Asia/Seoul')

const tableName = 'Workouts'
const tableWorkoutExercise = 'Workouts-Exercises'

async function create(options: IWorkoutCreate, connection: PoolConnection): Promise<number> {
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

async function createRelationExercises(options: {
  exercises: [
    {
      id: number
      setInfo: [
        {index: number, reps: number, weight: number, seconds: number}
      ]
    }
  ]
  workoutId: number
}, connection: PoolConnection): Promise<void> {
  const {exercises, workoutId} = options
  const values = exercises
    .map((exercise) => (`(${workoutId}, '${exercise.id}', '${JSON.stringify(exercise.setInfo)}')`)).join(',')
  try {
    await db.query({
      connection,
      sql: `INSERT INTO ?? (workoutId, exerciseId, setInfo) VALUES ${values}`,
      values: [tableWorkoutExercise]
    })
  } catch (e) {
    throw e
  }
}

// async function createRelationTag(options: {
//   exerciseId: number
//   exerciseTagId: number
// }, connection: PoolConnection): Promise<void> {
//   try {
//     await db.query({
//       connection,
//       sql: `INSERT INTO ?? SET ?`,
//       values: [tableExerciseExerciseTag, options]
//     })
//   } catch (e) {
//     throw e
//   }
// }
//
// async function createExerciseTag(options: {name: string}, connection: PoolConnection): Promise<number> {
//   try {
//     const {insertId} = await db.query({
//       connection,
//       sql: `INSERT INTO ?? SET ?`,
//       values: [tableExerciseTag, options]
//     })
//     return insertId
//   } catch (e) {
//     throw e
//   }
// }
//
// async function findTags(options: IExerciseTag): Promise<{id: number, name: string}> {
//   try {
//     const [row] = await db.query({
//       sql: `SELECT id, name FROM ?? WHERE ?`,
//       values: [tableExerciseTag, options]
//     })
//     return row
//   } catch (e) {
//     throw e
//   }
// }

async function findAll(options: IWorkoutFindAll): Promise<IWorkoutList> {
  const {search, start, perPage} = options
  try {
    const where = []
    if (search) where.push(`t.name like '%${search}%'`)
    const rows = await db.query({
      sql: `SELECT t.id, t.title, t.totalTime, 
            JSON_ARRAYAGG(tm.type) as primaryTypes,
            t.trainerId, tr.nickname as trainerNickname, t.updatedAt
            FROM ?? t
            JOIN ?? we ON we.workoutId = t.id
            JOIN ?? et ON et.exerciseId = we.exerciseId AND et.type = 'main'
            JOIN ?? tm ON tm.id = et.targetMuscleId
            JOIN ?? tr ON tr.id = t.trainerId
            ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
            GROUP BY t.id
            ORDER BY t.createdAt DESC
            LIMIT ${start}, ${perPage}`,
      values: [tableName, tableWorkoutExercise, Exercise.tableExerciseTargetMuscle, Exercise.tableTargetMuscle, Trainer.tableName]
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

// async function findOneWithId(id: number): Promise<IExerciseFindOne> {
//   try {
//     const [row] = await db.query({
//       sql: `SELECT t.id, t.name, t.videos, t.trainerId, tr.nickname as trainerNickname,
//             tr.profileImage as trainerProfileImage, t.updatedAt, t.description,
//             JSON_ARRAYAGG(JSON_OBJECT('id', tm.id, 'name', tm.name, 'muscleType', tm.type, 'type', et.type)) as targetMuscles
//             FROM ?? t
//             JOIN ?? tr ON tr.id = t.trainerId
//             JOIN ?? et ON et.exerciseId = t.id
//             JOIN ?? tm ON tm.id = et.targetMuscleId
//             WHERE t.?`,
//       values: [tableName, Trainer.tableName, tableExerciseTargetMuscle, tableTargetMuscle, {id}]
//     })
//     return row
//   } catch (e) {
//     throw e
//   }
// }
//
// async function update(options: IExerciseUpdate, connection: PoolConnection): Promise<void> {
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
//
// async function deleteRelationTag(exerciseId: number, connection: PoolConnection): Promise<void> {
//   try {
//     await db.query({
//       connection,
//       sql: `DELETE FROM ?? WHERE ?`,
//       values: [tableExerciseExerciseTag, {exerciseId}]
//     })
//   } catch (e) {
//     throw e
//   }
// }

export {
  tableName,
  tableWorkoutExercise,
  create,
  createRelationExercises,
  findAll
}