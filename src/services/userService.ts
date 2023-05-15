import {PoolConnection} from 'mysql'
import {User} from '../models'
import {IUser, IUserFindOne, IUserUpdate, IUserFindAll, IUserList} from '../interfaces/user'
import {passwordIterations} from '../libs/code'
import {db} from '../loaders'
import {code as Code} from '../libs'

async function create(options: {email: string; nickname: string; password: string}): Promise<IUser> {
  const connection = await db.beginTransaction()
  try {
    const {password, email, nickname, ...data} = options
    const passwordHash = Code.createPasswordHash(password, passwordIterations.mobile)
    const user = await User.create(
      {
        email,
        nickname,
        password: passwordHash,
        ...data
      },
      connection
    )
    await db.commit(connection)
    return user
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
    const user = await User.findOne({id})

    return user
  } catch (e) {
    throw e
  }
}

// async function create(options: {
//   email: string
//   nickname: string
//   password: string
//   impUid: string
//   cityId?: number
//   isMarried?: boolean
//   categoryIds: []
//   referralCode: string
//   isMarketing: boolean
//   socialType?: 'facebook' | 'naver' | 'apple' | 'email'
//   socialToken?: string
//   accountId: string
// }): Promise<IUser> {
//   const connection = await db.beginTransaction()
//   try {
//     let passwordHash: {password?: string; salt: string}
//     const {password, impUid, referralCode, categoryIds, socialType, socialToken, ...data} = options
//     if (socialType !== 'email') {
//       passwordHash = {salt: Code.generateRandomHash(64)}
//     } else {
//       passwordHash = await createPasswordHash(password, passwordIterations.mobile)
//     }
//     let referrerUser
//     const users = await User.create(
//       {
//         referralCode: shortId.generate(),
//         referrerId: referrerUser ? referrerUser.id : null,
//         accountInfo: passwordHash,
//         type: socialType,
//         ...data
//       },
//       connection
//     )
//     await db.commit(connection)
//     return users
//   } catch (e) {
//     if (connection) await db.rollback(connection)
//     if (e.code === 'ER_DUP_ENTRY') {
//       throw new Error('already_in_use')
//     }
//     throw e
//   }
// }

async function findOne(options: IUserFindOne): Promise<IUser> {
  try {
    return await User.findOne(options)
  } catch (e) {
    throw e
  }
}

async function findAllForTrainer(options: IUserFindAll): Promise<IUserList> {
  try {
    return await User.findAllForTrainer(options)
  } catch (e) {
    throw e
  }
}

async function update(options: IUserUpdate): Promise<void> {
  const connection = await db.beginTransaction()
  try {
    const {
      nickname,
      gender,
      birth,
      phone,
      cityId,
      isMarried,
      id,
      accountInfo,
      deviceId,
      deletedAt,
      deleteType,
      deleteDescription,
      categoryIds
    } = options
    if (nickname || cityId || isMarried !== undefined || accountInfo || deviceId || deletedAt) {
      await User.updateOne(
        {
          id,
          nickname,
          cityId,
          isMarried,
          accountInfo,
          deviceId,
          deletedAt,
          deleteType,
          deleteDescription
        },
        connection
      )
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

async function updateStatus(
  options: {
    id: number
    status: 'general' | 'delete'
    deleteType: 'point' | 'use' | 'service' | 'error' | 'etc' | 'force'
    deletedAt: Date
  },
  connection?: PoolConnection
): Promise<void> {
  try {
    await User.updateOne(options, connection)
  } catch (e) {
    throw e
  }
}

export {create, getMe, findOne, findAllForTrainer, update, updateStatus}
