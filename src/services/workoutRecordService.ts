import moment from 'moment-timezone'
import {db, firebase} from '../loaders'
import {
  WorkoutSchedule,
  WorkoutRecords,
  WorkoutFeedbacks,
  WorkoutStat,
  Thread,
  User,
  WorkoutPlan,
  StandardExercise,
  Exercise
} from '../models'
import {IWorkoutRecordDetail, IWorkoutRecordsCreate, IWorkoutHistory} from '../interfaces/workoutRecords'
import {IWorkoutScheduleList} from '../interfaces/workoutSchedules'
import {IThread, IThreadCreatedId} from '../interfaces/thread'

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
    calories: number
  }
  // threads: IThread[]
}

async function createRecords(userId: number, options: IWorkoutRecordsCreate): Promise<IThreadCreatedId | null> {
  const connection = await db.beginTransaction()
  try {
    const {records, scheduleRecords, workoutInfo} = options
    let threadId: number

    const workoutSchedule = await WorkoutSchedule.findOneWithWorkoutPlanId(records[0].workoutPlanId)
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
    await WorkoutSchedule.createScheduleRecords(
      {
        workoutScheduleId: scheduleRecords.workoutScheduleId,
        heartRates: scheduleRecords.heartRates ?? JSON.stringify(scheduleRecords.heartRates),
        workoutDuration: scheduleRecords.workoutDuration,
        calories: scheduleRecords.calories
      },
      connection
    )
    if (workoutInfo) {
      const {trainerId, ...data} = workoutInfo
      const user = await User.findOne({id: userId})
      threadId = await Thread.create(
        {
          type: 'record',
          workoutScheduleId: scheduleRecords.workoutScheduleId,
          trainerId,
          userId,
          writerType: 'user',
          content: '오늘의 운동을 완료했어요!',
          workoutInfo: JSON.stringify(data)
        },
        connection
      )
      // await firebase.sendToTopic(`trainer_${trainerId}`, {
      //   notification: {body: `${user.nickname}님이 새로운 스레드를 올렸어요`}
      // })
    }

    await db.commit(connection)

    if (threadId) return {id: threadId}
  } catch (e) {
    if (connection) await db.rollback(connection)
    throw e
  }
}

async function findOne(workoutScheduleId: number, userId: number): Promise<IWorkoutRecordDetailData> {
  try {
    const workoutSchedule = await WorkoutSchedule.findOneWithId(workoutScheduleId)
    const workoutFeedbacks = await WorkoutFeedbacks.findOneWithWorkoutScheduleId(workoutScheduleId)
    const workoutRecords = await WorkoutRecords.findAllWithWorkoutScheduleId(workoutScheduleId)
    const scheduleRecords = await WorkoutSchedule.findOneScheduleRecord(workoutScheduleId)
    //TODO: startdate 저번주 월요일로
    // const threads = await Thread.findAllWithWorkoutScheduleId(workoutScheduleId)
    return {
      startDate: moment(workoutSchedule.startDate).format('YYYY-MM-DD'),
      ...workoutFeedbacks,
      workoutRecords,
      scheduleRecords
      // threads
    }
  } catch (e) {
    throw e
  }
}

async function findWorkoutHistoryWithPlanId(
  workoutPlanId: number,
  userId: number,
  start: number,
  perPage: number
): Promise<{data: [IWorkoutHistory]; total: number}> {
  try {
    const exerciseIds = await WorkoutPlan.findExerciseIds({id: workoutPlanId})
    const ret = await WorkoutRecords.findWorkoutHistoryWithExerciseId(exerciseIds, userId, start, perPage)

    return ret
  } catch (e) {
    throw e
  }
}

export {createRecords, findOne, findWorkoutHistoryWithPlanId}
