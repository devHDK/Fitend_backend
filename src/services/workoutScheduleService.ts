import moment from 'moment-timezone'
import {
  WorkoutSchedule,
  WorkoutFeedbacks,
  WorkoutPlan,
  Exercise,
  Notification,
  WorkoutStat,
  WorkoutRecords,
  User,
  UserDevice
} from '../models'
import {
  IWorkoutScheduleList,
  IWorkoutScheduleFindAll,
  IWorkoutScheduleDetail,
  IWorkoutScheduleCreate,
  IWorkoutScheduleUpdate,
  IWorkoutScheduleListForTrainer,
  IWorkoutHistory
} from '../interfaces/workoutSchedules'
import {IWorkoutFeedbackCreate} from '../interfaces/workoutFeedbacks'
import {db, firebase} from '../loaders'
import {workoutScheduleSubscriber} from '../subscribers'
import {IUserDevice} from '../interfaces/userDevice'

moment.tz.setDefault('Asia/Seoul')

interface IWorkoutFeedbackData extends IWorkoutFeedbackCreate {
  userId: number
  issueIndexes: number[]
}

interface IWorkoutScheduleCreateData extends IWorkoutScheduleCreate {
  workoutPlans: [
    {
      exerciseId: number
      setInfo: [{index: number; reps: number; weight: number; seconds: number}]
      circuitGroupNum?: number
      isVideoRecord: boolean
      setType?: string
      circuitSeq?: number
    }
  ]
}

interface IWorkoutScheduleUpdateData extends IWorkoutScheduleUpdate {
  workoutPlans?: [
    {
      exerciseId: number
      setInfo: [{index: number; reps: number; weight: number; seconds: number}]
      circuitGroupNum?: number
      isVideoRecord: boolean
      setType?: string
      circuitSeq?: number
    }
  ]
}

async function create(options: IWorkoutScheduleCreateData): Promise<void> {
  const connection = await db.beginTransaction()
  try {
    const {workoutPlans, ...data} = options
    const workoutScheduleId = await WorkoutSchedule.create(data, connection)
    const {startDate} = data
    for (let i = 0; i < workoutPlans.length; i++) {
      const {exerciseId, setInfo, circuitGroupNum, isVideoRecord, setType, circuitSeq} = workoutPlans[i]
      await WorkoutPlan.create(
        {
          exerciseId,
          workoutScheduleId,
          setInfo: JSON.stringify(setInfo),
          circuitGroupNum: circuitGroupNum || null,
          isVideoRecord,
          setType: setType || null,
          circuitSeq: circuitSeq || null
        },
        connection
      )
    }
    await WorkoutStat.upsertOne(
      {
        userId: data.userId,
        franchiseId: data.franchiseId,
        month: moment(startDate).startOf('month').format('YYYY-MM-DD'),
        monthCount: 1
      },
      connection
    )
    const user = await User.findOne({id: data.userId})
    const userDevices = await UserDevice.findAllWithUserId(user.id)
    // const contents = `새로운 운동플랜이 있어요 🏋\n${util.defaultWorkoutTimeFormatForPush(
    //   data.startDate,
    //   data.totalTime,
    //   data.workoutTitle
    // )}`
    // await Notification.create(
    //   {
    //     userId: user.id,
    //     type: 'workoutSchedule',
    //     contents,
    //     info: JSON.stringify({workoutScheduleId})
    //   },
    //   connection
    // )
    if (userDevices && userDevices.length > 0) {
      // await User.updateBadgeCount(user.id, connection)
      workoutScheduleSubscriber.publishWorkoutSchedulePushEvent({
        tokens: userDevices.map((device: IUserDevice) => device.token),
        type: 'workoutScheduleCreate'
      })
    }
    await db.commit(connection)
  } catch (e) {
    if (connection) await db.rollback(connection)
    throw e
  }
}

