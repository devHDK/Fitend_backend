import moment from 'moment-timezone'
import {
  ITrainer,
  ITrainerDetail,
  ITrainerFindAllForAdmin,
  ITrainerList,
  ITrainerListForAdmin
} from '../interfaces/trainer'
import {Franchise, Trainer, User} from '../models/index'
import {code as Code, jwt as JWT} from '../libs'
import {passwordIterations} from '../libs/code'

moment.tz.setDefault('Asia/Seoul')

async function signIn(options: {email: string; password: string}): Promise<{accessToken: string; trainer: ITrainer}> {
  try {
    const {email, password} = options
    const trainer = await Trainer.findOne({email})
    if (
      trainer &&
      Code.verifyPassword(password, trainer.password.password, trainer.password.salt, Code.passwordIterations.web)
    ) {
      const accessToken = await JWT.createAccessTokenForTrainer({id: trainer.id, franchiseId: 1})
      delete trainer.password
      return {accessToken, trainer}
    }
    throw new Error('not_found')
  } catch (e) {
    throw e
  }
}

async function findAll(franchiseId: number): Promise<[ITrainerList]> {
  try {
    return await Trainer.findAll(franchiseId)
  } catch (e) {
    throw e
  }
}

async function findAllForAdmin(options: ITrainerFindAllForAdmin): Promise<ITrainerListForAdmin> {
  try {
    return await Trainer.findAllForAdmin(options)
  } catch (e) {
    throw e
  }
}

async function findOneWithIdForAdmin(id: number): Promise<ITrainerDetail> {
  try {
    const thisMonthStart = moment().startOf('month').format('YYYY-MM-DD')
    const thisMonthEnd = moment().add(1, 'day').format('YYYY-MM-DD')
    const lastMonthStart = moment().subtract(1, 'month').startOf('month').format('YYYY-MM-DD')
    const lastMonthEnd = moment().subtract(1, 'month').endOf('month').add(1, 'day').format('YYYY-MM-DD')
    const trainer = await Trainer.findOneWithIdForAdmin(id)
    const franchiseInfo = await Franchise.findOneWithTrainerId(id)
    const fcThisMonthCount = await User.findActiveFitnessUsersForAdminWithTrainerId(id, thisMonthStart, thisMonthEnd)
    const fcLastMonthCount = await User.findActiveFitnessUsersForAdminWithTrainerId(id, lastMonthStart, lastMonthEnd)
    const ptThisMonthCount = await User.findActivePersonalUsersForAdminWithTrainerId(id, thisMonthStart, thisMonthEnd)
    const ptLastMonthCount = await User.findActivePersonalUsersForAdminWithTrainerId(id, lastMonthStart, lastMonthEnd)
    const fitnessActiveUsers = {thisMonthCount: fcThisMonthCount, lastMonthCount: fcLastMonthCount}
    const personalActiveUsers = {thisMonthCount: ptThisMonthCount, lastMonthCount: ptLastMonthCount}
    return {...trainer, franchiseInfo, activeUsers: {fitnessActiveUsers, personalActiveUsers}}
  } catch (e) {
    throw e
  }
}

async function updatePassword({
  trainerId,
  password,
  newPassword
}: {
  trainerId: number
  password: string
  newPassword: string
}): Promise<void> {
  try {
    const trainer = await Trainer.findOne({id: trainerId})
    if (
      trainer &&
      Code.verifyPassword(password, trainer.password.password, trainer.password.salt, Code.passwordIterations.web)
    ) {
      const passwordHash = Code.createPasswordHash(newPassword, passwordIterations.web)
      await Trainer.updateOne({id: trainerId, password: JSON.stringify(passwordHash)})
    } else throw new Error('not_found')
  } catch (e) {
    throw e
  }
}

export {signIn, findAll, findAllForAdmin, findOneWithIdForAdmin, updatePassword}
