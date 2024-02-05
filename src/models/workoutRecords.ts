import moment from 'moment-timezone'
import {PoolConnection, escape} from 'mysql'
import {
  IWorkoutRecord,
  IWorkoutRecordSetInfoCreate,
  IWorkoutRecordDetail,
  IWorkoutHistory
} from '../interfaces/workoutRecords'
import {db} from '../loaders'
import {
  Exercise,
  StandardExercise,
  Ticket,
  Trainer,
  User,
  WorkoutFeedbacks,
  WorkoutPlan,
  WorkoutRecords,
  WorkoutSchedule,
  WorkoutStat
} from './index'

moment.tz.setDefault('Asia/Seoul')

const tableName = 'WorkoutRecords'

async function create(options: IWorkoutRecordSetInfoCreate, connection?: PoolConnection): Promise<void> {
  try {
    await db.query({
      connection,
      sql: `INSERT INTO ?? SET ?`,
      values: [tableName, options]
    })
  } catch (e) {
    throw e
  }
}

async function findOneWithWorkoutPlanId(workoutPlanId: number): Promise<IWorkoutRecord> {
  try {
    const [row] = await db.query({
      sql: `SELECT * FROM ?? WHERE workoutPlanId = ?`,
      values: [tableName, workoutPlanId]
    })
    return row
  } catch (e) {
    throw e
  }
}

async function findAllWithWorkoutScheduleId(workoutScheduleId: number): Promise<[IWorkoutRecordDetail]> {
  try {
    return await db.query({
      sql: `SELECT stde.name as exerciseName, JSON_ARRAYAGG(tm.name) as targetMuscles,
            t.setInfo, stde.trackingFieldId, t.workoutPlanId
            FROM ?? t
            JOIN ?? wp ON wp.id = t.workoutPlanId AND wp.workoutScheduleId = ?
            JOIN ?? e ON e.id = wp.exerciseId 
            JOIN ?? se ON se.exerciseId = e.id
            JOIN ?? stde ON stde.id = se.standardExerciseId
            JOIN ?? setm ON setm.standardExerciseId = stde.id
            JOIN ?? tm ON tm.id = setm.targetMuscleId 
            GROUP BY t.id`,
      values: [
        tableName,
        WorkoutPlan.tableName,
        workoutScheduleId,
        Exercise.tableName,
        StandardExercise.tableStandardExercisesExercises,
        StandardExercise.tableName,
        StandardExercise.tableStandardExerciseTargetMuscle,
        Exercise.tableTargetMuscle
      ]
    })
  } catch (e) {
    throw e
  }
}

async function findAllToday(
  franchiseId: number,
  today: string,
  trainerId: number
): Promise<
  [
    {
      userId: number
      userNickname: string
      trainerNickname: string
      createdAt: string
    }
  ]
> {
  try {
    const todayStart = moment(today).startOf('day').subtract(9, 'hour').format('YYYY-MM-DDTHH:mm:ss')
    const todayEnd = moment(today).endOf('day').subtract(9, 'hour').format('YYYY-MM-DDTHH:mm:ss')
    return await db.query({
      sql: `SELECT u.id as userId, u.nickname as userNickname, tra.nickname as trainerNickname, t.createdAt, ws.id as workoutScheduleId
            FROM ?? t
            JOIN ?? wp ON wp.id = t.workoutPlanId
            JOIN ?? ws ON ws.id = wp.workoutScheduleId
            JOIN ?? ft ON ft.trainerId = ws.trainerId AND ft.franchiseId = ?
            JOIN ?? tra ON tra.id = ft.trainerId 
            JOIN ?? u ON u.id = ws.userId
            WHERE ws.startDate BETWEEN ${escape(todayStart)} AND ${escape(todayEnd)}
            ${trainerId ? `AND ws.trainerId = ${escape(trainerId)}` : ''}
            GROUP BY ws.id
            ORDER BY t.createdAt DESC
            `,
      values: [
        tableName,
        WorkoutPlan.tableName,
        WorkoutSchedule.tableName,
        Trainer.tableFranchiseTrainer,
        franchiseId,
        Trainer.tableName,
        User.tableName
      ]
    })
  } catch (e) {
    throw e
  }
}

async function findAllYesterday(
  franchiseId: number,
  today: string,
  trainerId: number
): Promise<
  [
    {
      userId: number
      memberNickname: string
      trainerNickname: string
    }
  ]
