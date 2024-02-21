import moment from 'moment-timezone'
import {code as Code, jwt as JWT} from '../libs'
import {IUser, IUserCreateOne} from '../interfaces/user'
import {
  User,
  Ticket,
  UserDevice,
  Trainer,
  Verification,
  WorkoutSchedule,
  WorkoutPlan,
  WorkoutStat,
  TrainerDevice,
  TrainerNotification
} from '../models'
import {db} from '../loaders'
import {passwordIterations} from '../libs/code'
import {userSubscriber, workoutScheduleSubscriber} from '../subscribers'
import {IUserDevice} from '../interfaces/userDevice'
import {ITrainerDevice} from '../interfaces/trainerDevice'

moment.tz.setDefault('Asia/Seoul')

interface IUserAccountCreate extends IUserCreateOne {
  trainerId: number
  height: number
  weight: number
  experience: number
  purpose: number
  achievement: [number]
  obstacle: [number]
  preferDays: [number]
  place: 'home' | 'gym' | 'both'
}

async function signIn(options: {
  email: string
  password: string
  platform: 'android' | 'ios'
  deviceId: string
  token: string
}): Promise<{accessToken: string; refreshToken: string; user: IUser}> {
  const connection = await db.beginTransaction()
  try {
    const {email, password, deviceId, platform, token} = options
    let activeTickets, activeTrainers, lastTickets, lastTrainers
    const user = await User.findOne({email})
    if (!user) throw new Error('not_found')
    if (
      user &&
      Code.verifyPassword(password, user.password.password, user.password.salt, Code.passwordIterations.mobile)
    ) {
      const userDevice = await UserDevice.findOne(user.id, user.deviceId, user.platform)
      const isActive = await Ticket.findOneWithUserId(user.id)
      // if (!isActive) throw new Error('not_allowed')
      const accessToken = await JWT.createAccessToken({id: user.id, type: 'user'})
      const refreshToken = await JWT.createRefreshToken({id: user.id, type: 'user'}, user.password.salt)

      const existDevices = await UserDevice.findAllWithUserId(user.id)
      const forbiddenDevices = await Trainer.findDeviceList()
      const forbiddenDeviceList = forbiddenDevices.map((device) => device.deviceId)
      const isForbiddenDevice = forbiddenDeviceList.some((item) => item === deviceId)

      if (!isForbiddenDevice && token) {
        await User.updateOne({id: user.id, deviceId, platform}, connection)
        await UserDevice.upsertOne({userId: user.id, platform, deviceId, token}, connection)
        await UserDevice.updateOne({userId: user.id, platform, deviceId, isNotification: true}, connection)
      }

      if (existDevices.length > 1) {
        //기존 device list가 2개 이상이면 trainer device 전부 삭제
        for (const device of existDevices) {
          if (forbiddenDeviceList.some((item) => item === device.deviceId)) {
            await UserDevice.deleteOne(device.deviceId, user.id, connection)
          }
        }
      } else if (existDevices.length === 1) {
        if (forbiddenDeviceList.some((item) => item === existDevices[0].deviceId) && !isForbiddenDevice) {
          // forbiddenDeviceList 에 입력된 deviceId가 포함되있지 않고, 기존 deviceId가 trainer deviceId일 경우
          await UserDevice.deleteOne(existDevices[0].deviceId, user.id, connection)
        }
      } else if (existDevices.length < 1 && isForbiddenDevice) {
        //리스트에 아무것도 없을땐 무조건 추가
        if (token) {
          await User.updateOne({id: user.id, deviceId, platform}, connection)
          await UserDevice.upsertOne({userId: user.id, platform, deviceId, token}, connection)
          await UserDevice.updateOne({userId: user.id, platform, deviceId, isNotification: true}, connection)
        }
      }

      if (isActive) {
        activeTrainers = await Trainer.findActiveTrainersWithUserId(user.id)
        activeTickets = await Ticket.findAllForUser({
          userId: user.id
        })
      } else {
        lastTickets = await Ticket.findLastTicketUser({userId: user.id})
        lastTrainers = await Trainer.findLastTrainersWithUserId({userId: user.id, ticketId: lastTickets[0].id})
      }

      const userBodySpec = await User.findUserBodySpecWithId({userId: user.id})

      delete user.password
      await db.commit(connection)
      return {
        accessToken,
        refreshToken,
        user: {
          ...user,
          isNotification: userDevice ? userDevice.isNotification : true,
          activeTrainers: isActive ? activeTrainers : [],
          activeTickets: isActive ? activeTickets : [],
          lastTickets: isActive ? [] : lastTickets,
          lastTrainers: isActive ? [] : lastTrainers,
          weight: userBodySpec ? userBodySpec.weight : null,
          height: userBodySpec ? userBodySpec.height : null
        }
      }
    }
    throw new Error('invalid_password')
  } catch (e) {
    if (connection) await db.rollback(connection)
    throw e
  }
}

