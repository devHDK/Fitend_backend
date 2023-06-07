import {PoolConnection} from 'mysql'
import {IWorkoutFeedback, IWorkoutFeedbackCreate} from '../interfaces/workoutFeedbacks'
import {db} from '../loaders'

const tableName = 'WorkoutFeedbacks'
const tableWorkoutFeedbackWorkoutIssue = 'WorkoutFeedbacks-WorkoutIssues'
const tableWorkoutIssue = 'WorkoutIssues'

async function create(options: IWorkoutFeedbackCreate, connection?: PoolConnection): Promise<number> {
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

async function createRelationIssues(
  options: {
    issueIndexes: number[]
    workoutFeedbackId: number
  },
  connection: PoolConnection
): Promise<void> {
  const {issueIndexes, workoutFeedbackId} = options
  const values = issueIndexes.map((workoutIssueId) => `(${workoutIssueId}, ${workoutFeedbackId})`).join(',')
  try {
    await db.query({
      connection,
      sql: `INSERT INTO ?? (workoutIssueId, workoutFeedbackId) VALUES ${values}`,
      values: [tableWorkoutFeedbackWorkoutIssue]
    })
  } catch (e) {
    throw e
  }
}

async function findOneWithWorkoutScheduleId(workoutScheduleId: number): Promise<IWorkoutFeedback> {
  try {
    const [row] = await db.query({
      sql: `SELECT t.strengthIndex, t.contents, JSON_ARRAYAGG(wi.id) as issueIndexes
            FROM ?? t
            LEFT JOIN ?? fi ON fi.workoutFeedbackId = t.id
            LEFT JOIN ?? wi ON wi.id = fi.workoutIssueId  
            WHERE t.?
            GROUP BY t.id`,
      values: [tableName, tableWorkoutFeedbackWorkoutIssue, tableWorkoutIssue, {workoutScheduleId}]
    })
    return row
  } catch (e) {
    throw e
  }
}

export {
  tableName,
  tableWorkoutFeedbackWorkoutIssue,
  tableWorkoutIssue,
  create,
  createRelationIssues,
  findOneWithWorkoutScheduleId
}
