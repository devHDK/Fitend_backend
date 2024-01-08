import {PoolConnection} from 'mysql'
import {IVerification, IVerificationCreate, IVerificationFindOne, IVerificationUpdate} from '../interfaces/verification'

const db = require('../components/db')
const Code = require('../libs/code')

const tableName = 'Verifications'

async function createVerification(
  options: IVerificationCreate,
  connection: PoolConnection
): Promise<{id: number; phone: string; code: string; type: string}> {
  const {phone, type} = options
  try {
    const code = Code.generateRandomCode(6)
    const {insertId} = await db.query({
      connection,
      sql: `INSERT INTO ?? SET ?
      ON DUPLICATE KEY UPDATE code = VALUES(code), confirmed = false, used = false, createdAt = NOW()`,
      values: [tableName, {phone, code, type}]
    })
    return {id: insertId, phone, code, type}
  } catch (err) {
    throw err
  }
}

async function findOne(options: IVerificationFindOne): Promise<IVerification> {
  try {
    const {id, type, phone, confirmed, used} = options
    const where = []
    if (type) where.push(`type = '${type}'`)
    if (id) where.push(`id = ${id}`)
    if (phone) where.push(`phone = '${phone}'`)
    if (confirmed) where.push(`confirmed = ${confirmed}`)
    if (typeof used !== 'undefined') where.push(`used = ${used}`)
    const rows = await db.query({
      sql: `SELECT * FROM ?? WHERE ${where.join(' AND ')} ORDER BY createdAt DESC`,
      values: [tableName]
    })
    return rows[0]
  } catch (err) {
    throw err
  }
}

async function updateVerification(
  options: IVerificationUpdate,
  connection: PoolConnection
): Promise<IVerificationUpdate> {
  const {id, ...data} = options
  try {
    const {affectedRows} = await db.query({
      connection,
      sql: `UPDATE ?? SET ? WHERE ? `,
      values: [tableName, data, {id}]
    })
    if (affectedRows > 0) return options
  } catch (e) {
    throw e
  }
}

export {createVerification, findOne, updateVerification}
