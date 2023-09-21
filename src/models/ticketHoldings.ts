import moment from 'moment-timezone'
import {PoolConnection, escape} from 'mysql'
import {db} from '../loaders'
import {ITicketHolding, ITicketHoldingFindAll, ITicketHoldingUpdate} from '../interfaces/ticketHoldings'

moment.tz.setDefault('Asia/Seoul')

const tableName = 'TicketHoldings'

async function create(options: ITicketHolding, connection: PoolConnection): Promise<number> {
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

async function findAllWithTicketId(ticketId: number): Promise<[ITicketHoldingFindAll]> {
  try {
    return await db.query({
      sql: `SELECT *
            FROM ?? th 
            WHERE th.ticketId = ${escape(ticketId)}
            ORDER BY r.startTime DESC`,
      values: [tableName]
    })
  } catch (e) {
    throw e
  }
}

async function update(options: ITicketHoldingUpdate, connection: PoolConnection): Promise<void> {
  const {id, ...data} = options
  try {
    await db.query({
      connection,
      sql: `UPDATE ?? SET ? WHERE ? `,
      values: [tableName, data, {id}]
    })
  } catch (e) {
    throw e
  }
}

async function deleteOne(id: number, connection?: PoolConnection): Promise<void> {
  try {
    await db.query({
      connection,
      sql: `DELETE FROM ?? WHERE ?`,
      values: [tableName, {id}]
    })
  } catch (e) {
    throw e
  }
}

export {tableName, create, findAllWithTicketId, update, deleteOne}