const isProd = process.env.NODE_ENV === 'production'
const prodWorkoutPlans = [
  {
    exerciseId: 74,
    isVideoRecord: false,
    setInfo: [
      {
        index: 1,
        reps: 10
      }
    ],
    circuitGroupNum: null,
    setType: null,
    circuitSeq: null
  },
  {
    exerciseId: 76,
    isVideoRecord: false,
    setInfo: [
      {
        index: 1,
        reps: 10
      }
    ],
    circuitGroupNum: null,
    setType: null,
    circuitSeq: null
  },
  {
    exerciseId: 194,
    isVideoRecord: true,
    setInfo: [
      {
        index: 1,
        reps: 12,
        weight: 20
      },
      {
        index: 2,
        reps: 12,
        weight: 30
      },
      {
        index: 3,
        reps: 10,
        weight: 40
      },
      {
        index: 4,
        reps: 8,
        weight: 50
      }
    ],
    circuitGroupNum: null,
    setType: null,
    circuitSeq: null
  },
  {
    exerciseId: 163,
    isVideoRecord: false,
    setInfo: [
      {
        index: 1,
        reps: 10,
        weight: 20
      },
      {
        index: 2,
        reps: 8,
        weight: 30
      },
      {
        index: 3,
        reps: 6,
        weight: 40
      },
      {
        index: 4,
        reps: 4,
        weight: 50
      }
    ],
    circuitGroupNum: null,
    setType: null,
    circuitSeq: null
  },
  {
    exerciseId: 100,
    isVideoRecord: true,
    setInfo: [
      {
        index: 1,
        reps: 12,
        weight: 20
      },
      {
        index: 2,
        reps: 12,
        weight: 20
      },
      {
        index: 3,
        reps: 10,
        weight: 25
      },
      {
        index: 4,
        reps: 8,
        weight: 30
      }
    ],
    circuitGroupNum: null,
    setType: null,
    circuitSeq: null
  },
  {
    exerciseId: 139,
    isVideoRecord: false,
    setInfo: [
      {
        index: 1,
        reps: 5
      },
      {
        index: 2,
        reps: 5
      }
    ],
    circuitGroupNum: null,
    setType: null,
    circuitSeq: null
  }
]
const devWorkoutPlans = [
  {
    exerciseId: 82,
    isVideoRecord: false,
    setInfo: [
      {
        index: 1,
        reps: 1
      }
    ],
    circuitGroupNum: null,
    setType: null,
    circuitSeq: null
  },
  {
    exerciseId: 88,
    isVideoRecord: false,
    setInfo: [
      {
        index: 1,
        reps: 1
      }
    ],
    circuitGroupNum: null,
    setType: null,
    circuitSeq: null
  },
  {
    exerciseId: 81,
    isVideoRecord: true,
    setInfo: [
      {
        index: 1,
        reps: 1,
        weight: 1
      }
    ],
    circuitGroupNum: null,
    setType: null,
    circuitSeq: null
  },
  {
    exerciseId: 86,
    isVideoRecord: false,
    setInfo: [
      {
        index: 1,
        reps: 1,
        weight: 1
      }
    ],
    circuitGroupNum: null,
    setType: null,
    circuitSeq: null
  },
  {
    exerciseId: 90,
    isVideoRecord: true,
    setInfo: [
      {
        index: 1,
        reps: 1,
        weight: 1
      }
    ],
    circuitGroupNum: null,
    setType: null,
    circuitSeq: null
  },
  {
    exerciseId: 85,
    isVideoRecord: false,
    setInfo: [
      {
        index: 1,
        reps: 1,
        weight: 1
      }
    ],
    circuitGroupNum: null,
    setType: null,
    circuitSeq: null
  }
]
const demoWorkoutScheduleData = {
  workoutId: isProd ? 68 : 66,
  workoutTitle: '(예시) 오늘의 운동루틴 🗓️',
  workoutSubTitle: '어떻게 사용하는지 미리 확인해보세요 :)',
  totalTime: '00:40:00',
  startDate: moment().format('YYYY-MM-DD'),
  seq: 1,
  workoutPlans: isProd ? prodWorkoutPlans : devWorkoutPlans
}