async function createFeedbacks(options: IWorkoutFeedbackData): Promise<void> {
  const connection = await db.beginTransaction()
  try {
    const {userId, issueIndexes, ...data} = options
    const workoutSchedule = await WorkoutSchedule.findOne(data.workoutScheduleId)
    if (!workoutSchedule || workoutSchedule.userId !== userId) throw new Error('not_allowed')
    const workoutFeedback = await WorkoutFeedbacks.findOneWithWorkoutScheduleId(data.workoutScheduleId)
    if (workoutFeedback) throw new Error('duplicate_feedback')
    const workoutFeedbackId = await WorkoutFeedbacks.create(data, connection)

    //몸무게 / 운동시간 METs
    const userBodySpec = await User.findUserBodySpecWithId({userId})

    if (userBodySpec) {
      const record = await WorkoutSchedule.findOneScheduleRecord(data.workoutScheduleId)

      if (record && record.workoutDuration != null) {
        const workoutMin = record.workoutDuration / 60

        const METs =
          data.strengthIndex === 1 || data.strengthIndex === 2
            ? 3.5
            : data.strengthIndex === 3 || data.strengthIndex === 4
            ? 5
            : 6

        // [(x)METs * 3.5mL/kg/min * 체중(kg) /1000] * 5kcal * 운동시간(min)
        const calories = Math.ceil(METs * userBodySpec.weight * workoutMin * 0.0172)
        record.calories = calories

        await WorkoutSchedule.updateWorkoutScheduleRecords(
          {workoutScheduleId: data.workoutScheduleId, ...record},
          connection
        )
      }
    }

    if (issueIndexes && issueIndexes.length > 0) {
      await WorkoutFeedbacks.createRelationIssues({workoutFeedbackId, issueIndexes}, connection)
    }

    // const workoutScheduleData = await WorkoutSchedule.findUsernameWithWorkoutScheduleId(data.workoutScheduleId)

    // await firebase.sendToTopic(`trainer_${workoutSchedule.trainerId}`, {
    //   notification: {body: `${workoutScheduleData.userNickname}님이 오늘의 운동을 완료하였습니다.`}
    // })

    await db.commit(connection)
  } catch (e) {
    if (connection) await db.rollback(connection)
    throw e
  }
}

async function findAll(options: IWorkoutScheduleFindAll): Promise<[IWorkoutScheduleList]> {
  try {
    return await WorkoutSchedule.findAll(options)
  } catch (e) {
    throw e
  }
}

async function findAllForTrainer(options: IWorkoutScheduleFindAll): Promise<[IWorkoutScheduleListForTrainer]> {
  try {
    return await WorkoutSchedule.findAllForTrainer(options)
  } catch (e) {
    throw e
  }
}

async function findAllHistory(id: number, userId: number): Promise<[IWorkoutHistory]> {
  try {
    const today = moment().format('YYYY-MM-DD')
    const startDate = moment().subtract(2, 'M').format('YYYY-MM-DD')
    return await WorkoutSchedule.findAllHistory(id, userId, today, startDate)
  } catch (e) {
    throw e
  }
}

async function findOne(workoutScheduleId: number): Promise<IWorkoutScheduleDetail> {
  try {
    const schedule = await WorkoutSchedule.findOneWithId(workoutScheduleId)
    const exercises = await Exercise.findOneWithWorkoutScheduleId(workoutScheduleId)
    return {...schedule, exercises}
  } catch (e) {
    throw e
  }
}

async function findOneForTrainer(workoutScheduleId: number): Promise<IWorkoutScheduleDetail> {
  try {
    return await WorkoutSchedule.findOneForTrainer(workoutScheduleId)
  } catch (e) {
    throw e
  }
}

