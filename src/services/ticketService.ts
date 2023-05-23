import {Ticket} from '../models/index'
import {db} from '../loaders'
import {ITicketFindAll, ITicketList, ITicketDetail} from '../interfaces/tickets'

async function create(options: {
  type: 'personal' | 'fitness'
  userId: number
  trainerIds: number[]
  franchiseId: number
  totalSession: number
  startedAt: string
  expiredAt: string
}): Promise<void> {
  const connection = await db.beginTransaction()
  try {
    const {type, userId, trainerIds, franchiseId, totalSession, startedAt, expiredAt} = options
    const ticketId = await Ticket.create(
      {
        type,
        totalSession,
        startedAt,
        expiredAt
      },
      connection
    )
    await Ticket.createRelationExercises({userId, trainerIds, ticketId, franchiseId}, connection)
    await db.commit(connection)
  } catch (e) {
    if (connection) await db.rollback(connection)
    throw e
  }
}

async function findAll(options: ITicketFindAll): Promise<ITicketList> {
  try {
    return await Ticket.findAll(options)
  } catch (e) {
    throw e
  }
}

async function findOneWithId(id: number): Promise<ITicketDetail> {
  try {
    return await Ticket.findOneWithId(id)
  } catch (e) {
    throw e
  }
}

async function update(options: {
  id: number
  type: 'personal' | 'fitness'
  userId: number
  trainerIds: number[]
  franchiseId: number
  totalSession: number
  startedAt: string
  expiredAt: string
}): Promise<void> {
  const connection = await db.beginTransaction()
  try {
    const {id, type, userId, trainerIds, franchiseId, totalSession, startedAt, expiredAt} = options
    await Ticket.update({id, type, totalSession, startedAt, expiredAt}, connection)
    await Ticket.deleteRelations(id, connection)
    await Ticket.createRelationExercises({userId, trainerIds, ticketId: id, franchiseId}, connection)
    await db.commit(connection)
  } catch (e) {
    if (connection) await db.rollback(connection)
    throw e
  }
}

async function deleteOne(id: number): Promise<void> {
  try {
    await Ticket.deleteOne(id)
  } catch (e) {
    throw e
  }
}

export {create, findAll, findOneWithId, update, deleteOne}
