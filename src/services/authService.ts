import moment from 'moment-timezone'
import {code as Code, jwt as JWT} from '../libs'
import {IUser, IUserBodySpecCreate, IUserCreateOne, IUserPreSurveyCreate} from '../interfaces/user'
import {User, Ticket, UserDevice, Trainer} from '../models'
import {db} from '../loaders'
import {passwordIterations} from '../libs/code'

moment.tz.setDefault('Asia/Seoul')

interface IUserAccountCreate extends IUserCreateOne {
  trainerId: number
  height: number
  weight: number
  experience: number
  purpose: number
  achievement: [number]
  obstacle: [number]
  place: 'home' | 'gym'
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
    const user = await User.findOne({email})
    if (!user) throw new Error('not_found')
    if (
      user &&
      Code.verifyPassword(password, user.password.password, user.password.salt, Code.passwordIterations.mobile)
    ) {
      const userDevice = await UserDevice.findOne(user.id, user.deviceId, user.platform)
      const isActive = await Ticket.findOneWithUserId(user.id)
      if (!isActive) throw new Error('not_allowed')
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

      const activeTrainers = await Trainer.findActiveTrainersWithUserId(user.id)
      const activeTickets = await Ticket.findAllForUser({
        userId: user.id
      })

      delete user.password
      await db.commit(connection)
      return {
        accessToken,
        refreshToken,
        user: {
          ...user,
          isNotification: userDevice ? userDevice.isNotification : true,
          activeTrainers,
          activeTickets
        }
      }
    }
    throw new Error('invalid_password')
  } catch (e) {
    if (connection) await db.rollback(connection)
    throw e
  }
}

async function createAccountForUser(options: IUserAccountCreate): Promise<void> {
  const connection = await db.beginTransaction()
  try {
    const {password, height, weight, experience, purpose, achievement, obstacle, trainerId, place, ...data} = options
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
        place
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
        expiredAt: moment().add(14, 'day').format('YYYY-MM-DD')
      },
      connection
    )
    await Ticket.createRelationExercises({userId, trainerIds: [trainerId], ticketId, franchiseId: 1}, connection)

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

async function refreshToken(accessToken: string, refreshToken: string): Promise<string> {
  try {
    const payload = await JWT.decodeToken(accessToken, {algorithms: ['RS256'], ignoreExpiration: true})
    if (payload.sub) {
      let refreshHash
      if (payload.type === 'user') {
        const user = await User.findOne(payload.sub)
        if (!user) throw new Error('not_found')
        refreshHash = user.password.salt
      }

      await JWT.decodeToken(refreshToken, {algorithms: ['HS256']}, refreshHash)
      return await JWT.createAccessToken({id: payload.sub, type: payload.type})
    }
  } catch (e) {
    throw e
  }
}

export {signIn, createAccountForUser, signOut, refreshToken}
