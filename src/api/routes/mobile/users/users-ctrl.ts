import {Response} from 'express'
import {UserService} from '../../../../services'
import {jwt as JWT} from '../../../../libs'

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

export {getMe}
