// import {code as Code, jwt as JWT} from '../libs'
// import {UserDevice} from '../models'
// import {createPasswordHash, passwordIterations} from '../libs/code'
import {IUser} from '../interfaces/user'
import {User} from '../models'
import type = Mocha.utils.type

const JWT = require('../libs/jwt')
// import {db} from '../loaders'

async function signIn(options: {
  email: string
  password: string
  platform: 'android' | 'ios'
  token: string
}): Promise<{accessToken: string; refreshToken: string; user: IUser}> {
  try {
    const {email, password, platform, token} = options
    const user = await User.findOne({email})
    if (user && (await User.verifyPassword(password, user.password.password, user.password.salt))) {
      const accessToken = await JWT.createAccessToken({id: user.id, type: 'user'})
      const refreshToken = await JWT.createRefreshToken({id: user.id, type: 'user'}, user.password.salt)
      delete user.password
      return {accessToken, refreshToken, user}
    }
    throw new Error('not_found')
  } catch (e) {
    throw e
  }
}

async function refreshToken(accessToken: string, refreshToken: string): Promise<string> {
  try {
    // const payload = await JWT.decodeToken(accessToken, {algorithms: ['RS256'], ignoreExpiration: true})
    // if (payload.sub) {
    //   let refreshHash
    //   if (payload.type === 'presenter') {
    //     const presenter = await Presenter.findOne(payload.sub)
    //     if (!presenter) throw new Error('not_found')
    //     refreshHash = presenter.password.salt
    //   } else {
    //     const student = await Student.findOne(payload.sub)
    //     if (!student) throw new Error('not_found')
    //     refreshHash = student.password.salt
    //   }
    //   await JWT.decodeToken(refreshToken, {algorithms: ['HS256']}, refreshHash)
    //   delete payload.iat
    //   delete payload.exp
    //   delete payload.nbf
    //   delete payload.jti
    //   return await JWT.createAccessToken({id: payload.sub, type: payload.type})
    // }
    throw new Error('invalid_token')
  } catch (e) {
    throw e
  }
}

export {signIn, refreshToken}
