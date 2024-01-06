import {PoolConnection, escape} from 'mysql'
import {db} from '../loaders'
import {IPayment, IPaymentCreate} from '../interfaces/payments'

const tableName = 'Payments'

async function create(options: IPaymentCreate, connection: PoolConnection): Promise<number> {
  try {
    const {insertId} = await db.query({
      connection,
      sql: `INSERT INTO ?? SET ?`,
      values: [tableName, options]
    })
    return insertId
  } catch (e) {
    throw e
  }
}

async function findOneWithTicketId(options: {ticketId: number}, connection?: PoolConnection): Promise<IPayment> {
  try {
    const [row] = await db.query({
      connection,
      sql: `SELECT * FROM ?? WHERE ?`,
      values: [tableName, options]
    })
    return row
  } catch (e) {
    throw e
  }
}

async function DeleteWithTicketId(ticketId: number, connection?: PoolConnection): Promise<void> {
  try {
    await db.query({
      sql: `DELETE FROM ?? WHERE ?`,
      values: [tableName, {ticketId}]
    })
  } catch (e) {
    throw e
  }
}

export {tableName, findOneWithTicketId, create, DeleteWithTicketId}
