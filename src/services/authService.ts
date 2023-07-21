import {code as Code, jwt as JWT} from '../libs'
import {IUser} from '../interfaces/user'
import {User, Ticket, UserDevice} from '../models'
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
      const isActive = await Ticket.findOneWithUserId(user.id)
      if (!isActive) throw new Error('not_allowed')
      const accessToken = await JWT.createAccessToken({id: user.id, type: 'user'})
      const refreshToken = await JWT.createRefreshToken({id: user.id, type: 'user'}, user.password.salt)
      await User.updateOne({id: user.id, deviceId, platform}, connection)
      if (token) {
        await UserDevice.upsertOne({userId: user.id, platform, deviceId, token}, connection)
      }
      delete user.password
      await db.commit(connection)
      return {accessToken, refreshToken, user}
    }
    throw new Error('invalid_password')
  } catch (e) {
    if (connection) await db.rollback(connection)
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

export {signIn, refreshToken}