async function createAccountForUser(options: IUserAccountCreate): Promise<void> {
  const connection = await db.beginTransaction()
  try {
    const {
      password,
      height,
      weight,
      experience,
      purpose,
      achievement,
      obstacle,
      trainerId,
      place,
      preferDays,
      ...data
    } = options
    const passwordHash = Code.createPasswordHash(password, passwordIterations.mobile)
    const userId = await User.create({password: JSON.stringify(passwordHash), ...data}, connection)
    await User.createRelationsFranchises({userId, franchiseId: 1}, connection)
    await User.createBodySpec({userId, height, weight}, connection)
    await User.createPreSurvey(
      {
        userId,
        experience,
        purpose,
        achievement: JSON.stringify(achievement),
        obstacle: JSON.stringify(obstacle),
        place,
        preferDays: JSON.stringify(preferDays)
      },
      connection
    )

    const ticketId = await Ticket.create(
      {
        type: 'fitness',
        serviceSession: 0,
        totalSession: 0,
        sessionPrice: 0,
        coachingPrice: 0,
        startedAt: moment().format('YYYY-MM-DD'),
        expiredAt: moment().add(13, 'day').format('YYYY-MM-DD'),
        month: 0
      },
      connection
    )
    await Ticket.createRelationExercises({userId, trainerIds: [trainerId], ticketId, franchiseId: 1}, connection)

    const {workoutPlans, ...rest} = demoWorkoutScheduleData
    const workoutScheduleId = await WorkoutSchedule.create(
      {
        userId,
        trainerId,
        franchiseId: 1,
        ...rest
      },
      connection
    )
    const startDate = moment().format('YYYY-MM-DD')
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
        userId,
        franchiseId: 1,
        month: moment(startDate).startOf('month').format('YYYY-MM-DD'),
        monthCount: 1
      },
      connection
    )
    const userDevices = await UserDevice.findAllWithUserId(userId)
    if (userDevices && userDevices.length > 0) {
      workoutScheduleSubscriber.publishWorkoutSchedulePushEvent({
        tokens: userDevices.map((device: IUserDevice) => device.token),
        type: 'workoutScheduleCreate'
      })
    }

    const trainer = await Trainer.findOne({id: trainerId})
    const trainerDevices = await TrainerDevice.findAllWithUserId(trainerId)
    const contents = `${data.nickname}님이 무료체험을 신청했어요 👏\n체험기간: ${moment().format(
      'YYYY.MM.DD'
    )} ~ ${moment().add(13, 'day').format('YYYY.MM.DD')}`
    const info = {
      userId: userId.toString(),
      nickname: data.nickname,
      gender: data.gender
    }
    await TrainerNotification.create(
      {
        trainerId,
        type: 'thread',
        contents,
        info: JSON.stringify(info)
      },
      connection
    )

    if (trainerDevices && trainerDevices.length > 0) {
      userSubscriber.publishUserPushEvent({
        tokens: trainerDevices.map((device: ITrainerDevice) => device.token),
        type: 'userCreate',
        sound: 'default',
        badge: trainer.badgeCount + 1,
        contents,
        data: info
      })
    }

    await db.commit(connection)
  } catch (e) {
    if (connection) await db.rollback(connection)
    if (e.code === 'ER_DUP_ENTRY') {
      throw new Error('already_in_use')
    }
    throw e
  }
}

async function signOut(userId: number, platform: 'ios' | 'android', deviceId: string): Promise<void> {
  try {
    await UserDevice.updateOne({userId, platform, deviceId, isNotification: false})
  } catch (e) {
    throw e
  }
}

async function signOutTrainer(trainerId: number, platform: 'ios' | 'android', deviceId: string): Promise<void> {
  try {
    await TrainerDevice.updateOne({trainerId, platform, deviceId, isNotification: false})
  } catch (e) {
    throw e
  }
}

async function refreshToken(accessToken: string, refreshToken: string): Promise<string> {
  try {
    const payload = await JWT.decodeToken(accessToken, {algorithms: ['RS256'], ignoreExpiration: true})
    if (payload.sub) {
      let refreshHash
      if (payload.type === 'user') {
        const user = await User.findOne(payload.sub)
        if (!user) throw new Error('not_found')
        refreshHash = user.password.salt
      } else {
        const trainer = await Trainer.findOne(payload.sub)
        if (!trainer) throw new Error('not_found')
        refreshHash = trainer.password.salt
      }

      await JWT.decodeToken(refreshToken, {algorithms: ['HS256']}, refreshHash)
      return await JWT.createAccessToken({id: payload.sub, type: payload.type})
    }
  } catch (e) {
    throw e
  }
}

async function passwordReset(options: {
  email: string
  phone: string
  phoneToken: string
  password: string
}): Promise<void> {
  const connection = await db.beginTransaction()
  try {
    const {email, phone, phoneToken, password} = options

    const verification = await Verification.findOne({phone, type: 'reset', confirmed: true, used: false})
    if (!verification) {
      throw new Error('not_found_verification')
    }

    await JWT.decodeToken(phoneToken, {algorithms: ['RS256']})
    await Verification.updateVerification({id: verification.id, used: true}, connection)

    const user = await User.findOne({phone})
    if (!user || email !== user.email) throw new Error('not_found')

    await User.updatePasswordForUser({id: user.id, password}, connection)

    await db.commit(connection)
  } catch (e) {
    if (connection) await db.rollback(connection)
    throw e
  }
}

export {signIn, createAccountForUser, signOut, signOutTrainer, refreshToken, passwordReset}
