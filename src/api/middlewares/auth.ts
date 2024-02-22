import {Response} from 'express'
import {jwt as JWT} from '../../libs'
import {Trainer} from '../../models'

function user() {
  return async function (req: IRequest, res: Response, next?: Function): Promise<void> {
    try {
      const {authorization} = req.headers
      if (authorization && authorization.split(' ')[0] === 'Bearer') {
        const jwtToken = await JWT.decodeToken(authorization.split(' ')[1], {algorithms: ['RS256']})
        if (jwtToken.sub) {
          req.userId = jwtToken.sub
          req.userType = jwtToken.type
          next()
        }
      } else res.status(401).json({message: 'invalid_token'})
    } catch (e) {
      res.status(401).json({message: 'invalid_token'})
    }
  }
}

function admin() {
  return async function (req: IRequest, res: Response, next?: Function): Promise<void> {
    try {
      const {authorization} = req.headers
      if (authorization && authorization.split(' ')[0] === 'Bearer') {
        const jwtToken = await JWT.decodeToken(authorization.split(' ')[1], {algorithms: ['RS256']})
        if (jwtToken.sub) {
          req.userId = jwtToken.sub
          next()
        }
      } else res.status(401).json({message: 'invalid_token'})
    } catch (e) {
      res.status(401).json({message: 'invalid_token'})
    }
  }
}

function web(roles: string[]) {
  return async function (req: IRequest, res: Response, next?: Function): Promise<void> {
    try {
      const {authorization} = req.headers
      if (authorization && authorization.split(' ')[0] === 'Bearer') {
        const jwtToken = await JWT.decodeToken(authorization.split(' ')[1], {algorithms: ['RS256']})
        if (jwtToken.sub) {
          req.userId = jwtToken.sub
          req.franchiseId = jwtToken.franchiseId
          if (roles.length !== 0) {
            if (roles.indexOf(jwtToken.role) !== -1) {
              const trainer = await Trainer.findOne({id: jwtToken.sub})
              if (trainer && trainer.role === jwtToken.role) next()
              else res.status(401).json({message: 'invalid_token'})
            } else res.status(401).json({message: 'invalid_token'})
          } else {
            next()
          }
        }
      } else res.status(401).json({message: 'invalid_token'})
    } catch (e) {
      res.status(401).json({message: 'invalid_token'})
    }
  }
}

export {user, admin, web}
