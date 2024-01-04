import moment from 'moment'
import {Ticket, Trainer, User, UserDevice, WorkoutSchedule, Franchise, WorkoutRequestDay} from '../models'
import {
  IUser,
  IUserFindOne,
  IUserUpdate,
  IUserFindAll,
  IUserListForTrainer,
  IUserCreateOne,
  IUserListForAdmin,
  IUsersWorkoutSchedulesFindAll,
  IUserWithWorkoutList
} from '../interfaces/user'
import {passwordIterations} from '../libs/code'
import {code as Code} from '../libs'
import {db} from '../loaders'
import {
  IInflowContentCreate,
  IInflowContentFindAll,
  IInflowContentUpdate,
  IUserInflowContentsList
} from '../interfaces/inflowContent'
import {UserService} from '.'

interface IUserCreateData extends IUserCreateOne {
  franchiseId: number
}

interface IUserDetail extends IUser {
  tickets: {
    personalCount: number
    fitnessCount: number
    expiredCount: number
  }
  workouts: {
    thisMonthCount: number
    asOfTodayCount: number
    doneCount: number
    recentDate: string
  }
  trainers: {
    id: number
    nickname: string
    profileImage: string
  }[]
}

interface IUserDetailForAdmin extends IUser {
  tickets: {
    personalCount: number
    fitnessCount: number
    expiredCount: number
  }
  workouts: {
    thisMonthCount: number
    asOfTodayCount: number
    doneCount: number
    recentDate: string
  }
  franchises: {
    franchiseId: number
    name: string
  }
}

async function create(options: IUserCreateData): Promise<void> {
  const connection = await db.beginTransaction()
  try {
    const {password, franchiseId, ...data} = options
    const passwordHash = Code.createPasswordHash(password, passwordIterations.mobile)
    const userId = await User.create({password: JSON.stringify(passwordHash), ...data}, connection)
    await User.createRelationsFranchises({userId, franchiseId}, connection)
    await db.commit(connection)
  } catch (e) {
    if (connection) await db.rollback(connection)
    if (e.code === 'ER_DUP_ENTRY') {
      throw new Error('already_in_use')
    }
    throw e
  }
}

async function createInflowContent(options: IInflowContentCreate): Promise<{id: number}> {
  const connection = await db.beginTransaction()
  try {
    const inflowContentId = await User.createInflowContent(options, connection)
    await db.commit(connection)

    return {id: inflowContentId}
  } catch (e) {
    if (connection) await db.rollback(connection)
    throw e
  }
}

async function confirmPassword(options: {id: number; password: string}): Promise<void> {
  const {id, password} = options
  try {
    const user = await User.findOne({id})
    if (
      !user ||
      !Code.verifyPassword(password, user.password.password, user.password.salt, Code.passwordIterations.mobile)
    )
      throw new Error('not_found')
  } catch (e) {
    throw e
  }
}

async function getMe(options: {id: number}): Promise<IUser> {
  try {
    const {id} = options
    const user = await User.findOne({id})
    const userDevice = await UserDevice.findOne(user.id, user.deviceId, user.platform)
    const activeTrainers = await Trainer.findActiveTrainersWithUserId(id)
    if (!userDevice || !userDevice.token) throw new Error('no_token')
    const isActive = await Ticket.findOneWithUserId(user.id)
    if (!isActive) throw new Error('ticket_expired')
    delete user.password

    return {...user, isNotification: userDevice.isNotification, activeTrainers}
  } catch (e) {
    throw e
  }
}

async function findOne(options: IUserFindOne): Promise<IUser> {
  try {
    return await User.findOne(options)
  } catch (e) {
    throw e
  }
}

async function findOneWithId(id: number): Promise<IUserDetail> {
  try {
    const user = await User.findOneWithId(id)
    const tickets = await Ticket.findCounts(id)
    const workouts = await WorkoutSchedule.findCounts(id)
    const trainers = await Trainer.findActiveTrainersWithUserId(id)
    return {...user, tickets, workouts, trainers}
  } catch (e) {
    throw e
  }
}

async function findOneForAdmin(id: number): Promise<IUserDetailForAdmin> {
  try {
    const user = await User.findOneWithId(id)
    const tickets = await Ticket.findCounts(id)
    const workouts = await WorkoutSchedule.findCounts(id)
    const franchises = await Franchise.findOneWithUserId(id)
    return {...user, tickets, workouts, franchises}
  } catch (e) {
    throw e
  }
}

