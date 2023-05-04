import crypto from 'crypto'
import moment from 'moment-timezone'

moment.tz.setDefault('Asia/Seoul')

interface IPasswordHash {
  password: string
  salt: string
}

const passwordIterations = {
  mobile: 132436,
  admin: 123853
}

function generateRandomCode(digit: number): number {
  const max = 10 ** digit
  const min = 10 ** (digit - 1)
  return Math.floor(Math.random() * (max - min) + min)
}

function generateRandomHash(length: number): string {
  return crypto
    .randomBytes(length)
    .toString('base64')
    .replace(/[^A-Za-z0-9]/g, '')
}

const createPasswordHash = (password: string, iterations: number): IPasswordHash => {
  try {
    const salt = generateRandomHash(64)
    const key = crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha512')
    return {password: key.toString('base64'), salt}
  } catch (e) {
    throw e
  }
}

function verifyPassword(password: string, hash: string, salt: string, iterations: number): boolean {
  try {
    const key = crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha512')
    return key.toString('base64') === hash
  } catch (e) {
    return false
  }
}

export {passwordIterations, generateRandomCode, generateRandomHash, createPasswordHash, verifyPassword}
