import moment from 'moment-timezone'
import {db} from '../loaders'
import {WorkoutSchedule, WorkoutRecords, WorkoutFeedbacks, WorkoutStat} from '../models'
import {IWorkoutRecordCreate, IWorkoutRecordDetail} from '../interfaces/workoutRecords'

moment.tz.setDefault('Asia/Seoul')

interface IWorkoutRecordDetailData {
  startDate: string
  strengthIndex: number
  issueIndex: number
  contents: string
  workoutRecords: [IWorkoutRecordDetail]
}

async function createRecords(userId: number, options: IWorkoutRecordCreate[]): Promise<void> {
  const connection = await db.beginTransaction()
  try {
    const workoutSchedule = await WorkoutSchedule.findOneWithWorkoutPlanId(options[0].workoutPlanId)
    const today = moment().format('YYYY-MM-DD')
    const startDate = moment(workoutSchedule.startDate).format('YYYY-MM-DD')
    if (!workoutSchedule || workoutSchedule.userId !== userId) throw new Error('not_allowed')
    const workoutRecord = await WorkoutRecords.findOneWithWorkoutPlanId(options[0].workoutPlanId)
    if (workoutRecord) throw new Error('duplicate_record')
    for (let i = 0; i < options.length; i++) {
      const {workoutPlanId, setInfo} = options[i]
      await WorkoutRecords.create({workoutPlanId, setInfo: JSON.stringify(setInfo)}, connection)
    }
    await WorkoutStat.upsertOne(
      {
        userId,
        franchiseId: workoutSchedule.franchiseId,
        month: moment().startOf('month').format('YYYY-MM-DD'),
        doneCount: 1
      },
      connection
    )
    await db.commit(connection)
  } catch (e) {
    if (connection) await db.rollback(connection)
    throw e
  }
}

async function findOne(workoutScheduleId: number): Promise<IWorkoutRecordDetailData> {
  try {
    const workoutSchedule = await WorkoutSchedule.findOneWithId(workoutScheduleId)
    const workoutFeedbacks = await WorkoutFeedbacks.findOneWithWorkoutScheduleId(workoutScheduleId)
    delete workoutFeedbacks.createdAt
    const workoutRecords = await WorkoutRecords.findAllWithWorkoutScheduleId(workoutScheduleId)
    return {startDate: moment(workoutSchedule.startDate).format('YYYY-MM-DD'), ...workoutFeedbacks, workoutRecords}
  } catch (e) {
    throw e
  }
}

export {createRecords, findOne}
