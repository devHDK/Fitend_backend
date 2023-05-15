import {Response} from 'express'
import {jwt as JWT} from '../../libs'

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
      if (e.message === 'forbidden') res.status(403).json({message: 'forbidden'})
      else res.status(401).json({message: 'invalid_token'})
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
      if (e.message === 'forbidden') res.status(403).json({message: 'forbidden'})
      else res.status(401).json({message: 'invalid_token'})
    }
  }
}

function web() {
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
      if (e.message === 'forbidden') res.status(403).json({message: 'forbidden'})
      else res.status(401).json({message: 'invalid_token'})
    }
  }
}

export {user, admin, web}
