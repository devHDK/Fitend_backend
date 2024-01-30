import {IStandardExerciseCreate, IStandardExerciseUpload} from '../interfaces/standardExercises'
import {db} from '../loaders'
import {StandardExercise} from '../models'

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
          if (target === '전신') {
            return {id: 1, type: 'main'}
          }
          if (target === '상체') {
            return {id: 2, type: 'main'}
          }
          if (target === '하체') {
            return {id: 3, type: 'main'}
          }
          if (target === '대흉근') {
            return {id: 4, type: 'main'}
          }
          if (target === '전거근') {
            return {id: 6, type: 'main'}
          }
          if (target === '승모근') {
            return {id: 7, type: 'main'}
          }
          if (target === '광배근') {
            return {id: 8, type: 'main'}
          }
          if (target === '능형근') {
            return {id: 9, type: 'main'}
          }
          if (target === '전면 삼각근') {
            return {id: 10, type: 'main'}
          }
          if (target === '측면 삼각근') {
            return {id: 11, type: 'main'}
          }
          if (target === '후면 삼각근') {
            return {id: 12, type: 'main'}
          }
          if (target === '이두근') {
            return {id: 13, type: 'main'}
          }
          if (target === '삼두근') {
            return {id: 14, type: 'main'}
          }
          if (target === '전완근') {
            return {id: 15, type: 'main'}
          }
          if (target === '복직근') {
            return {id: 16, type: 'main'}
          }
          if (target === '복사근') {
            return {id: 17, type: 'main'}
          }
          if (target === '척추기립근') {
            return {id: 18, type: 'main'}
          }
          if (target === '장요근') {
            return {id: 19, type: 'main'}
          }
          if (target === '요방형근') {
            return {id: 20, type: 'main'}
          }
          if (target === '대둔근') {
            return {id: 21, type: 'main'}
          }
          if (target === '중둔근') {
            return {id: 22, type: 'main'}
          }
          if (target === '햄스트링') {
            return {id: 24, type: 'main'}
          }
          if (target === '대퇴사두근') {
            return {id: 25, type: 'main'}
          }
          if (target === '내전근') {
            return {id: 26, type: 'main'}
          }
          if (target === '비복근') {
            return {id: 28, type: 'main'}
          }
          return {id: 1, type: 'main'}
        })
        if (standard.secondary) {
          const secondary = standard.secondary.split(', ')
          const targetMuscleSecondaryIds = secondary.map((target) => {
            if (target === '전신') {
              return {id: 1, type: 'sub'}
            }
            if (target === '상체') {
              return {id: 2, type: 'sub'}
            }
            if (target === '하체') {
              return {id: 3, type: 'sub'}
            }
            if (target === '대흉근') {
              return {id: 4, type: 'sub'}
            }
            if (target === '전거근') {
              return {id: 6, type: 'sub'}
            }
            if (target === '승모근') {
              return {id: 7, type: 'sub'}
            }
            if (target === '광배근') {
              return {id: 8, type: 'sub'}
            }
            if (target === '능형근') {
              return {id: 9, type: 'sub'}
            }
            if (target === '전면 삼각근') {
              return {id: 10, type: 'sub'}
            }
            if (target === '측면 삼각근') {
              return {id: 11, type: 'sub'}
            }
            if (target === '후면 삼각근') {
              return {id: 12, type: 'sub'}
            }
            if (target === '이두근') {
              return {id: 13, type: 'sub'}
            }
            if (target === '삼두근') {
              return {id: 14, type: 'sub'}
            }
            if (target === '전완근') {
              return {id: 15, type: 'sub'}
            }
            if (target === '복직근') {
              return {id: 16, type: 'sub'}
            }
            if (target === '복사근') {
              return {id: 17, type: 'sub'}
            }
            if (target === '척추기립근') {
              return {id: 18, type: 'sub'}
            }
            if (target === '장요근') {
              return {id: 19, type: 'sub'}
            }
            if (target === '요방형근') {
              return {id: 20, type: 'sub'}
            }
            if (target === '대둔근') {
              return {id: 21, type: 'sub'}
            }
            if (target === '중둔근') {
              return {id: 22, type: 'sub'}
            }
            if (target === '햄스트링') {
              return {id: 24, type: 'sub'}
            }
            if (target === '대퇴사두근') {
              return {id: 25, type: 'sub'}
            }
            if (target === '내전근') {
              return {id: 26, type: 'sub'}
            }
            if (target === '비복근') {
              return {id: 28, type: 'sub'}
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

export {create, uploadExcel}
