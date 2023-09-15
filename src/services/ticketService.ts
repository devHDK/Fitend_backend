import {print} from 'redis'
import {Reservation, Ticket} from '../models/index'
import {db} from '../loaders'
import {ITicketFindAll, ITicketList, ITicketDetail} from '../interfaces/tickets'
import {IReservationListForTicket} from '../interfaces/reservation'

interface ITicketDetailWithReservations extends ITicketDetail {
  reservations: IReservationListForTicket[]
}

async function create(options: {
  type: 'personal' | 'fitness'
  userId: number
  trainerIds: number[]
  franchiseId: number
  totalSession: number
  sessionPrice: number
  coachingPrice: number
  startedAt: string
  expiredAt: string
}): Promise<void> {
  const connection = await db.beginTransaction()
  try {
    const {
      type,
      userId,
      trainerIds,
      franchiseId,
      totalSession,
      sessionPrice,
      coachingPrice,
      startedAt,
      expiredAt
    } = options
    const ticketId = await Ticket.create(
      {
        type,
        totalSession,
        sessionPrice,
        coachingPrice,
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

async function findOneWithId(id: number): Promise<ITicketDetailWithReservations> {
  try {
    const ticket = await Ticket.findOneWithId(id)
    const reservations = await Reservation.findAllWithTicketId(id)
    return {...ticket, reservations}
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
  sessionPrice: number
  coachingPrice: number
  startedAt: string
  expiredAt: string
}): Promise<void> {
  const connection = await db.beginTransaction()
  try {
    const {
      id,
      type,
      userId,
      trainerIds,
      franchiseId,
      totalSession,
      sessionPrice,
      coachingPrice,
      startedAt,
      expiredAt
    } = options
    const reservationValidCount = await Reservation.findValidCount(id)
    console.log(reservationValidCount)
    if (totalSession < reservationValidCount) throw new Error('not_allowed')
    await Ticket.update({id, type, totalSession, sessionPrice, coachingPrice, startedAt, expiredAt}, connection)
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
