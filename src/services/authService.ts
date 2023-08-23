import {code as Code, jwt as JWT} from '../libs'
import {IUser} from '../interfaces/user'
import {User, Ticket, UserDevice, Trainer} from '../models'
import {db} from '../loaders'

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
      const forbiddenDeviceList = await Trainer.findDeviceList()

      if (existDevices.length > 1) {
        for (const device of existDevices) {
          if (forbiddenDeviceList.includes(device.deviceId)) {
            await UserDevice.deleteOne(device.deviceId, user.id, connection)
          }
        }
      }

      if (token) {
        await User.updateOne({id: user.id, deviceId, platform}, connection)
        await UserDevice.upsertOne({userId: user.id, platform, deviceId, token}, connection)
        await UserDevice.updateOne({userId: user.id, platform, deviceId, isNotification: true}, connection)
      }

      delete user.password
      await db.commit(connection)
      return {
        accessToken,
        refreshToken,
        user: {
          ...user,
          isNotification: userDevice ? userDevice.isNotification : true
        }
      }
    }
    throw new Error('invalid_password')
  } catch (e) {
    if (connection) await db.rollback(connection)
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

export {signIn, signOut, refreshToken}
