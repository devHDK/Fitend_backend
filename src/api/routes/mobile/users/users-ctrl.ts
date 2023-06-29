import {Response} from 'express'
import {UserService} from '../../../../services'
import {jwt as JWT} from '../../../../libs'
import {Ticket} from '../../../../models'

async function postUsersPasswordConfirm(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    await UserService.confirmPassword({id: req.userId, password: req.options.password})
    res.status(200).json()
  } catch (e) {
    if (e.message === 'not_found') e.status = 404
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
    const isActive = await Ticket.findOneWithUserId(user.id)
    if (!isActive) throw new Error('ticket_expired')
    delete user.password
    res.status(200).json({user})
  } catch (e) {
    if (e.message === 'ticket_expired') e.status = 401
    next(e)
  }
}

async function putUsersPassword(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {password, newPassword} = req.options
    await UserService.updatePassword({id: req.userId, password, newPassword})
    res.status(200).json()
  } catch (e) {
    if (e.message === 'not_found') e.status = 404
    next(e)
  }
}

export {postUsersPasswordConfirm, getMe, putUsersPassword}
