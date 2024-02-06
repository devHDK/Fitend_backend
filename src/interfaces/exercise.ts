export interface IExercise {
  id: number
  name: string
  videos: {
    url: string
    index: number
    thumbnail: string
  }
  trackingFieldId: number
  machineType: 'barbell' | 'dumbbell' | 'kettlebell' | 'machine' | 'bodyweight' | 'etc'
  targetMuscles: {
    id: number
    name: string
  }
  jointType?: 'multi' | 'single'
  devisionId: number
  trainerId: number
  trainerNickname: string
  updatedAt: Date
}

export interface IExerciseCreate {
  trainerId: number
  franchiseId: number
  description: string
  videos: string
}

export interface IExerciseTag {
  id?: string
  name?: string
}

export interface IExerciseFindAll {
  search?: string
  isMe?: boolean
  isBookmark?: boolean
  tagIds?: number[]
  trainerFilterId?: number
  devisionId?: number
  targetMuscleId?: number
  machineType?: 'barbell' | 'dumbbell' | 'kettlebell' | 'machine' | 'bodyweight' | 'etc'
  jointType?: 'multi' | 'single'
  trackingFieldIds: number[]
  targetMuscleIds: number[]
  trainerId: number
  start: number
  perPage: number
}

export interface IExerciseFindOne {
  id: number
  name: string
  nameEn: string
  videos: {
    url: string
    index: number
    thumbnail: string
  }
  devisionId: number
  jointType?: 'multi' | 'single'
  trainerId: number
  trainerNickname: string
  trainerProfileImage: string
  updatedAt: Date
  description: string
  type: string
  targetMuscles: {
    id: number
    name: string
    muscleType: string
    type: string
  }
}

export interface IExerciseUpdate {
  id: number
  description?: string
  videos?: string
}

export type IExerciseList = IResponseList<IExercise>
