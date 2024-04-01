import moment from 'moment'
import {Bool} from 'aws-sdk/clients/clouddirectory'
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
  IUserWithWorkoutList,
  IUserBodySpecCreate,
  IUserPreSurveyCreate,
  IUserBodySpecsData,
  IUserBodySpecList,
  IUserPreSurveyUpdate
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
  preSurvey: {
    experience: number
    purpose: number
    achievement: number[]
    obstacle: number[]
    place: string
    preferDays: number[]
  }
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

async function createUserBodySpec(options: IUserBodySpecCreate): Promise<void> {
  const connection = await db.beginTransaction()
  try {
    await User.createBodySpec(options, connection)
    await db.commit(connection)
  } catch (e) {
    if (connection) await db.rollback(connection)
    throw e
  }
}

async function createNextWorkoutSurvey(options: {
  userId: number
  mondayDate: string
  noSchedule: boolean
  selectedDates?: string[]
}): Promise<void> {
  const connection = await db.beginTransaction()
  try {
    const {userId, mondayDate, noSchedule, selectedDates} = options

    const monday = moment(mondayDate).format('YYYY-MM-DD')
    const sunday = moment(mondayDate).add(6, 'days').format('YYYY-MM-DD')

    await User.createNextWeekSurvey({userId, mondayDate}, connection)

    if (noSchedule) {
      await WorkoutRequestDay.deleteBetween({userId, start: monday, end: sunday})
    } else if (selectedDates && selectedDates.length > 0) {
      await WorkoutRequestDay.deleteBetween({userId, start: monday, end: sunday})

      await Promise.all(
        selectedDates.map(async (date) => {
          await WorkoutRequestDay.create({userId, workoutDate: date}, connection)
        })
      )
    }

    await db.commit(connection)
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

async function createPreSurvey(options: IUserPreSurveyCreate): Promise<void> {
  const connection = await db.beginTransaction()
  const {userId, experience, purpose, achievement, obstacle, place, preferDays} = options
  try {
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
    await db.commit(connection)
  } catch (e) {
    if (connection) await db.rollback(connection)
    throw e
  }
}

async function getMe(options: {id: number}): Promise<IUser> {
  try {
    const {id} = options
    let activeTickets, activeTrainers, lastTickets, lastTrainers
    const user = await User.findOne({id})
    const userDevice = await UserDevice.findOne(user.id, user.deviceId, user.platform)
    if (!userDevice || !userDevice.token) throw new Error('no_token')
    const isActive = await Ticket.findOneWithUserId(user.id)
    const userBodySpec = await User.findUserBodySpecWithId({userId: id})

    if (isActive) {
      activeTrainers = await Trainer.findActiveTrainersWithUserId(id)
      activeTickets = await Ticket.findAllForUser({
        userId: id
      })
    } else {
      lastTickets = await Ticket.findLastTicketUser({userId: id})
      lastTrainers = await Trainer.findLastTrainersWithUserId({userId: id, ticketId: lastTickets[0].id})
    }

    delete user.password

    return {
      ...user,
      isNotification: userDevice.isNotification,
      activeTrainers: isActive ? activeTrainers : [],
      activeTickets: isActive ? activeTickets : [],
      lastTickets: isActive ? [] : lastTickets,
      lastTrainers: isActive ? [] : lastTrainers,
      weight: userBodySpec ? userBodySpec.weight : null,
      height: userBodySpec ? userBodySpec.height : null
    }
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

async function findOneIsExist(options: IUserFindOne): Promise<Boolean> {
  try {
    const ret = await User.findOne(options)

    if (ret) throw Error('already_in_use')

    return false
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
    const preSurvey = await User.findPreSurveyWithId(id)
    return {...user, tickets, workouts, trainers, preSurvey}
  } catch (e) {
    throw e
  }
}

async function findBodySpecsWithId(options: {id: number; start: number; perPage: number}): Promise<IUserBodySpecList> {
  try {
    return await User.findUserBodySpecWithIdForTrainer(options)
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

async function findNextWeekSurvey(mondayDate: string, userId: number): Promise<Bool> {
  try {
    const count = await User.findNextWeekSurvey(mondayDate, userId)

    return count > 0
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
        workout: await WorkoutSchedule.findAllUsersWorkoutForTrainer({
          userId: user.id,
          startDate,
          interval: interval || 13
        })
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

async function updatePreSurvey(options: IUserPreSurveyUpdate): Promise<void> {
  const connection = await db.beginTransaction()
  const {userId, experience, purpose, achievement, obstacle, place, preferDays} = options
  try {
    await User.updateOnePreSurvey(
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
    await db.commit(connection)
  } catch (e) {
    if (connection) await db.rollback(connection)
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
  createUserBodySpec,
  confirmPassword,
  createPreSurvey,
  createNextWorkoutSurvey,
  getMe,
  findOne,
  findOneIsExist,
  findOneWithId,
  findBodySpecsWithId,
  findOneForAdmin,
  findAllForTrainer,
  findAllInflowForTrainer,
  findAllUsersWorkout,
  findAllForAdmin,
  findNextWeekSurvey,
  update,
  updatePreSurvey,
  updateInflowContent,
  updateInflowComplete,
  updateFCMToken,
  updatePassword,
  deleteInflowContentWithId
}
