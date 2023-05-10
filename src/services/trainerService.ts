// import {code as Code, jwt as JWT} from '../libs'
// import {UserDevice} from '../models'
// import {createPasswordHash, passwordIterations} from '../libs/code'
import {ITrainer} from '../interfaces/trainer'
import { Trainer, User } from "../models/index";
import {findOne} from "../models/trainer";
import { code as Code } from "../libs";
import { createPasswordHash, passwordIterations } from "../libs/code";
// import {db} from '../loaders'

async function signIn(options: {
  email: string
  password: string
}): Promise<{accessToken: string; refreshToken: string; trainer: ITrainer}> {
  try {
    const {email, password} = options
    const trainer = await Trainer.findOne({email})
    if (
      trainer &&
      Code.verifyPassword(password, trainer.password, trainer.salt, passwordIterations.web)
    ) {
      const accessToken = ''
      const refreshToken = ''
      return {accessToken, refreshToken, trainer}
    } else throw new Error('not_found')
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
