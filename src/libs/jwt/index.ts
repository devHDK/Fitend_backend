import jwt, {Secret, SignOptions, VerifyOptions} from 'jsonwebtoken'
import fs from 'fs'

const privateKey = fs.readFileSync(`${__dirname}/private.pem`)
const publicKey = fs.readFileSync(`${__dirname}/public.pem`)

interface IResetPasswordPayload {
  email: string
  type: 'student'
}

interface IUserPayload {
  id: number
  type?: string
}

async function createToken(payload: Dictionary, options: SignOptions, secret: Secret = privateKey): Promise<string> {
  try {
    return await jwt.sign(payload, secret, options)
  } catch (e) {
    throw e
  }
}

async function decodeToken(token: string, options: VerifyOptions, secret: Secret = publicKey): Promise<any> {
  try {
    return await jwt.verify(token, secret, options)
  } catch (e) {
    throw new Error('invalid_token')
  }
}

async function createAccessToken(data: IUserPayload): Promise<string> {
  try {
    const {id} = data
    const payload: Dictionary = {sub: id}
    return await createToken(payload, {
      algorithm: 'RS256',
      expiresIn: 60 * 60 * 24 * 30
      // expiresIn: 60 * 2
    })
  } catch (e) {
    throw e
  }
}

async function createAccessTokenForTrainer(data: {
  id: number
  franchiseId: number
  role?: 'master' | 'external'
}): Promise<string> {
  try {
    const {id, franchiseId, role} = data
    const payload: Dictionary = {sub: id, franchiseId, role}
    return await createToken(payload, {
      algorithm: 'RS256',
      expiresIn: 60 * 60 * 24 * 30
      // expiresIn: 60 * 2
    })
  } catch (e) {
    throw e
  }
}

async function createRefreshToken(data: IUserPayload, tokenSecret: Secret): Promise<string> {
  try {
    const payload = {
      sub: data.id
    }
    return await createToken(payload, {algorithm: 'HS256', expiresIn: 60 * 60 * 30}, tokenSecret)
  } catch (e) {
    throw e
  }
}

async function createRefreshTokenForTrainer(
  data: {id: number; franchiseId: number; role?: 'master' | 'external'},
  tokenSecret: Secret
): Promise<string> {
  try {
    const payload = {
      sub: data.id,
      franchiseId: data.franchiseId,
      role: data.role
    }
    return await createToken(payload, {algorithm: 'HS256', expiresIn: 60 * 60 * 30}, tokenSecret)
  } catch (e) {
    throw e
  }
}

export {
  decodeToken,
  createToken,
  createAccessToken,
  createAccessTokenForTrainer,
  createRefreshToken,
  createRefreshTokenForTrainer
}
