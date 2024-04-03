import {
  IStandardExerciseCreate,
  IStandardExerciseFindAll,
  IStandardExerciseUpload,
  IStandardExercises,
  IStandardExercisesFindOne,
  IStandardExercisesList
} from '../interfaces/standardExercises'
import {db} from '../loaders'
import {Exercise, StandardExercise, TargetMuscle} from '../models'

async function create(options: {
  name: string
  nameEn: string
  devisionId: number
  trackingFieldId: number
  machineType: 'bodyweight' | 'kettlebell' | 'barbell' | 'dumbbell' | 'machine' | 'etc'
  jointType: 'single' | 'multi'
  targetMuscleIds: {id: number; type: string}[]
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

async function uploadExcel(data: IStandardExerciseUpload[]): Promise<any[]> {
  const connection = await db.beginTransaction()
  const duplicatedArr = []
  try {
    const targetMucles = await TargetMuscle.findAll()
    for (const standard of data) {
      try {
        const name = standard.name
        const nameEn = standard.nameEn

        let devisionId = 1

        if (standard.devision === '저항운동') devisionId = 1
        if (standard.devision === '코어&밸런스운동') devisionId = 2
        if (standard.devision === 'SAQ운동') devisionId = 3
        if (standard.devision === '유산소운동') devisionId = 4
        if (standard.devision === '유연성운동') devisionId = 5

        let trackingFieldId = 1

        if (standard.trackingField === 'Weight x Reps') trackingFieldId = 1
        if (standard.trackingField === 'Reps') trackingFieldId = 2
        if (standard.trackingField === 'Time (hr/min)') trackingFieldId = 3
        if (standard.trackingField === 'Time (min/sec)') trackingFieldId = 4

        let machineType: 'bodyweight' | 'kettlebell' | 'barbell' | 'dumbbell' | 'machine' | 'etc' = 'etc'

        if (standard.machineType.toLowerCase().indexOf('bodyweight') !== -1) machineType = 'bodyweight'
        if (standard.machineType.toLowerCase().indexOf('barbell') !== -1) machineType = 'barbell'
        if (standard.machineType.toLowerCase().indexOf('dumbbell') !== -1) machineType = 'dumbbell'
        if (standard.machineType.toLowerCase().indexOf('kettlebell') !== -1) machineType = 'kettlebell'
        if (standard.machineType.toLowerCase().indexOf('machine') !== -1) machineType = 'machine'

        const uploadData: IStandardExerciseCreate = {name, nameEn, devisionId, trackingFieldId, machineType}

        if (standard.jointType) {
          if (standard.jointType.toLowerCase() === 'single joint') uploadData.jointType = 'single'
          if (standard.jointType.toLowerCase() === 'multi joint') uploadData.jointType = 'multi'
        }

        const standardExerciseId = await StandardExercise.create(uploadData, connection)

        const primaryArr = standard.primary.split(', ')
        const targetMusclePrimaryIds = primaryArr.map((target) => {
          const index = targetMucles.findIndex((el) => el.name === target)
          if (index !== -1) {
            return {id: targetMucles[index].id, type: 'main'}
          }
          return {id: 1, type: 'main'}
        })
        if (standard.secondary) {
          const secondary = standard.secondary.split(', ')
          const targetMuscleSecondaryIds = secondary.map((target) => {
            const index = targetMucles.findIndex((el) => el.name === target)
            if (index !== -1) {
              return {id: targetMucles[index].id, type: 'sub'}
            }
            return {id: 1, type: 'sub'}
          })
          await StandardExercise.createRelationTargetMuscle(
            {targetMuscleIds: [...targetMusclePrimaryIds, ...targetMuscleSecondaryIds], standardExerciseId},
            connection
          )
        } else {
          await StandardExercise.createRelationTargetMuscle(
            {targetMuscleIds: [...targetMusclePrimaryIds], standardExerciseId},
            connection
          )
        }
        if (standard.linkedExercises) {
          const linkedExercises = standard.linkedExercises.split(', ')
          for (const exerciseName of linkedExercises) {
            const exerciseIds = await Exercise.findOneWithName(exerciseName)
            await StandardExercise.createRelationExercises({exerciseIds, standardExerciseId}, connection)
          }
        }
      } catch (e) {
        duplicatedArr.push(standard)
      }
    }
    await db.commit(connection)
    return duplicatedArr
  } catch (e) {
    if (connection) await db.rollback(connection)
    throw e
  }
}

async function findAll(options: IStandardExerciseFindAll): Promise<IStandardExercisesList> {
  try {
    return await StandardExercise.findAll(options)
  } catch (e) {
    throw e
  }
}

async function findOne({id, trainerId}: {id: number; trainerId: number}): Promise<IStandardExercisesFindOne> {
  try {
    return await StandardExercise.findOneWithId({id, trainerId})
  } catch (e) {
    throw e
  }
}

async function update(options: {
  id: number
  name: string
  nameEn: string
  trackingFieldId: number
  targetMuscleIds?: [{id: number; type: 'main' | 'sub'}]
  devisionId: number
  machineType: 'bodyweight' | 'kettlebell' | 'barbell' | 'dumbbell' | 'machine' | 'etc'
  jointType?: 'single' | 'multi'
}): Promise<void> {
  const connection = await db.beginTransaction()
  try {
    const {id, targetMuscleIds, ...data} = options
    await StandardExercise.update({id, ...data}, connection)
    if (targetMuscleIds && targetMuscleIds.length) {
      await StandardExercise.deleteRelationTargetMuscle(id, connection)
      await StandardExercise.createRelationTargetMuscle({targetMuscleIds, standardExerciseId: id}, connection)
    }
    await db.commit(connection)
  } catch (e) {
    if (connection) await db.rollback(connection)
    throw e
  }
}

export {create, uploadExcel, findAll, findOne, update}
