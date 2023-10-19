import moment from 'moment-timezone'
import {PoolConnection, escape} from 'mysql'
import {
  IWorkoutScheduleList,
  IWorkoutScheduleFindAll,
  IWorkoutScheduleDetail,
  IWorkoutSchedule,
  IWorkoutScheduleCreate,
  IWorkoutScheduleUpdate,
  IWorkoutScheduleListForTrainer
} from '../interfaces/workoutSchedules'
import {db} from '../loaders'
import {WorkoutPlan, WorkoutFeedbacks, Exercise, Trainer, WorkoutRecords, User, WorkoutSchedule} from './index'

moment.tz.setDefault('Asia/Seoul')

const tableName = 'WorkoutSchedules'
const tableWorkoutScheduleRecords = 'WorkoutScheduleRecords'

async function create(options: IWorkoutScheduleCreate, connection?: PoolConnection): Promise<number> {
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

async function createScheduleRecords(
  options: {workoutScheduleId: number; heartRates?: string; workoutDuration?: number},
  connection?: PoolConnection
) {
  try {
    await db.query({
      connection,
      sql: `INSERT INTO ?? SET ?`,
      values: [tableWorkoutScheduleRecords, options]
    })
  } catch (e) {
    throw e
  }
}

async function findAll(options: IWorkoutScheduleFindAll): Promise<[IWorkoutScheduleList]> {
  try {
    const {userId, startDate, interval} = options
    return await db.query({
      sql: `SELECT DATE_FORMAT(t.startDate, '%Y-%m-%d') as startDate, 
            JSON_ARRAYAGG(JSON_OBJECT('workoutScheduleId', t.id , 'seq', t.seq, 'title', t.workoutTitle, 'subTitle', t.workoutSubTitle,
            'isComplete', t.isComplete, 'isRecord', t.isRecord)) as workouts
            FROM (
              SELECT ws.startDate, ws.id, ws.seq, ws.workoutTitle, ws.workoutSubTitle, 
              IF(wf.workoutScheduleId, true, false) as isComplete,
              IF(wr.workoutPlanId, true, false) as isRecord
              FROM ?? ws
              JOIN ?? wp ON wp.workoutScheduleId = ws.id
              LEFT JOIN ?? wf ON wf.workoutScheduleId = ws.id
              LEFT JOIN ?? wr ON wr.workoutPlanId = wp.id
              WHERE ws.startDate BETWEEN '${startDate}' AND 
              DATE_ADD('${startDate}', INTERVAL ${interval ? escape(interval) : 30} DAY) AND ws.?
              GROUP BY ws.id 
              ORDER BY ws.seq
            ) t
            GROUP BY t.startDate
            ORDER BY t.startDate`,
      values: [tableName, WorkoutPlan.tableName, WorkoutFeedbacks.tableName, WorkoutRecords.tableName, {userId}]
    })
  } catch (e) {
    throw e
  }
}

async function findAllForTrainer(options: IWorkoutScheduleFindAll): Promise<[IWorkoutScheduleListForTrainer]> {
  try {
    const {userId, startDate, endDate} = options
    return await db.query({
      sql: `SELECT DATE_FORMAT(ws.startDate, '%Y-%m-%d') as startDate, ws.id as workoutScheduleId, ws.workoutId,
              ws.seq, ws.workoutTitle as title, ws.workoutSubTitle as subTitle,
              IF(wf.workoutScheduleId, true, false) as isComplete,
              IF(wr.workoutPlanId, true, false) as isRecord
              FROM ?? ws
              JOIN ?? wp ON wp.workoutScheduleId = ws.id
              LEFT JOIN ?? wf ON wf.workoutScheduleId = ws.id
              LEFT JOIN ?? wr ON wr.workoutPlanId = wp.id
              WHERE ws.startDate BETWEEN 
              ${escape(startDate)} AND 
              ${endDate ? escape(endDate) : escape(moment(startDate).add(30, 'day').format('YYYY-MM-DD'))}
              AND ws.?
              GROUP BY ws.id
              ORDER BY ws.startDate`,
      values: [tableName, WorkoutPlan.tableName, WorkoutFeedbacks.tableName, WorkoutRecords.tableName, {userId}]
    })
  } catch (e) {
    throw e
  }
}

async function findOneWithId(workoutScheduleId: number): Promise<IWorkoutScheduleDetail> {
  try {
    const [row] = await db.query({
      sql: `SELECT t.id as workoutScheduleId, DATE_FORMAT(t.startDate, '%Y-%m-%d') as startDate, 
            t.workoutTitle, t.workoutSubTitle, t.trainerId,
            (
              SELECT JSON_ARRAYAGG(tm.type) 
              FROM ?? tm
              JOIN ?? et ON et.targetMuscleId = tm.id AND et.type = 'main'
              JOIN ?? wp ON wp.workoutScheduleId = t.id AND wp.exerciseId = et.exerciseId
            ) as targetMuscleTypes,
            t.totalTime as workoutTotalTime, 
            IF(wf.workoutScheduleId, true, false) as isWorkoutComplete,
            IF(wr.workoutPlanId, true, false) as isRecord
            FROM ?? t
            JOIN ?? wp ON wp.workoutScheduleId = t.id
            LEFT JOIN ?? wf ON wf.workoutScheduleId = t.id
            LEFT JOIN ?? wr ON wr.workoutPlanId = wp.id
            WHERE t.?
            GROUP BY t.id`,
      values: [
        Exercise.tableTargetMuscle,
        Exercise.tableExerciseTargetMuscle,
        WorkoutPlan.tableName,
        tableName,
        WorkoutPlan.tableName,
        WorkoutFeedbacks.tableName,
        WorkoutRecords.tableName,
        {id: workoutScheduleId}
      ]
    })
    if (row) row.targetMuscleTypes = [...new Set(row.targetMuscleTypes)]
    return row
  } catch (e) {
    throw e
  }
}

async function findOne(workoutScheduleId: number): Promise<IWorkoutSchedule> {
  try {
    const [row] = await db.query({
      sql: `SELECT t.* FROM ?? t WHERE t.?`,
      values: [tableName, {id: workoutScheduleId}]
    })
    return row
  } catch (e) {
    throw e
  }
}

async function findUsernameWithWorkoutScheduleId(
  workoutScheduleId: number
): Promise<{trainerId: number; userNickname: string}> {
  try {
    const [row] = await db.query({
      sql: `SELECT t.trainerId, u.nickname as userNickname
            FROM ?? t 
            JOIN ?? u ON u.id = t.userId
            WHERE t.?`,
      values: [tableName, User.tableName, {id: workoutScheduleId}]
    })
    return row
  } catch (e) {
    throw e
  }
}

async function findOneScheduleRecord(
  workoutScheduleId: number
): Promise<{heartRates: [number]; workoutDuration: number}> {
  try {
    const [row] = await db.query({
      sql: `SELECT t.heartRates, t.workoutDuration FROM ?? t WHERE t.?`,
      values: [tableWorkoutScheduleRecords, {workoutScheduleId}]
    })
    return row
  } catch (e) {
    throw e
  }
}

async function findOneForTrainer(workoutScheduleId: number): Promise<IWorkoutScheduleDetail> {
  try {
    const [row] = await db.query({
      sql: `SELECT t.id as workoutScheduleId, DATE_FORMAT(t.startDate, '%Y-%m-%d') as startDate, 
            t.workoutTitle, t.workoutSubTitle, t.seq, wsr.heartRates, wsr.workoutDuration,
            (
              SELECT JSON_ARRAYAGG(tm.type) 
              FROM ?? tm
              JOIN ?? et ON et.targetMuscleId = tm.id AND et.type = 'main'
              JOIN ?? wp ON wp.workoutScheduleId = t.id AND wp.exerciseId = et.exerciseId
            ) as targetMuscleTypes,
            t.totalTime as workoutTotalTime, IF(wf.workoutScheduleId, true, false) as isWorkoutComplete,
            wf.strengthIndex, wf.contents,
            (
              SELECT JSON_ARRAYAGG(wi.id) 
              FROM ?? wi
              JOIN ?? fi ON fi.workoutFeedbackId = wf.id AND fi.workoutIssueId = wi.id
            ) as issueIndexes,
            tra.nickname as trainerNickname, tra.profileImage as trainerProfileImage,
            (
              SELECT JSON_ARRAYAGG(
                JSON_OBJECT(
                'workoutPlanId', wp.id, 'exerciseId', wp.exerciseId, 'name', e.name, 'description', e.description,
                'trackingFieldId', e.trackingFieldId,
                'targetMuscles', 
                (SELECT JSON_ARRAYAGG(JSON_OBJECT('name', tm.name, 'type', et.type))
                FROM ?? tm
                JOIN ?? et ON et.exerciseId = e.id AND et.targetMuscleId = tm.id),
                'videos', e.videos, 'setInfo', wp.setInfo, 'circuitGroupNum', wp.circuitGroupNum,
                'setType', wp.setType, 'circuitSeq', wp.circuitSeq,
                'recordSetInfo', wr.setInfo
                )
              )
              FROM ?? e
              JOIN ?? wp ON wp.workoutScheduleId = t.id AND wp.exerciseId = e.id
              LEFT JOIN ?? wr ON wr.workoutPlanId = wp.id
            ) exercises
            FROM ?? t
            JOIN ?? wp ON wp.workoutScheduleId = t.id
            JOIN ?? tra ON tra.id = t.trainerId
            LEFT JOIN ?? wf ON wf.workoutScheduleId = t.id
            LEFT JOIN ?? wsr ON wsr.workoutScheduleId = t.id
            WHERE t.?
            GROUP BY t.id`,
      values: [
        Exercise.tableTargetMuscle,
        Exercise.tableExerciseTargetMuscle,
        WorkoutPlan.tableName,
        WorkoutFeedbacks.tableWorkoutIssue,
        WorkoutFeedbacks.tableWorkoutFeedbackWorkoutIssue,
        Exercise.tableTargetMuscle,
        Exercise.tableExerciseTargetMuscle,
        Exercise.tableName,
        WorkoutPlan.tableName,
        WorkoutRecords.tableName,
        tableName,
        WorkoutPlan.tableName,
        Trainer.tableName,
        WorkoutFeedbacks.tableName,
        tableWorkoutScheduleRecords,
        {id: workoutScheduleId}
      ]
    })
    if (row) row.targetMuscleTypes = [...new Set(row.targetMuscleTypes)]
    return row
  } catch (e) {
    throw e
  }
}

async function findOneWithWorkoutPlanId(workoutPlanId: number): Promise<IWorkoutSchedule> {
  try {
    const [row] = await db.query({
      sql: `SELECT t.*
            FROM ?? t
            JOIN ?? wp ON wp.workoutScheduleId = t.id AND wp.id = ?
            GROUP BY t.id`,
      values: [tableName, WorkoutPlan.tableName, workoutPlanId]
    })
    return row
  } catch (e) {
    throw e
  }
}

async function findCounts(
  userId: number
): Promise<{
  thisMonthCount: number
  asOfTodayCount: number
  doneCount: number
  recentDate: string
}> {
  try {
    const [row] = await db.query({
      sql: `SELECT 
            (SELECT COUNT(t.id) FROM ?? t WHERE t.userId = ${escape(userId)} AND 
            t.startDate BETWEEN 
              (LAST_DAY(NOW() - interval 1 month) + interval 1 DAY) 
              AND (LAST_DAY(NOW()))) as thisMonthCount,
            (SELECT COUNT(t.id) FROM ?? t WHERE t.userId = ${escape(userId)} AND
            t.startDate < NOW()) as asOfTodayCount,
            (SELECT COUNT(t.id)
              FROM (SELECT t.id
              FROM ?? t
              JOIN ?? wp ON wp.workoutScheduleId = t.id
              JOIN ?? wr ON wr.workoutPlanId = wp.id
              WHERE t.userId = ${escape(userId)}
              GROUP BY t.id
              ) t 
            ) as doneCount,
            (SELECT DATE_FORMAT(t.startDate, '%Y-%m-%d') 
            FROM ?? t
            JOIN ?? wp ON wp.workoutScheduleId = t.id
            JOIN ?? wr ON wr.workoutPlanId = wp.id
            WHERE t.userId = ${escape(userId)} 
            GROUP BY t.id 
            ORDER BY t.startDate DESC
            LIMIT 1) as recentDate
            `,
      values: [
        tableName,
        tableName,
        tableName,
        WorkoutPlan.tableName,
        WorkoutRecords.tableName,
        tableName,
        WorkoutPlan.tableName,
        WorkoutRecords.tableName,
        tableName,
        userId
      ]
    })
    return row
  } catch (e) {
    throw e
  }
}

async function update(options: IWorkoutScheduleUpdate, connection?: PoolConnection): Promise<void> {
  const {id, ...data} = options
  try {
    await db.query({
      connection,
      sql: `UPDATE ?? SET ? WHERE ?`,
      values: [tableName, data, {id}]
    })
  } catch (e) {
    throw e
  }
}

async function deleteOne(id: number, connection: PoolConnection): Promise<void> {
  try {
    await db.query({
      connection,
      sql: `DELETE FROM ?? WHERE ?`,
      values: [tableName, {id}]
    })
  } catch (e) {
    throw e
  }
}

export {
  tableName,
  tableWorkoutScheduleRecords,
  create,
  createScheduleRecords,
  findAll,
  findAllForTrainer,
  findOneWithId,
  findOne,
  findUsernameWithWorkoutScheduleId,
  findOneScheduleRecord,
  findOneForTrainer,
  findOneWithWorkoutPlanId,
  findCounts,
  update,
  deleteOne
}
