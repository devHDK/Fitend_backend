import _ from 'lodash'
import moment from 'moment-timezone'
import {IReservationFindAll, IReservationList, IReservationDetail} from '../interfaces/reservation'
import {Reservation, Ticket} from '../models/index'
import {db} from '../loaders'

async function create(options: {
  trainerId: number
  ticketId: number
  reservations: [
    {
      startTime: string
      endTime: string
    }
  ]
}): Promise<void> {
  const connection = await db.beginTransaction()
  try {
    const {trainerId, ticketId, reservations} = options
    const tickets = await Ticket.findOneWithId(ticketId)

    if (tickets) {
      const isMyTicket = tickets.trainers.findIndex((trainer) => trainer.id === trainerId)
      if (isMyTicket === -1) throw new Error('not_allowed')
      if (tickets.expiredAt < moment().add(9, 'hour').format('YYYY-MM-DD')) throw new Error('expired_ticket')
    } else throw new Error('not_found')

    const renewReservations = _.uniqWith(reservations, _.isEqual)
    renewReservations.sort((a, b) => {
      if (a.startTime > b.startTime) return 1
      if (a.startTime < b.startTime) return -1
      return 0
    })

    for (let i = 0; i < renewReservations.length; i++) {
      const {startTime, endTime} = renewReservations[i]
      const reservationDuplicate = await Reservation.findOneWithTime({trainerId, startTime, endTime})
      if (reservationDuplicate > 0) throw new Error('reservation_duplicate')
    }

    const reservationIds = []
    const betweenReservationIds = []
    const laterReservationIds = []

    const prevOrderNum = await Reservation.findCountByTicketIdAndPrevStartTime({
      startTime: renewReservations[0].startTime,
      ticketId
    })

    const betweenReservations = await Reservation.findBetweenReservation({
      startTime: renewReservations[0].startTime,
      endTime: renewReservations[renewReservations.length - 1].startTime,
      ticketId
    })

    let betweenCount = 0

    for (let i = 0; i < renewReservations.length; i++) {
      const {startTime, endTime} = renewReservations[i]

      if (betweenReservations && betweenReservations.length > 0) {
        while (
          betweenCount <= betweenReservations.length - 1 &&
          moment(betweenReservations[betweenCount].startTime).isBefore(moment(renewReservations[i].startTime), 'minute')
        ) {
          await Reservation.update(
            {
              id: betweenReservations[betweenCount].id,
              seq: prevOrderNum + betweenCount + i + 1
            },
            connection
          )
          betweenReservationIds.push({
            reservationId: betweenReservations[betweenCount].id,
            seq: prevOrderNum + betweenCount + i + 1
          })
          betweenCount++
        }
      }
      const reservationId = await Reservation.create(
        {
          ticketId,
          trainerId,
          startTime,
          seq: prevOrderNum + betweenCount + i + 1,
          endTime
        },
        connection
      )
      reservationIds.push({reservationId, seq: prevOrderNum + betweenCount + i + 1})
    }

    const laterReservation = await Reservation.findAllByTicketIdAndLaterStartTime({
      startTime: renewReservations[renewReservations.length - 1].startTime,
      ticketId
    })

    if (laterReservation && laterReservation.length > 0) {
      const laterOrderNum = await Reservation.findCountByTicketIdAndPrevStartTime({
        startTime: moment(laterReservation[0].startTime).format('YYYY-MM-DDTHH:mm:ss'),
        ticketId
      })

      for (let j = 0; j < laterReservation.length; j++) {
        await Reservation.update(
          {
            id: laterReservation[j].id,
            seq: laterOrderNum + 1 + j
          },
          connection
        )
        laterReservationIds.push({reservationId: laterReservation[j].id, seq: laterOrderNum + 1 + j})
      }
    }
    await db.commit(connection)
  } catch (e) {
    if (connection) await db.rollback(connection)
    throw e
  }
}

async function findAll(options: IReservationFindAll): Promise<[IReservationList]> {
  try {
    return await Reservation.findAll(options)
  } catch (e) {
    throw e
  }
}

async function findOneWithId(id: number): Promise<IReservationDetail> {
  try {
    return await Reservation.findOneWithId(id)
  } catch (e) {
    throw e
  }
}

async function update(options: {id: number; startTime: string; endTime: string; status: string}): Promise<void> {
  // const connection = await db.beginTransaction()
  try {
    const {id, startTime, endTime, status} = options
    const prevReservation = await Reservation.findOne(id)
    if (status === 'cancel' && prevReservation.status !== 'cancel') {
    } else {
    }
    // await db.commit(connection)
  } catch (e) {
    // if (connection) await db.rollback(connection)
    throw e
  }
}

// async function updateBookmark(options: {ReservationId: number; trainerId: number}): Promise<void> {
//   try {
//     const {ReservationId, trainerId} = options
//     const isBookmark = await Reservation.findBookmark(ReservationId, trainerId)
//     if (isBookmark) await Reservation.deleteRelationBookmark(ReservationId, trainerId)
//     else await Reservation.createRelationBookmark(ReservationId, trainerId)
//   } catch (e) {
//     throw e
//   }
// }

export {create, findAll, findOneWithId, update}
