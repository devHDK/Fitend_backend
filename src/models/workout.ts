import moment from 'moment-timezone'
import {PoolConnection} from 'mysql'
import {db} from '../loaders'
import {IWorkoutCreate, IWorkoutDetail, IWorkoutFindAll, IWorkoutList, IWorkUpdate} from '../interfaces/workout'
import {Trainer, Exercise} from './'
import {tableExerciseExerciseTag} from './exercise'

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

async function createRelationExercises(
  options: {
    exercises: [
      {
        id: number
        setInfo: [{index: number; reps: number; weight: number; seconds: number}]
      }
    ]
    workoutId: number
  },
  connection: PoolConnection
): Promise<void> {
  const {exercises, workoutId} = options
  const values = exercises
    .map((exercise) => `(${workoutId}, '${exercise.id}', '${JSON.stringify(exercise.setInfo)}')`)
    .join(',')
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
      values: [
        tableName,
        tableWorkoutExercise,
        Exercise.tableExerciseTargetMuscle,
        Exercise.tableTargetMuscle,
        Trainer.tableName
      ]
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

async function findOneWithId(id: number): Promise<IWorkoutDetail> {
  try {
    const [row] = await db.query({
      sql: `SELECT t.id, t.title, t.subTitle, t.totalTime,
            (SELECT JSON_ARRAYAGG(tm.type) 
              FROM ?? we
              JOIN ?? et ON et.exerciseId = we.exerciseId AND et.type = 'main'
              JOIN ?? tm ON tm.id = et.targetMuscleId
              WHERE we.workoutId = t.id
            ) as primaryTypes,
            t.trainerId, tr.nickname as trainerNickname, tr.profileImage as trainerProfileImage, t.updatedAt,
            JSON_ARRAYAGG(
              JSON_OBJECT('id', e.id, 'videos', e.videos, 'name', e.name, 'trackingFieldId', e.trackingFieldId ,'setInfo', we.setInfo)
            ) as exercises
            FROM ?? t
            JOIN ?? we ON we.workoutId = t.id
            JOIN ?? e ON e.id = we.exerciseId
            JOIN ?? tr ON tr.id = t.trainerId
            WHERE t.?
            GROUP BY t.id`,
      values: [
        tableWorkoutExercise,
        Exercise.tableExerciseTargetMuscle,
        Exercise.tableTargetMuscle,
        tableName,
        tableWorkoutExercise,
        Exercise.tableName,
        Trainer.tableName,
        {id}
      ]
    })
    return row
  } catch (e) {
    throw e
  }
}

async function update(options: IWorkUpdate, connection: PoolConnection): Promise<void> {
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

async function deleteRelationExercise(workoutId: number, connection: PoolConnection): Promise<void> {
  try {
    await db.query({
      connection,
      sql: `DELETE FROM ?? WHERE ?`,
      values: [tableWorkoutExercise, {workoutId}]
    })
  } catch (e) {
    throw e
  }
}

export {
  tableName,
  tableWorkoutExercise,
  create,
  createRelationExercises,
  findAll,
  findOneWithId,
  update,
  deleteRelationExercise
}
