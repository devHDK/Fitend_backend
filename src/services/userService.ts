import {User} from '../models'
import {IUser, IUserFindOne, IUserUpdate, IUserFindAll, IUserListForTrainer, IUserCreateOne} from '../interfaces/user'
import {passwordIterations} from '../libs/code'
import {code as Code} from '../libs'
import {db} from '../loaders'

interface IUserCreateData extends IUserCreateOne {
  franchiseId: number
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
