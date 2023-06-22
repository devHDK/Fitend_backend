import moment from 'moment-timezone'
import {escape, PoolConnection} from 'mysql'
import {db} from '../loaders'
import {IWorkoutCreate, IWorkoutDetail, IWorkoutFindAll, IWorkoutList, IWorkUpdate} from '../interfaces/workout'
import {Trainer, Exercise} from './'
import {tableTrainerExercise} from './exercise'

moment.tz.setDefault('Asia/Seoul')

const tableName = 'Workouts'
const tableWorkoutExercise = 'Workouts-Exercises'
const tableTrainerWorkout = 'Trainers-Workouts'

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

async function createRelationBookmark(workoutId: number, trainerId: number): Promise<void> {
  try {
    await db.query({
      sql: `INSERT INTO ?? SET ?`,
      values: [tableTrainerWorkout, {workoutId, trainerId}]
    })
  } catch (e) {
    throw e
  }
}

async function findAll(options: IWorkoutFindAll): Promise<IWorkoutList> {
  const {search, trainerId, isMe, isBookmark, types, start, perPage} = options
  try {
    const where = []
    if (search) where.push(`t.title like ${escape(`%${search}%`)}`)
    if (isMe) where.push(`t.trainerId = ${trainerId}`)
    const rows = await db.query({
      sql: `SELECT t.id, t.title, t.subTitle, t.totalTime, 
            JSON_ARRAYAGG(tm.type) as primaryTypes,
            t.trainerId, tr.nickname as trainerNickname, t.updatedAt, IF(tw.trainerId, true, false) as isBookmark
            FROM ?? t
            JOIN ?? we ON we.workoutId = t.id
            JOIN ?? et ON et.exerciseId = we.exerciseId AND et.type = 'main'
            JOIN ?? tm ON tm.id = et.targetMuscleId ${
              types && types.length > 0 ? `AND tm.type IN ('${types.join(`','`)}')` : ``
            }
            JOIN ?? tr ON tr.id = t.trainerId
            ${isBookmark ? `JOIN` : `LEFT JOIN`} ?? tw ON tw.workoutId = t.id AND tw.trainerId = ${escape(trainerId)}
            ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
            GROUP BY t.id
            ORDER BY t.createdAt DESC
            LIMIT ${start}, ${perPage}`,
      values: [
        tableName,
        tableWorkoutExercise,
        Exercise.tableExerciseTargetMuscle,
        Exercise.tableTargetMuscle,
        Trainer.tableName,
        tableTrainerWorkout
      ]
    })
    const [rowTotal] = await db.query({
      sql: `SELECT COUNT(1) as total FROM ?? t
            ${isBookmark ? `JOIN` : `LEFT JOIN`} ?? tw ON tw.workoutId = t.id AND tw.trainerId = t.trainerId
            ${
              types && types.length > 0
                ? `
                  JOIN ?? we ON we.workoutId = t.id
                  JOIN ?? et ON et.exerciseId = we.exerciseId AND et.type = 'main'
                  JOIN ?? tm ON tm.id = et.targetMuscleId AND tm.type IN ('${types.join(`','`)}')
                  `
                : ``
            }
            ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      `,
      values: [
        tableName,
        tableTrainerWorkout,
        tableWorkoutExercise,
        Exercise.tableExerciseTargetMuscle,
        Exercise.tableTargetMuscle
      ]
    })
    return {data: rows, total: rowTotal ? rowTotal.total : 0}
  } catch (e) {
    throw e
  }
}

async function findOneWithId(id: number, trainerId: number): Promise<IWorkoutDetail> {
  try {
    const [row] = await db.query({
      sql: `SELECT t.id, t.title, t.subTitle, t.totalTime,
            (SELECT JSON_ARRAYAGG(t.type) 
              FROM (
                SELECT DISTINCT tm.type
                FROM ?? we
                JOIN ?? et ON et.exerciseId = we.exerciseId AND et.type = 'main'
                JOIN ?? tm ON tm.id = et.targetMuscleId
                WHERE we.workoutId = t.id
              ) t
            ) as primaryTypes,
            t.trainerId, tr.nickname as trainerNickname, tr.profileImage as trainerProfileImage, t.updatedAt,
            JSON_ARRAYAGG(
              JSON_OBJECT('id', e.id, 'videos', e.videos, 'name', e.name, 'trackingFieldId', e.trackingFieldId ,'setInfo', we.setInfo,
              'targetMuscles', (SELECT JSON_ARRAYAGG(t.name) 
                FROM (
                  SELECT DISTINCT tm.name
                  FROM ?? we
                  JOIN ?? et ON et.exerciseId = e.id
                  JOIN ?? tm ON tm.id = et.targetMuscleId
                  WHERE we.workoutId = t.id
                ) t
               ) 
              )
            ) as exercises, IF(tw.trainerId, true, false) as isBookmark
            FROM ?? t
            JOIN ?? we ON we.workoutId = t.id
            JOIN ?? e ON e.id = we.exerciseId
            JOIN ?? tr ON tr.id = t.trainerId
            LEFT JOIN ?? tw ON tw.workoutId = t.id AND tw.trainerId = ${escape(trainerId)}
            WHERE t.?
            GROUP BY t.id`,
      values: [
        tableWorkoutExercise,
        Exercise.tableExerciseTargetMuscle,
        Exercise.tableTargetMuscle,
        tableWorkoutExercise,
        Exercise.tableExerciseTargetMuscle,
        Exercise.tableTargetMuscle,
        tableName,
        tableWorkoutExercise,
        Exercise.tableName,
        Trainer.tableName,
        tableTrainerWorkout,
        {id}
      ]
    })
    return row
  } catch (e) {
    throw e
  }
}

async function findBookmark(workoutId: number, trainerId: number): Promise<{id: number; name: string}> {
  try {
    const [row] = await db.query({
      sql: `SELECT * FROM ?? WHERE ? AND ?`,
      values: [tableTrainerWorkout, {workoutId}, {trainerId}]
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

async function deleteRelationBookmark(workoutId: number, trainerId: number): Promise<void> {
  try {
    await db.query({
      sql: `DELETE FROM ?? WHERE ? AND ?`,
      values: [tableTrainerWorkout, {workoutId}, {trainerId}]
    })
  } catch (e) {
    throw e
  }
}

export {
  tableName,
  tableWorkoutExercise,
  tableTrainerWorkout,
  create,
  createRelationExercises,
  createRelationBookmark,
  findAll,
  findOneWithId,
  findBookmark,
  update,
  deleteRelationExercise,
  deleteRelationBookmark
}
