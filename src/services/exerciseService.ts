import {IExerciseFindAll, IExerciseList, IExerciseFindOne} from '../interfaces/exercise'
import {Exercise, StandardExercise, WorkoutSchedule} from '../models/index'
import {db} from '../loaders'
import {IWorkoutHistoryFindAll, IWorkoutHistoryListForTrainer} from '../interfaces/workoutSchedules'

async function create(options: {
  trainerId: number
  franchiseId: number
  standardExerciseId: number
  description: string
  tags: string[]
  videos: [{url: string; index: number; thumbnail: string}]
}): Promise<void> {
  const connection = await db.beginTransaction()
  try {
    const {trainerId, franchiseId, standardExerciseId, description, tags, videos} = options
    const exerciseId = await Exercise.create(
      {
        trainerId,
        franchiseId,
        description,
        videos: JSON.stringify(videos)
      },
      connection
    )

    await StandardExercise.createRelationExercises({exerciseIds: [{id: exerciseId}], standardExerciseId}, connection)

    if (tags && tags.length > 0) {
      for (let i = 0; i < tags.length; i++) {
        const name = tags[i]
        const tag = await Exercise.findTags({name})
        let exerciseTagId
        if (!tag) exerciseTagId = await Exercise.createExerciseTag({name}, connection)
        else exerciseTagId = tag.id
        await Exercise.createRelationTag({exerciseId, exerciseTagId}, connection)
      }
    }
    await db.commit(connection)
  } catch (e) {
    if (connection) await db.rollback(connection)
    throw e
  }
}

async function findAll(options: IExerciseFindAll): Promise<IExerciseList> {
  try {
    return await Exercise.findAll(options)
  } catch (e) {
    throw e
  }
}

async function findAllTags(search: string): Promise<[{id: number; name: string}]> {
  try {
    return await Exercise.findAllTags(search)
  } catch (e) {
    throw e
  }
}

async function findAllHistory(options: IWorkoutHistoryFindAll): Promise<IWorkoutHistoryListForTrainer> {
  try {
    return await WorkoutSchedule.findAllHistory(options)
  } catch (e) {
    throw e
  }
}

async function findOne(id: number, trainerId: number): Promise<IExerciseFindOne> {
  try {
    return await Exercise.findOneWithId(id, trainerId)
  } catch (e) {
    throw e
  }
}

async function update(options: {id: number; description: string; tags?: string[]; videos: string}): Promise<void> {
  const connection = await db.beginTransaction()
  try {
    const {id, tags, ...data} = options
    await Exercise.update({id, ...data}, connection)
    if (tags && tags.length > 0) {
      await Exercise.deleteRelationTag(id, connection)
      for (let i = 0; i < tags.length; i++) {
        const name = tags[i]
        const tag = await Exercise.findTags({name})
        let exerciseTagId
        if (!tag) exerciseTagId = await Exercise.createExerciseTag({name}, connection)
        else exerciseTagId = tag.id
        await Exercise.createRelationTag({exerciseId: id, exerciseTagId}, connection)
      }
    }
    await db.commit(connection)
  } catch (e) {
    if (connection) await db.rollback(connection)
    throw e
  }
}

async function updateBookmark(options: {exerciseId: number; trainerId: number}): Promise<void> {
  try {
    const {exerciseId, trainerId} = options
    const isBookmark = await Exercise.findBookmark(exerciseId, trainerId)
    if (isBookmark) await Exercise.deleteRelationBookmark(exerciseId, trainerId)
    else await Exercise.createRelationBookmark(exerciseId, trainerId)
  } catch (e) {
    throw e
  }
}

export {create, findAll, findAllTags, findAllHistory, findOne, update, updateBookmark}
