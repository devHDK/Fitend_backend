import moment from 'moment-timezone'
import {db} from '../loaders'
import {WorkoutSchedule, WorkoutRecords, WorkoutFeedbacks, WorkoutStat} from '../models'
import {IWorkoutRecordDetail, IWorkoutRecordsCreate} from '../interfaces/workoutRecords'

moment.tz.setDefault('Asia/Seoul')

interface IWorkoutRecordDetailData {
  startDate: string
  strengthIndex: number
  issueIndex: number
  contents: string
  workoutRecords: [IWorkoutRecordDetail]
  scheduleRecords: {
    heartRates: [number]
    workoutDuration: number
  }
}

async function createRecords(userId: number, options: IWorkoutRecordsCreate): Promise<void> {
  const connection = await db.beginTransaction()
  try {
    const {records, scheduleRecords} = options

    const workoutSchedule = await WorkoutSchedule.findOneWithWorkoutPlanId(records[0].workoutPlanId)
    const today = moment().format('YYYY-MM-DD')
    const startDate = moment(workoutSchedule.startDate).format('YYYY-MM-DD')
    if (!workoutSchedule || workoutSchedule.userId !== userId) throw new Error('not_allowed')
    const workoutRecord = await WorkoutRecords.findOneWithWorkoutPlanId(records[0].workoutPlanId)
    if (workoutRecord) throw new Error('duplicate_record')
    for (let i = 0; i < records.length; i++) {
      const {workoutPlanId, setInfo} = records[i]
      await WorkoutRecords.create({workoutPlanId, setInfo: JSON.stringify(setInfo)}, connection)
    }
    await WorkoutStat.upsertOne(
      {
        userId,
        franchiseId: workoutSchedule.franchiseId,
        month: moment(startDate).startOf('month').format('YYYY-MM-DD'),
        doneCount: 1
      },
      connection
    )
    if (scheduleRecords)
      await WorkoutSchedule.createScheduleRecords(
        {
          workoutScheduleId: scheduleRecords.workoutScheduleId,
          heartRates: scheduleRecords.heartRates ?? JSON.stringify(scheduleRecords.heartRates),
          workoutDuration: scheduleRecords.workoutDuration
        },
        connection
      )

    connection.commit()
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
    const scheduleRecords = await WorkoutSchedule.findOneScheduleRecord(workoutScheduleId)
    return {
      startDate: moment(workoutSchedule.startDate).format('YYYY-MM-DD'),
      ...workoutFeedbacks,
      workoutRecords,
      scheduleRecords
    }
  } catch (e) {
    throw e
  }
}

export {createRecords, findOne}
