import {db} from '../loaders'
import {StandardExercise} from '../models'

async function create(options: {
  name: string
  nameEn: string
  devisionId: number
  trackingFieldId: number
  machineType: 'bodyweight' | 'kettlebell' | 'barbell' | 'dumbbell' | 'machine' | 'etc'
  jointType: 'one' | 'multi'
  targetMuscleIds: [{id: number; type: 'main' | 'sub'}]
}): Promise<void> {
  const connection = await db.beginTransaction()
  try {
    const {name, nameEn, devisionId, trackingFieldId, targetMuscleIds, jointType, machineType} = options
    const standardExerciseId = await StandardExercise.create(
      {
        name,
        nameEn,
        devisionId,
        trackingFieldId,
        machineType,
        jointType
      },
      connection
    )
    await StandardExercise.createRelationTargetMuscle({targetMuscleIds, standardExerciseId}, connection)
    await db.commit(connection)
  } catch (e) {
    if (connection) await db.rollback(connection)
    throw e
  }
}

export {create}
