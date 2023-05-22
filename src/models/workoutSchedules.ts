import {IWorkoutScheduleList, IWorkoutScheduleFindAll} from '../interfaces/workoutSchedules'
import {db} from '../loaders'
import {WorkoutPlan, Workout, WorkoutFeedbacks} from './index'

const tableName = 'WorkoutSchedules'

async function findAll(options: IWorkoutScheduleFindAll): Promise<[IWorkoutScheduleList]> {
  try {
    const {userId, startDate} = options
    return await db.query({
      sql: `SELECT DATE_FORMAT(t.startDate, '%Y-%m-%d') as startDate, 
            JSON_ARRAYAGG(JSON_OBJECT('scheduleId', t.id, 'seq', t.seq, 'title', w.title, 'subTitle', w.subTitle,
            'isComplete', IF(wf.workoutScheduleId, true, false))) as workouts
            FROM ?? t
            JOIN ?? wp ON wp.workoutScheduleId = t.id
            JOIN ?? w ON w.id = wp.workoutId
            LEFT JOIN ?? wf ON wf.workoutScheduleId = t.id
            WHERE t.startDate BETWEEN '${startDate}' AND DATE_ADD('${startDate}', INTERVAL 31 DAY) AND t.?
            GROUP BY t.startDate
            ORDER BY t.startDate`,
      values: [tableName, WorkoutPlan.tableName, Workout.tableName, WorkoutFeedbacks.tableName, {userId}]
    })
  } catch (e) {
    throw e
  }
}

export {tableName, findAll}
