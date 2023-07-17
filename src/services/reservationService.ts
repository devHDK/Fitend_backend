import _ from 'lodash'
import moment from 'moment-timezone'
import {
  IReservationFindAll,
  IReservationList,
  IReservationDetail,
  IReservationFindAllForUser
} from '../interfaces/reservation'
import {Reservation, Ticket, Notification} from '../models/index'
import {db} from '../loaders'
import {util} from '../libs'
import {reservationSubscriber} from '../subscribers'

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
      if (tickets.expiredAt < moment().utc().add(9, 'hour').format('YYYY-MM-DD')) throw new Error('expired_ticket')
      const validReservationCount = await Reservation.findValidCount(ticketId)
      if (tickets.totalSession - validReservationCount < 1) throw new Error('over_sessions')
    } else throw new Error('not_found')

    const renewReservations = _.uniqWith(reservations, _.isEqual)
    renewReservations.sort((a, b) => {
      if (a.startTime > b.startTime) return 1
      if (a.startTime < b.startTime) return -1
      return 0
    })

    let reservationId = 0

    // 겹치는 일정 validation
    // for (let i = 0; i < renewReservations.length; i++) {
    //   const {startTime, endTime} = renewReservations[i]
    //   const reservationDuplicate = await Reservation.findOneWithTime({trainerId, startTime, endTime})
    //   if (reservationDuplicate > 0) throw new Error('reservation_duplicate')
    // }

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
          betweenCount++
        }
      }
      reservationId = await Reservation.create(
        {
          ticketId,
          trainerId,
          startTime,
          seq: prevOrderNum + betweenCount + i + 1,
          endTime
        },
        connection
      )
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
      }
    }

    const userId = tickets.users[0].id
    const contents = `예약이 확정 되었어요 😊\n${util.defaultTimeFormatForPush(renewReservations[0].startTime)}`
    await Notification.create(
      {
        userId,
        type: 'reservation',
        contents,
        info: JSON.stringify({reservationId})
      },
      connection
    )
    reservationSubscriber.publishReservationPushEvent({userId, contents})
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

async function findAllForUser(options: IReservationFindAllForUser): Promise<[IReservationList]> {
  try {
    return await Reservation.findAllForUser(options)
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
  const connection = await db.beginTransaction()
  try {
    const {id, startTime, endTime, status} = options
    const reservedReservation = await Reservation.findOne(id)
    if (!reservedReservation) throw new Error('not_found')
    const {status: reservedStatus, startTime: reservedStartTime, ticketId, times: reservedTimes} = reservedReservation
    const tickets = await Ticket.findOneWithId(reservedReservation.ticketId)
    const userId = tickets.users[0].id

    await Reservation.update(
      {id, status: status === 'noShow' ? 'cancel' : status, startTime, endTime, times: status === 'cancel' ? 0 : 1},
      connection
    )

    if (reservedStatus === 'complete') {
      if (status === 'cancel' || status === 'noShow') {
        if (status === 'cancel') {
          const prevSeq = await Reservation.findCountByTicketIdAndPrevStartTime(
            {
              startTime: moment(reservedStartTime).utc().format('YYYY-MM-DDThh:mm:ss'),
              ticketId
            },
            connection
          )
          const laterReservation = await Reservation.findAllByTicketIdAndLaterStartTime(
            {
              startTime: moment(reservedStartTime).utc().format('YYYY-MM-DDThh:mm:ss'),
              ticketId
            },
            connection
          )
          if (laterReservation && laterReservation.length > 0) {
            for (let j = 0; j < laterReservation.length; j++) {
              await Reservation.update(
                {
                  id: laterReservation[j].id,
                  seq: prevSeq + 1 + j
                },
                connection
              )
            }
          }
        }
        const contents = `예약이 취소 되었어요 🥺\n${util.defaultTimeFormatForPush(reservedStartTime)}`
        await Notification.create(
          {
            userId,
            type: 'reservation',
            contents
          },
          connection
        )
        reservationSubscriber.publishReservationPushEvent({userId, contents})
      } else if (status === 'complete') {
        const isAfter = moment(reservedStartTime).isBefore(moment(startTime), 'minute')
        const betweenReservations = await Reservation.findBetweenReservation(
          {
            ticketId,
            startTime: moment(isAfter ? reservedStartTime : startTime)
              .utc()
              .format('YYYY-MM-DDTHH:mm:ss'),
            endTime: moment(isAfter ? startTime : reservedStartTime)
              .utc()
              .format('YYYY-MM-DDTHH:mm:ss')
          },
          connection
        )
        if (betweenReservations && betweenReservations.length > 0) {
          const prevReservedSeq = await Reservation.findCountByTicketIdAndPrevStartTime(
            {
              ticketId,
              startTime: moment(reservedStartTime).utc().subtract(1, 'second').format('YYYY-MM-DDTHH:mm:ss')
            },
            connection
          )
          const prevSeq = await Reservation.findCountByTicketIdAndPrevStartTime(
            {
              ticketId,
              startTime: moment(startTime).utc().format('YYYY-MM-DDTHH:mm:ss')
            },
            connection
          )
          await Reservation.update(
            {
              id,
              seq: prevSeq + 1
            },
            connection
          )
          for (let j = 0; j < betweenReservations.length; j++) {
            await Reservation.update(
              {
                id: betweenReservations[j].id,
                seq: isAfter ? prevReservedSeq + j + 1 : prevSeq + 2 + j
              },
              connection
            )
          }
        }
        const contents = `예약이 변경 되었어요 ✍️\n${util.changeTimeFormatForPush(reservedStartTime, startTime)}`
        await Notification.create(
          {
            userId,
            type: 'reservation',
            contents,
            info: JSON.stringify({reservationId: id})
          },
          connection
        )
        reservationSubscriber.publishReservationPushEvent({userId, contents})
      } else if (status === 'attendance') {
        const contents = `출석이 완료 되었어요 ✅️\n${util.defaultTimeFormatForPush(reservedStartTime)}`
        await Notification.create(
          {
            userId,
            type: 'reservation',
            contents,
            info: JSON.stringify({reservationId: id})
          },
          connection
        )
        reservationSubscriber.publishReservationPushEvent({userId, contents})
      }
    } else if (reservedStatus === 'attendance' || (reservedStatus === 'cancel' && reservedTimes === 1)) {
      if (status !== 'complete') throw new Error('not_allowed')
    } else throw new Error('not_allowed')
    await db.commit(connection)
  } catch (e) {
    if (connection) await db.rollback(connection)
    throw e
  }
}

// async function deleteOne(id: number): Promise<void> {
//   const connection = await db.beginTransaction()
//   try {
//     await db.commit(connection)
//   } catch (e) {
//     if (connection) await db.rollback(connection)
//     throw e
//   }
// }

export {create, findAll, findAllForUser, findOneWithId, update}
