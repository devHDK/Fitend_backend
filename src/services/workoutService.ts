import {IWorkoutFindAll, IWorkoutList, IWorkoutDetail} from '../interfaces/workout'
import {Workout} from '../models/index'
import {db} from '../loaders'

async function create(options: {
  trainerId: number
  title: string
  subTitle: string
  totalTime: string
  exercises: [
    {
      id: number
      setInfo: [{index: number; reps: number; weight: number; seconds: number}]
    }
  ]
}): Promise<void> {
  const connection = await db.beginTransaction()
  try {
    const {trainerId, title, subTitle, totalTime, exercises} = options
    const workoutId = await Workout.create(
      {
        trainerId,
        title,
        subTitle,
        totalTime
      },
      connection
    )
    await Workout.createRelationExercises({exercises, workoutId}, connection)
    await db.commit(connection)
  } catch (e) {
    if (connection) await db.rollback(connection)
    throw e
  }
}

async function findAll(options: IWorkoutFindAll): Promise<IWorkoutList> {
  try {
    return await Workout.findAll(options)
  } catch (e) {
    throw e
  }
}

async function findOneWithId(id: number, trainerId: number): Promise<IWorkoutDetail> {
  try {
    return await Workout.findOneWithId(id, trainerId)
  } catch (e) {
    throw e
  }
}

async function update(options: {
  id: number
  title: string
  subTitle: string
  totalTime: string
  exercises: [
    {
      id: number
      setInfo: [{index: number; reps: number; weight: number; seconds: number}]
    }
  ]
}): Promise<void> {
  const connection = await db.beginTransaction()
  try {
    const {id, title, subTitle, totalTime, exercises} = options
    await Workout.update({id, title, subTitle, totalTime}, connection)
    if (exercises && exercises.length) {
      await Workout.deleteRelationExercise(id, connection)
      await Workout.createRelationExercises({exercises, workoutId: id}, connection)
    }
    await db.commit(connection)
  } catch (e) {
    if (connection) await db.rollback(connection)
    throw e
  }
}

async function updateBookmark(options: {workoutId: number; trainerId: number}): Promise<void> {
  try {
    const {workoutId, trainerId} = options
    const isBookmark = await Workout.findBookmark(workoutId, trainerId)
    if (isBookmark) await Workout.deleteRelationBookmark(workoutId, trainerId)
    else await Workout.createRelationBookmark(workoutId, trainerId)
  } catch (e) {
    throw e
  }
}

export {create, findAll, findOneWithId, update, updateBookmark}
