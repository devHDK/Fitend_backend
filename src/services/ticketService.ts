import moment from 'moment-timezone'
import {Reservation, Ticket, TicketHolding} from '../models/index'
import {db} from '../loaders'
import {ITicketFindAll, ITicketList, ITicketDetail} from '../interfaces/tickets'
import {IReservationListForTicket} from '../interfaces/reservation'
import {ITicketHolding, ITicketHoldingFindAll, ITicketHoldingUpdate} from '../interfaces/ticketHoldings'

moment.tz.setDefault('Asia/Seoul')

interface ITicketDetailWithReservationsAndHoldings extends ITicketDetail {
  reservations: IReservationListForTicket[]
  holdings: ITicketHoldingFindAll[]
}

async function create(options: {
  type: 'personal' | 'fitness'
  userId: number
  trainerIds: number[]
  franchiseId: number
  totalSession: number
  serviceSession: number
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
      serviceSession,
      sessionPrice,
      coachingPrice,
      startedAt,
      expiredAt
    } = options

    if (moment(expiredAt).isSameOrBefore(moment(startedAt))) {
      throw Error('past_date_error')
    }
    const ticketId = await Ticket.create(
      {
        type,
        totalSession,
        serviceSession,
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
    if (e.message === 'past_date_error') e.status = 402
    throw e
  }
}

async function createTicketHolding(options: ITicketHolding): Promise<void> {
  const connection = await db.beginTransaction()
  try {
    const {ticketId, startAt, endAt} = options
    const currentTime = moment().format('YYYY-MM-DD')

    if (
      moment(startAt).isBefore(currentTime) ||
      moment(endAt).isBefore(currentTime) ||
      moment(endAt).isSameOrBefore(moment(startAt))
    ) {
      throw Error('past_date_error')
    }

    const holdings = await TicketHolding.findAllWithTicketId(ticketId)
    if (holdings.length) {
      holdings.forEach((ticketHold) => {
        if (
          moment(startAt).isSameOrBefore(moment(ticketHold.endAt)) &&
          moment(ticketHold.startAt).isSameOrBefore(moment(endAt))
        ) {
          throw Error('date_overlap')
        }
      })
    }
    const days = moment(endAt).diff(moment(startAt), 'days')
    const ticket = await Ticket.findOne({id: ticketId})
    const newExpiredAt = moment(ticket.expiredAt).add(days, 'days').format('YYYY-MM-DD')

    await TicketHolding.create({ticketId, startAt, endAt, days: days + 1}, connection)
    await Ticket.update(
      {
        id: ticket.id,
        type: ticket.type,
        totalSession: ticket.totalSession,
        serviceSession: ticket.serviceSession,
        sessionPrice: ticket.sessionPrice,
        coachingPrice: ticket.coachingPrice,
        startedAt: ticket.startedAt,
        expiredAt: newExpiredAt
      },
      connection
    )
    await db.commit(connection)
  } catch (e) {
    if (connection) await db.rollback(connection)
    if (e.message === 'past_date_error') e.status = 402
    if (e.message === 'date_overlap') e.status = 403
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

async function findOneWithId(id: number): Promise<ITicketDetailWithReservationsAndHoldings> {
  try {
    const ticket = await Ticket.findOneWithId(id)
    const reservations = await Reservation.findAllWithTicketId(id)
    const holdings = await TicketHolding.findAllWithTicketId(id)

    return {...ticket, reservations, holdings}
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
  serviceSession: number
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
      serviceSession,
      sessionPrice,
      coachingPrice,
      startedAt,
      expiredAt
    } = options
    const reservationValidCount = await Reservation.findValidCount(id)
    if (totalSession < reservationValidCount) throw new Error('not_allowed')
    if (moment(expiredAt).isSameOrBefore(moment(startedAt))) {
      throw Error('past_date_error')
    }
    await Ticket.update(
      {id, type, totalSession, serviceSession, sessionPrice, coachingPrice, startedAt, expiredAt},
      connection
    )
    await Ticket.deleteRelations(id, connection)
    await Ticket.createRelationExercises({userId, trainerIds, ticketId: id, franchiseId}, connection)
    await db.commit(connection)
  } catch (e) {
    if (connection) await db.rollback(connection)
    if (e.message === 'past_date_error') e.status = 402
    throw e
  }
}

async function updateTicketHolding(options: ITicketHoldingUpdate): Promise<void> {
  const connection = await db.beginTransaction()
  try {
    const {id, startAt, endAt} = options

    const beforeTicketHolding = await TicketHolding.findOneWithId(id)

    const holdings = await TicketHolding.findAllWithTicketId(beforeTicketHolding.ticketId)
    if (holdings.length) {
      holdings.forEach((ticketHold) => {
        if (
          moment(startAt).isSameOrBefore(moment(ticketHold.endAt)) &&
          moment(ticketHold.startAt).isSameOrBefore(moment(endAt)) &&
          ticketHold.id !== id
        ) {
          throw Error('date_overlap')
        }
      })
    }

    const beforeDays = beforeTicketHolding.days
    const afterDays = moment(endAt).diff(moment(startAt), 'days')
    const ticket = await Ticket.findOne({id: beforeTicketHolding.ticketId})
    const newExpiredAt = moment(ticket.expiredAt)
      .add(afterDays - beforeDays, 'days')
      .format('YYYY-MM-DD')

    await TicketHolding.update({id, startAt, endAt, days: afterDays + 1}, connection)
    await Ticket.update(
      {
        id: ticket.id,
        type: ticket.type,
        totalSession: ticket.totalSession,
        serviceSession: ticket.serviceSession,
        sessionPrice: ticket.sessionPrice,
        coachingPrice: ticket.coachingPrice,
        startedAt: ticket.startedAt,
        expiredAt: newExpiredAt
      },
      connection
    )

    await db.commit(connection)
  } catch (e) {
    if (connection) await db.rollback(connection)
    if (e.message === 'date_overlap') e.status = 403
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

async function deleteTicketHolding(id: number): Promise<void> {
  const connection = await db.beginTransaction()
  try {
    const beforeTicketHolding = await TicketHolding.findOneWithId(id)
    const ticket = await Ticket.findOne({id: beforeTicketHolding.ticketId})
    const newExpiredAt = moment(ticket.expiredAt).subtract(beforeTicketHolding.days, 'days').format('YYYY-MM-DD')

    await TicketHolding.deleteOne(id)
    await Ticket.update(
      {
        id: ticket.id,
        type: ticket.type,
        totalSession: ticket.totalSession,
        serviceSession: ticket.serviceSession,
        sessionPrice: ticket.sessionPrice,
        coachingPrice: ticket.coachingPrice,
        startedAt: ticket.startedAt,
        expiredAt: newExpiredAt
      },
      connection
    )
    await db.commit(connection)
  } catch (e) {
    if (connection) await db.rollback(connection)
    throw e
  }
}

export {
  create,
  createTicketHolding,
  findAll,
  findOneWithId,
  update,
  updateTicketHolding,
  deleteOne,
  deleteTicketHolding
}
