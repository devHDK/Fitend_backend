import {escape} from 'mysql'
import {
  IWorkoutScheduleList,
  IWorkoutScheduleFindAll,
  IWorkoutScheduleDetail,
  IWorkoutSchedule
} from '../interfaces/workoutSchedules'
import {db} from '../loaders'
import {WorkoutPlan, Workout, WorkoutFeedbacks, Exercise, Trainer, WorkoutRecords} from './index'

const tableName = 'WorkoutSchedules'

async function findAll(options: IWorkoutScheduleFindAll): Promise<[IWorkoutScheduleList]> {
  try {
    const {userId, startDate} = options
    return await db.query({
      sql: `SELECT DATE_FORMAT(t.startDate, '%Y-%m-%d') as startDate, 
            JSON_ARRAYAGG(JSON_OBJECT('workoutScheduleId', t.id , 'seq', t.seq, 'title', t.workoutTitle, 'subTitle', t.workoutSubTitle,
            'isComplete', t.isComplete)) as workouts
            FROM (
              SELECT ws.startDate, ws.id, ws.seq, ws.workoutTitle, ws.workoutSubTitle, IF(wf.workoutScheduleId, true, false) as isComplete
              FROM ?? ws
              JOIN ?? wp ON wp.workoutScheduleId = ws.id
              LEFT JOIN ?? wf ON wf.workoutScheduleId = ws.id
              WHERE ws.startDate BETWEEN '${startDate}' AND DATE_ADD('${startDate}', INTERVAL 30 DAY) AND ws.?
              GROUP BY ws.id
              ORDER BY ws.seq
            ) t
            GROUP BY t.startDate
            ORDER BY t.startDate`,
      values: [tableName, WorkoutPlan.tableName, WorkoutFeedbacks.tableName, {userId}]
    })
  } catch (e) {
    throw e
  }
}

async function findOne(workoutScheduleId: number): Promise<[IWorkoutScheduleDetail]> {
  try {
    const [row] = await db.query({
      sql: `SELECT t.id as workoutScheduleId, DATE_FORMAT(t.startDate, '%Y-%m-%d') as startDate, 
            t.workoutTitle, t.workoutSubTitle, 
            (
              SELECT JSON_ARRAYAGG(tm.type) 
              FROM ?? tm
              JOIN ?? et ON et.targetMuscleId = tm.id AND et.type = 'main'
              JOIN ?? wp ON wp.workoutScheduleId = t.id AND wp.exerciseId = et.exerciseId
            ) as targetMuscleTypes,
            t.totalTime as workoutTotalTime, IF(wf.workoutScheduleId, true, false) as isWorkoutComplete,
            (
              SELECT JSON_ARRAYAGG(
                JSON_OBJECT(
                'workoutPlanId', wp.id, 'name', e.name, 'description', e.description,
                'trackingFieldId', e.trackingFieldId,
                'targetMuscles', 
                (SELECT JSON_ARRAYAGG(JSON_OBJECT('name', tm.name, 'muscleType', tm.type, 'type', et.type, 'image', tm.image))
                FROM ?? tm
                JOIN ?? et ON et.exerciseId = e.id AND et.targetMuscleId = tm.id),
                'videos', e.videos, 'setInfo', wp.setInfo, 'trainerNickname', tra.nickname, 'trainerProfileImage', tra.profileImage
                )
              )
              FROM ?? e
              JOIN ?? wp ON wp.workoutScheduleId = t.id AND wp.exerciseId = e.id
              JOIN ?? tra ON tra.id = e.trainerId
            ) exercises
            FROM ?? t
            JOIN ?? wp ON wp.workoutScheduleId = t.id
            LEFT JOIN ?? wf ON wf.workoutScheduleId = t.id
            WHERE t.?
            GROUP BY t.id`,
      values: [
        Exercise.tableTargetMuscle,
        Exercise.tableExerciseTargetMuscle,
        WorkoutPlan.tableName,
        Exercise.tableTargetMuscle,
        Exercise.tableExerciseTargetMuscle,
        Exercise.tableName,
        WorkoutPlan.tableName,
        Trainer.tableName,
        tableName,
        WorkoutPlan.tableName,
        WorkoutFeedbacks.tableName,
        {id: workoutScheduleId}
      ]
    })
    if (row) row.targetMuscleTypes = [...new Set(row.targetMuscleTypes)]
    return row
  } catch (e) {
    throw e
  }
}

async function findOneWithId(id: number): Promise<IWorkoutSchedule> {
  try {
    const [row] = await db.query({
      sql: `SELECT t.*
            FROM ?? t
            WHERE t.?`,
      values: [tableName, {id}]
    })
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
            (SELECT COUNT(t.id) FROM ?? t
            JOIN ?? wp ON wp.workoutScheduleId = t.id
            JOIN ?? wr ON wr.workoutPlanId = wp.id
            WHERE t.id = t.id 
            GROUP BY t.id) as doneCount,
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

export {tableName, findAll, findOne, findOneWithId, findOneWithWorkoutPlanId, findCounts}
