import {Ticket} from '../models/index'
import {db} from '../loaders'
import {ITicketFindAll, ITicketList} from '../interfaces/tickets'

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

// async function findOneWithId(id: number): Promise<IWorkoutDetail> {
//   try {
//     return await Workout.findOneWithId(id)
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
//     await Workout.update({id, title, subTitle, totalTime}, connection)
//     if (exercises && exercises.length) {
//       await Workout.deleteRelationExercise(id, connection)
//       await Workout.createRelationExercises({exercises, workoutId: id}, connection)
//     }
//     await db.commit(connection)
//   } catch (e) {
//     if (connection) await db.rollback(connection)
//     throw e
//   }
// }

export {create, findAll}
