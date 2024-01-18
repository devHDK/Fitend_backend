import {PoolConnection, escape} from 'mysql'
import {db} from '../loaders'
import {IPayment, IPaymentCreate, IPaymentList} from '../interfaces/payments'
import {Ticket, User} from '.'

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

async function findAll(options: {search: string; start: number; perPage: number}): Promise<IPaymentList> {
  try {
    const {search, start, perPage} = options
    const where = []

    if (search) where.push(`(u.nickname like '%${search}%')`)
    const rows = await db.query({
      sql: `SELECT t.id, t.ticketId, u.nickname as userNickname,
            t.price, t.orderName, t.status, t.createdAt
            FROM ?? t
            JOIN ?? tr ON tr.ticketId = t.ticketId
            JOIN ?? u ON u.id = tr.userId
            ${where.length ? `WHERE ${where.join(' AND ')}` : ''} 
            GROUP BY t.id
            ORDER BY t.createdAt DESC
            LIMIT ${start}, ${perPage}
            `,
      values: [tableName, Ticket.tableTicketRelation, User.tableName]
    })
    const [rowTotal] = await db.query({
      sql: `SELECT COUNT(1) as total FROM (SELECT t.id, t.ticketId, u.nickname as userNickname, 
        t.price, t.orderName, t.status, t.createdAt
        FROM ?? t
        JOIN ?? tr ON tr.ticketId = t.ticketId
        JOIN ?? u ON u.id = tr.userId
        ${where.length ? `WHERE ${where.join(' AND ')}` : ''} 
        GROUP BY t.ticketId
        ORDER BY t.createdAt DESC
        ) t`,
      values: [tableName, Ticket.tableTicketRelation, User.tableName]
    })
    return {data: rows, total: rowTotal ? rowTotal.total : 0}
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

export {tableName, findAll, findOneWithTicketId, create, DeleteWithTicketId}
