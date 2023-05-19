import {PoolConnection} from 'mysql'
import {User} from '../models'
import {IUser, IUserFindOne, IUserUpdate, IUserFindAll, IUserListForTrainer, IUserCreateOne} from '../interfaces/user'
import {passwordIterations} from '../libs/code'
import {code as Code} from '../libs'

async function create(options: IUserCreateOne): Promise<void> {
  try {
    const {password, ...data} = options
    const passwordHash = Code.createPasswordHash(password, passwordIterations.mobile)
    await User.create({password: JSON.stringify(passwordHash), ...data})
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') {
      throw new Error('already_in_use')
    }
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

async function findOneWithId(id: number): Promise<IUser> {
  try {
    return await User.findOneWithId(id)
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

export {create, getMe, findOne, findOneWithId, findAllForTrainer, update}
