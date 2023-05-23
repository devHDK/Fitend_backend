import {ITrainer, ITrainerList} from '../interfaces/trainer'
import {Trainer} from '../models/index'
import {code as Code, jwt as JWT} from '../libs'
import {passwordIterations} from '../libs/code'

async function signIn(options: {email: string; password: string}): Promise<{accessToken: string; trainer: ITrainer}> {
  try {
    const {email, password} = options
    const trainer = await Trainer.findOne({email})
    if (
      trainer &&
      Code.verifyPassword(password, trainer.password.password, trainer.password.salt, passwordIterations.web)
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

export {signIn, findAll}
