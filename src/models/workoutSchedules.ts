import {IWorkoutScheduleList, IWorkoutScheduleFindAll, IWorkoutScheduleDetail} from '../interfaces/workoutSchedules'
import {db} from '../loaders'
import {WorkoutPlan, Workout, WorkoutFeedbacks, Exercise} from './index'

const tableName = 'WorkoutSchedules'

async function findAll(options: IWorkoutScheduleFindAll): Promise<[IWorkoutScheduleList]> {
  try {
    const {userId, startDate} = options
    return await db.query({
      sql: `SELECT DATE_FORMAT(t.startDate, '%Y-%m-%d') as startDate, 
            JSON_ARRAYAGG(JSON_OBJECT('workoutScheduleId', t.id , 'seq', t.seq, 'title', t.title, 'subTitle', t.subTitle,
            'isComplete', t.isComplete)) as workouts
            FROM (
              SELECT ws.startDate, ws.id, ws.seq, w.title, w.subTitle, IF(wf.workoutScheduleId, true, false) as isComplete
              FROM ?? ws
              JOIN ?? wp ON wp.workoutScheduleId = ws.id
              JOIN ?? w ON w.id = wp.workoutId
              LEFT JOIN ?? wf ON wf.workoutScheduleId = ws.id
              WHERE ws.startDate BETWEEN '${startDate}' AND DATE_ADD('${startDate}', INTERVAL 31 DAY) AND ws.?
              GROUP BY ws.id
              ORDER BY ws.seq
            ) t
            GROUP BY t.startDate
            ORDER BY t.startDate`,
      values: [tableName, WorkoutPlan.tableName, Workout.tableName, WorkoutFeedbacks.tableName, {userId}]
    })
  } catch (e) {
    throw e
  }
}

async function findOne(workoutScheduleId: number): Promise<[IWorkoutScheduleDetail]> {
  try {
    const [row] = await db.query({
      sql: `SELECT t.id as workoutScheduleId, DATE_FORMAT(t.startDate, '%Y-%m-%d') as startDate, 
            w.title as workoutTitle, w.subTitle as workoutSubTitle, (SELECT JSON_ARRAYAGG(tm.type) 
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
                'videos', e.videos, 'setInfo', wp.setInfo
                )
              )
              FROM ?? e
              JOIN ?? wp ON wp.workoutScheduleId = t.id AND wp.exerciseId = e.id
            ) exercises
            FROM ?? t
            JOIN ?? wp ON wp.workoutScheduleId = t.id
            JOIN ?? w ON w.id = wp.workoutId
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
        tableName,
        WorkoutPlan.tableName,
        Workout.tableName,
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

export {tableName, findAll, findOne}
