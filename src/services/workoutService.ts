import {IWorkoutFindAll, IWorkoutList, IWorkoutDetail} from "../interfaces/workout"
import {Workout} from "../models/index"
import {db} from "../loaders"

async function create(options: {
  trainerId: number
  title: string
  subTitle: string
  totalTime: string
  exercises: [
    {
      id: number
      setInfo: [
        { index: number, reps: number, weight: number, seconds: number }
      ]
    }
  ]
}): Promise<void> {
  const connection = await db.beginTransaction()
  try {
    const {trainerId, title, subTitle, totalTime, exercises} = options
    const workoutId = await Workout.create({
      trainerId,
      title,
      subTitle,
      totalTime
    }, connection)
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

async function findOneWithId(id: number): Promise<IWorkoutDetail> {
  try {
    return await Workout.findOneWithId(id)
  } catch (e) {
    throw e
  }
}

// async function update(options: {
//   id: number
//   name?: string
//   nameEn?: string
//   type?: 'resistance' | 'flexibility' | 'cardio'
//   trackingFieldId?: number
//   targetMuscleIds?: [{id: number, type: 'main' | 'sub'}]
//   description?: string
//   tags?: string[]
//   videos?: string
// }): Promise<void> {
//   const connection = await db.beginTransaction()
//   try {
//     const {id, targetMuscleIds, tags, ...data} = options
//     Object.keys(data).forEach(key => {
//       if (!data[key]) delete data[key]
//     })
//     console.log(data)
//     await Exercise.update({id, ...data}, connection)
//     if (targetMuscleIds && targetMuscleIds.length) {
//       await Exercise.deleteRelationTargetMuscle(id, connection)
//       await Exercise.createRelationTargetMuscle({ targetMuscleIds, exerciseId: id }, connection)
//     }
//     if (tags && tags.length > 0) {
//       await Exercise.deleteRelationTag(id, connection)
//       for (let i = 0; i < tags.length; i++) {
//         const name = tags[i]
//         const tag = await Exercise.findTags({name})
//         let exerciseTagId
//         if (!tag) exerciseTagId = await Exercise.createExerciseTag({name}, connection)
//         else exerciseTagId = tag.id
//         await Exercise.createRelationTag({exerciseId: id, exerciseTagId}, connection)
//       }
//     }
//     await db.commit(connection)
//   } catch (e) {
//     if (connection) await db.rollback(connection)
//     throw e
//   }
// }

export {create, findAll, findOneWithId}
