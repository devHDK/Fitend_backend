import {IExerciseCreate} from '../interfaces/exercise'
import { Exercise } from "../models/index"
import { db } from "../loaders";

async function create(options: {
  trainerId: number
  name: string
  nameEn: string
  type: 'resistance' | 'flexibility' | 'cardio'
  trackingFieldId: number
  targetMuscleIds: [{id: number, type: 'main' | 'sub'}]
  description: string
  tags: string[]
  videos: [{url: string, index: number}]
}): Promise<void> {
  const connection = await db.beginTransaction()
  try {
    const {trainerId, name, nameEn, type, trackingFieldId, targetMuscleIds, description, tags, videos} = options
    const exerciseId = await Exercise.create({
      trainerId,
      name,
      nameEn,
      type,
      trackingFieldId,
      description,
      videos: JSON.stringify(videos)
    }, connection)
    await Exercise.createRelationTargetMuscle({ targetMuscleIds, exerciseId }, connection)
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

export {create}
