import {ITrainer} from '../interfaces/trainer'
import { Trainer } from "../models/index"
import { code as Code, jwt as JWT } from "../libs"
import { passwordIterations } from "../libs/code"

async function signIn(options: {
  email: string
  password: string
}): Promise<{accessToken: string; trainer: ITrainer}> {
  try {
    const {email, password} = options
    const trainer = await Trainer.findOne({email})
    if (
      trainer &&
      Code.verifyPassword(password, trainer.password.password, trainer.password.salt, passwordIterations.web)
    ) {
      const accessToken = await JWT.createAccessToken({id: trainer.id, type: 'user'})
      delete trainer.password
      return {accessToken, trainer}
    } else throw new Error('not_found')
  } catch (e) {
    throw e
  }
}

export {signIn}
