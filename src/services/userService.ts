import {Ticket, User, WorkoutSchedule} from '../models'
import {IUser, IUserFindOne, IUserUpdate, IUserFindAll, IUserListForTrainer, IUserCreateOne} from '../interfaces/user'
import {passwordIterations} from '../libs/code'
import {code as Code} from '../libs'
import {db} from '../loaders'

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
    return await User.findOne({id})
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
    return {...user, tickets, workouts}
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

export {create, confirmPassword, getMe, findOne, findOneWithId, findAllForTrainer, update, updatePassword}
