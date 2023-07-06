import {IReservationFindAll, IReservationList, IReservationDetail} from '../interfaces/reservation'
import {Reservation, Ticket} from '../models/index'
// import {db} from '../loaders'

async function create(options: {
  trainerId: number
  ticketId: number
  startTime: string
  endTime: string
}): Promise<void> {
  try {
    const {trainerId, ticketId, startTime, endTime} = options
    const tickets = await Ticket.findOneWithId(ticketId)
    if (tickets) {
      const isMyTicket = tickets.trainers.findIndex((trainer) => trainer.id === trainerId)
      if (isMyTicket === -1) throw new Error('not_allowed')
    } else throw new Error('not_found')
    const isDuplicate = await Reservation.findOneWithTime({trainerId, startTime, endTime})
    if (isDuplicate) throw new Error('reservation_duplicate')
    const lastReservationSeq = await Reservation.findLastReservation(ticketId)
    await Reservation.create({ticketId, trainerId, startTime, endTime, seq: lastReservationSeq + 1})
  } catch (e) {
    throw e
  }
}

async function findAll(options: IReservationFindAll): Promise<IReservationList> {
  try {
    return await Reservation.findAll(options)
  } catch (e) {
    throw e
  }
}

// async function findOneWithId(id: number, trainerId: number): Promise<IReservationDetail> {
//   try {
//     return await Reservation.findOneWithId(id, trainerId)
//   } catch (e) {
//     throw e
//   }
// }
//
// async function update(options: {
//   id: number
//   title: string
//   subTitle: string
//   totalTime: string
//   exercises: [
//     {
//       id: number
//       setInfo: [{index: number; reps: number; weight: number; seconds: number}]
//     }
//   ]
// }): Promise<void> {
//   const connection = await db.beginTransaction()
//   try {
//     const {id, title, subTitle, totalTime, exercises} = options
//     await Reservation.update({id, title, subTitle, totalTime}, connection)
//     if (exercises && exercises.length) {
//       await Reservation.deleteRelationExercise(id, connection)
//       await Reservation.createRelationExercises({exercises, ReservationId: id}, connection)
//     }
//     await db.commit(connection)
//   } catch (e) {
//     if (connection) await db.rollback(connection)
//     throw e
//   }
// }
//
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

export {create, findAll}