async function update(options: IWorkoutScheduleUpdateData): Promise<void> {
  const connection = await db.beginTransaction()
  try {
    const {workoutPlans, ...data} = options
    const workoutSchedule = await WorkoutSchedule.findOne(data.id)
    await WorkoutSchedule.update(data, connection)

    if (workoutPlans && workoutPlans.length > 0) {
      await WorkoutPlan.deleteAllWithWorkoutScheduleId(data.id, connection)
      for (let i = 0; i < workoutPlans.length; i++) {
        const {exerciseId, setInfo, circuitGroupNum, isVideoRecord, setType, circuitSeq} = workoutPlans[i]
        await WorkoutPlan.create(
          {
            exerciseId,
            workoutScheduleId: data.id,
            setInfo: JSON.stringify(setInfo),
            circuitGroupNum: circuitGroupNum || null,
            isVideoRecord,
            setType: setType || null,
            circuitSeq: circuitSeq || null
          },
          connection
        )
      }
    }

    const originMonth = moment(workoutSchedule.startDate).startOf('month').format('YYYY-MM-DD')
    const changeMonth = moment(data.startDate).startOf('month').format('YYYY-MM-DD')
    if (originMonth !== changeMonth) {
      await WorkoutStat.upsertOne(
        {
          userId: workoutSchedule.userId,
          franchiseId: workoutSchedule.franchiseId,
          month: originMonth,
          monthCount: -1
        },
        connection
      )
      await WorkoutStat.upsertOne(
        {
          userId: workoutSchedule.userId,
          franchiseId: workoutSchedule.franchiseId,
          month: changeMonth,
          monthCount: 1
        },
        connection
      )
    }
    const user = await User.findOne({id: workoutSchedule.userId})
    const userDevices = await UserDevice.findAllWithUserId(user.id)
    // const contents = `운동플랜이 수정 되었어요 📝\n${util.defaultWorkoutTimeFormatForPush(
    //   data.startDate,
    //   data.totalTime,
    //   data.workoutTitle
    // )}`
    // await Notification.create(
    //   {
    //     userId: user.id,
    //     type: 'workoutSchedule',
    //     contents,
    //     info: JSON.stringify({workoutScheduleId: workoutSchedule.id})
    //   },
    //   connection
    // )
    if (userDevices && userDevices.length > 0) {
      // await User.updateBadgeCount(user.id, connection)
      workoutScheduleSubscriber.publishWorkoutSchedulePushEvent({
        tokens: userDevices.map((device: IUserDevice) => device.token),
        type: 'workoutScheduleChange',
        // badge: user.badgeCount + 1,
        data: {
          workoutScheduleId: workoutSchedule.id.toString()
        }
      })
    }
    await db.commit(connection)
  } catch (e) {
    if (connection) await db.rollback(connection)
    throw e
  }
}

async function updateStartDate(options: {id: number; startDate: string; seq: number}): Promise<void> {
  try {
    const workoutSchedule = await WorkoutSchedule.findOne(options.id)
    const today = moment().startOf('day').unix()
    const workoutStartDate = moment(workoutSchedule.startDate).unix()
    if (workoutStartDate < today) throw new Error('not_allowed')
    await WorkoutSchedule.update(options)
  } catch (e) {
    throw e
  }
}

async function updateIsStart(options: {id: number; isStart: boolean}): Promise<void> {
  try {
    await WorkoutSchedule.update(options)
  } catch (e) {
    throw e
  }
}

async function deleteOne(id: number): Promise<void> {
  const connection = await db.beginTransaction()
  try {
    const workoutSchedule = await WorkoutSchedule.findOne(id)
    const workoutRecord = await WorkoutRecords.findAllWithWorkoutScheduleId(id)
    if (workoutRecord && workoutRecord.length > 0) throw new Error('not_allowed')
    await WorkoutSchedule.deleteOne(id, connection)
    await WorkoutStat.upsertOne(
      {
        userId: workoutSchedule.userId,
        franchiseId: workoutSchedule.franchiseId,
        month: moment(workoutSchedule.startDate).startOf('month').format('YYYY-MM-DD'),
        monthCount: -1
      },
      connection
    )

    const user = await User.findOne({id: workoutSchedule.userId})
    const userDevices = await UserDevice.findAllWithUserId(user.id)
    if (userDevices && userDevices.length > 0) {
      // await User.updateBadgeCount(user.id, connection)
      workoutScheduleSubscriber.publishWorkoutSchedulePushEvent({
        tokens: userDevices.map((device: IUserDevice) => device.token),
        type: 'workoutScheduleDelete',
        // badge: user.badgeCount + 1,
        data: {
          workoutScheduleId: workoutSchedule.id.toString()
        }
      })
    }

    await db.commit(connection)
  } catch (e) {
    if (connection) await db.rollback(connection)
    throw e
  }
}

export {
  create,
  createFeedbacks,
  findAll,
  findAllForTrainer,
  findAllHistory,
  findOne,
  findOneForTrainer,
  update,
  updateStartDate,
  updateIsStart,
  deleteOne
}