> {
  try {
    const todayStart = moment(today).startOf('day').subtract(33, 'hour').format('YYYY-MM-DDTHH:mm:ss')
    const todayEnd = moment(today).endOf('day').subtract(33, 'hour').format('YYYY-MM-DDTHH:mm:ss')
    return await db.query({
      sql: `SELECT u.id as userId, u.nickname as userNickname, tra.nickname as trainerNickname,
            wf.id as workoutFeedbackId
            FROM ?? t
            JOIN ?? ft ON ft.trainerId = t.trainerId AND ft.franchiseId = ?
            JOIN ?? tra ON tra.id = ft.trainerId 
            JOIN ?? u ON u.id = t.userId
            LEFT JOIN ?? wf ON wf.workoutScheduleId = t.id
            WHERE t.startDate BETWEEN ${escape(todayStart)} AND ${escape(todayEnd)}
            ${trainerId ? `AND ft.trainerId = ${escape(trainerId)}` : ''}
            GROUP BY t.id
            HAVING workoutFeedbackId is null`,
      values: [
        WorkoutSchedule.tableName,
        Trainer.tableFranchiseTrainer,
        franchiseId,
        Trainer.tableName,
        User.tableName,
        WorkoutFeedbacks.tableName
      ]
    })
  } catch (e) {
    throw e
  }
}

async function findAllUsers(
  franchiseId: number,
  today: string,
  trainerId: number
): Promise<
  [
    {
      userId: number
      userNickname: string
      monthCount: number
      doneCount: number
      recentDate: string
      trainers: string[]
    }
  ]
> {
  try {
    const month = moment(today).startOf('month').format('YYYY-MM-DD')
    return await db.query({
      sql: `SELECT t.id as userId, t.nickname as userNickname, wst.monthCount, wst.doneCount,
            (SELECT DATE_FORMAT(ws.startDate, '%Y-%m-%d') FROM ?? ws 
            JOIN ?? wp ON wp.workoutScheduleId = ws.id
            JOIN ?? wr ON wr.workoutPlanId = wp.id
            WHERE ws.userId = t.id AND ws.franchiseId = ${escape(franchiseId)} 
            ORDER BY ws.startDate DESC
            LIMIT 1) as recentDate,
            JSON_ARRAYAGG(tra.nickname) as trainers
            FROM ?? t
            JOIN ?? wst ON wst.userId = t.id AND wst.franchiseId = ${escape(franchiseId)} 
            AND wst.month = ${escape(month)}
            LEFT JOIN (
            SELECT tr2.userId, tr2.trainerId FROM ?? tr2 GROUP BY tr2.userId, tr2.trainerId
            ) tr ON tr.userId = t.id
            LEFT JOIN ?? tra ON tra.id = tr.trainerId 
            ${trainerId ? `WHERE tra.id = ${escape(trainerId)}` : ''}
            GROUP BY t.id`,
      values: [
        WorkoutSchedule.tableName,
        WorkoutPlan.tableName,
        WorkoutRecords.tableName,
        User.tableName,
        WorkoutStat.tableName,
        Ticket.tableTicketRelation,
        Trainer.tableName
      ]
    })
  } catch (e) {
    throw e
  }
}

async function findWorkoutHistoryWithExerciseId(
  exerciseId: number,
  userId: number,
  start: number,
  perPage: number
): Promise<{data: [IWorkoutHistory]; total: number}> {
  try {
    const where = [`t.userId = ${escape(userId)}`]

    const rows = await db.query({
      sql: `SELECT t.startDate, wr.id as workoutRecordId, wr.workoutPlanId, wr.setInfo,
            (SELECT stde.name FROM ?? e
             JOIN ?? se ON se.exerciseId = ${escape(exerciseId)} 
             JOIN ?? stde ON stde.id = se.standardExerciseId
             WHERE e.id = ${escape(exerciseId)}
            ) as exerciseName
            FROM ?? t 
            JOIN ?? wp ON wp.workoutScheduleId = t.id AND wp.exerciseId = ${escape(exerciseId)}
            JOIN ?? wr ON wr.workoutPlanId = wp.id 
            ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
            ORDER BY t.startDate DESC
            LIMIT ${start}, ${perPage}`,
      values: [
        Exercise.tableName,
        StandardExercise.tableStandardExercisesExercises,
        StandardExercise.tableName,
        WorkoutSchedule.tableName,
        WorkoutPlan.tableName,
        tableName
      ]
    })
    const [rowTotal] = await db.query({
      sql: `SELECT COUNT(1) as total 
            FROM
            (SELECT wr.*
            FROM ?? t 
            JOIN ?? wp ON wp.workoutScheduleId = t.id AND wp.exerciseId = ${escape(exerciseId)}
            JOIN ?? wr ON wr.workoutPlanId = wp.id 
            ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
            ) t
            `,
      values: [WorkoutSchedule.tableName, WorkoutPlan.tableName, tableName]
    })
    return {data: rows, total: rowTotal ? rowTotal.total : 0}
  } catch (e) {
    throw e
  }
}

export {
  tableName,
  create,
  findOneWithWorkoutPlanId,
  findAllWithWorkoutScheduleId,
  findAllToday,
  findAllYesterday,
  findAllUsers,
  findWorkoutHistoryWithExerciseId
}
