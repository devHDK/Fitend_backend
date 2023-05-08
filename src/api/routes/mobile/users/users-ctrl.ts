import {Response} from 'express'
import {db} from '../../../../loaders'
import {UserService} from '../../../../services'
import {IUser} from '../../../../interfaces/user'
import {jwt as JWT} from '../../../../libs'

async function createUser(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {email, nickname, password} = req.options
    const ret = await UserService.create({email, nickname, password})

    res.status(200).json(ret)
  } catch (e) {
    next(e)
  }
}

async function getMe(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {authorization} = req.headers
    if (authorization && authorization.split(' ')[0] === 'Bearer') {
      const jwtToken = await JWT.decodeToken(authorization.split(' ')[1], {algorithms: ['RS256']})
      if (jwtToken.sub) {
        req.userId = jwtToken.sub
        req.userType = jwtToken.type
      }
    }
    const user = await UserService.getMe({id: req.userId})

    delete user.password

    res.status(200).json({user})
  } catch (e) {
    next(e)
  }
}

export {createUser, getMe}