async function findAllForTrainer(options: IUserFindAll): Promise<IUserListForTrainer> {
  try {
    return await User.findAllForTrainer(options)
  } catch (e) {
    throw e
  }
}

async function findAllInflowForTrainer(options: IInflowContentFindAll): Promise<IUserInflowContentsList> {
  try {
    return await User.findUserInflowForTrainer(options)
  } catch (e) {
    throw e
  }
}

async function findAllUsersWorkout(options: IUsersWorkoutSchedulesFindAll): Promise<IUserWithWorkoutList> {
  try {
    const {startDate, interval} = options
    const users: IUserWithWorkoutList = await User.findUsersWorkoutSchedules(options)
    const startDateToString = moment(startDate).format('YYYY-MM-DD')
    const endDate = moment(startDate).add(interval, 'day').format('YYYY-MM-DD')

    const ret = await Promise.all(
      users.map(async (user) => ({
        ...user,
        requestDates: await WorkoutRequestDay.findAll({
          userId: user.id,
          startDate: startDateToString,
          endDate
        }),
        workout: await WorkoutSchedule.findAll({userId: user.id, startDate, interval: interval || 13})
      }))
    )

    return ret
  } catch (e) {
    throw e
  }
}

async function findAllForAdmin(options: IUserFindAll): Promise<IUserListForAdmin> {
  try {
    return await User.findAllForAdmin(options)
  } catch (e) {
    throw e
  }
}

async function update(options: IUserUpdate): Promise<void> {
  try {
    if (options.password)
      options.password = JSON.stringify(Code.createPasswordHash(options.password, passwordIterations.mobile))
    else delete options.password
    await User.updateOne(options)
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') {
      throw new Error('already_in_use')
    }
    throw e
  }
}

async function updateInflowContent(options: IInflowContentUpdate): Promise<void> {
  try {
    await User.updateOneInflowContent(options)
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') {
      throw new Error('already_in_use')
    }
    throw e
  }
}

async function updateInflowComplete(options: {id: number}): Promise<void> {
  try {
    await User.updateInflowContentComplete(options.id)
  } catch (e) {
    throw e
  }
}

async function updateFCMToken(options: {
  userId: number
  deviceId: string
  token: string
  platform: 'android' | 'ios'
}): Promise<void> {
  const connection = await db.beginTransaction()
  try {
    const {userId, deviceId, token, platform} = options

    const user = await User.findOne({id: userId})

    const forbiddenDevices = await Trainer.findDeviceList()
    const forbiddenDeviceList = forbiddenDevices.map((device) => device.deviceId)
    const isForbiddenDevice = forbiddenDeviceList.some((item) => item === deviceId)

    if (!isForbiddenDevice && token) {
      await User.updateOne({id: user.id, deviceId, platform}, connection)
      await UserDevice.upsertOne({userId: user.id, platform, deviceId, token}, connection)
      await UserDevice.updateOne({userId: user.id, platform, deviceId, isNotification: true}, connection)
      const unUsedDevice = await UserDevice.findOneWithTokenAndUnmatchDevice(token, deviceId)
      if (unUsedDevice) {
        await UserDevice.deleteOne(unUsedDevice.deviceId, unUsedDevice.userId, connection)
      }
    }

    await db.commit(connection)
  } catch (e) {
    if (connection) await db.rollback(connection)
    throw e
  }
}

async function updatePassword(options: {id: number; password: string; newPassword: string}): Promise<void> {
  const {id, password, newPassword} = options
  try {
    const user = await User.findOne({id})
    if (
      user &&
      Code.verifyPassword(password, user.password.password, user.password.salt, Code.passwordIterations.mobile)
    ) {
      const passwordHash = Code.createPasswordHash(newPassword, passwordIterations.mobile)
      await User.updateOne({id, password: JSON.stringify(passwordHash)})
    } else throw new Error('not_found')
  } catch (e) {
    throw e
  }
}

async function deleteInflowContentWithId(options: {id: number}): Promise<void> {
  const {id} = options
  try {
    await User.deleteOneInflowContent(options)
  } catch (e) {
    throw e
  }
}

export {
  create,
  createInflowContent,
  confirmPassword,
  getMe,
  findOne,
  findOneWithId,
  findOneForAdmin,
  findAllForTrainer,
  findAllInflowForTrainer,
  findAllUsersWorkout,
  findAllForAdmin,
  update,
  updateInflowContent,
  updateInflowComplete,
  updateFCMToken,
  updatePassword,
  deleteInflowContentWithId
}
