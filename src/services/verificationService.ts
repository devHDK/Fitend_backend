import {IVerificationCreate} from '../interfaces/verification'
import {jwt as JWT} from '../libs'
import {db} from '../loaders'
import {sendVerificationCodeWithMessage} from '../loaders/sms'
import {User, Verification} from '../models'

async function postVerifications(options: IVerificationCreate): Promise<{codeToken: string; expireAt: Date}> {
  const connection = await db.beginTransaction()
  try {
    const {type, phone, email} = options

    if (type === 'register') {
      const user = await User.findOne({phone})
      // if (user) throw new Error('already_in_use')
    } else if (type === 'reset') {
      // if (email === null) throw new Error('wrong_input')
      const user = await User.findOne({phone})
      if (!user) throw new Error('not_found')
    } else if (type === 'id') {
      const user = await User.findOne({phone})
      if (!user) throw new Error('not_found')
    }

    const verification = await Verification.findOne({type, phone})
    if (verification) {
      const checkDate = new Date(verification.createdAt)
      checkDate.setMinutes(checkDate.getMinutes() + 1)
      const now = new Date()
      if (now.getTime() < checkDate.getTime()) {
        throw new Error('already_sended')
      }
    }
    const {id, code} = await Verification.createVerification({phone, type}, connection)
    const exp = Math.floor(Date.now() / 1000) + 3 * 60
    const expireAt = new Date(exp * 1000)
    const codeToken = await JWT.createToken({sub: id, exp, type}, {algorithm: 'RS256'})
    const ret = {codeToken, expireAt}

    if (process.env.NODE_ENV !== 'production') {
      ret.codeToken = codeToken
      await sendVerificationCodeWithMessage(phone, code)
    } else {
      await sendVerificationCodeWithMessage(phone, code)
    }

    await db.commit(connection)

    return ret
  } catch (e) {
    if (connection) await db.rollback(connection)
    if (e.code === 'ER_DUP_ENTRY') {
      throw new Error('already_in_use')
    }
    throw e
  }
}

async function postVerificationsConfirm(options: {
  codeToken: string
  code: number
}): Promise<{email?: string; phoneToken?: string}> {
  const connection = await db.beginTransaction()
  try {
    const {codeToken, code} = options
    const {sub: id, type} = await JWT.decodeToken(codeToken, {algorithms: ['RS256']})
    const verification = await Verification.findOne({id, used: false})
    if (verification) {
      const {code: savedCode} = verification
      if (code === savedCode) {
        if (type === 'id' || type === 'reset') {
          const {email} = await User.findOne({phone: verification.phone})
          await Verification.updateVerification({id, confirmed: true}, connection)
          const exp = Math.floor(Date.now() / 1000) + 30 * 60
          const phoneToken = await JWT.createToken({sub: id, exp}, {algorithm: 'RS256'})

          await db.commit(connection)
          return {email, phoneToken}
        }
        if (type === 'register') {
          const user = await User.findOne({phone: verification.phone})

          if (user) {
            await db.commit(connection)
            return {email: user.email}
          }

          await Verification.updateVerification({id, confirmed: true}, connection)
          const exp = Math.floor(Date.now() / 1000) + 30 * 60
          const phoneToken = await JWT.createToken({sub: id, exp}, {algorithm: 'RS256'})
          await db.commit(connection)
          return {phoneToken}
        }
      }
      throw new Error('wrong_code')
    } else {
      throw new Error('auth_time_expired')
    }
  } catch (e) {
    if (connection) await db.rollback(connection)
    throw e
  }
}

export {postVerifications, postVerificationsConfirm}
