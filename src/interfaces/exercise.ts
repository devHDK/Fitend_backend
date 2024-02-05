export interface IExercise {
  id: number
  name: string
  videos: {
    url: string
    index: number
    thumbnail: string
  }
  trackingFieldId: number
  type: 'barbell' | 'dumbbell' | 'kettlebell' | 'machine' | 'bodyweight' | 'etc'
  targetMuscles: {
    id: number
    name: string
  }
  trainerId: number
  trainerNickname: string
  updatedAt: Date
}

export interface IExerciseCreate {
  trainerId: number
  franchiseId: number
  name: string
  nameEn: string
  type: 'barbell' | 'dumbbell' | 'kettlebell' | 'machine' | 'bodyweight' | 'etc'
  trackingFieldId: number
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
  types: string[]
  trackingFieldIds: number[]
  targetMuscleIds: number[]
  trainerId: number
  start: number
  perPage: number
}

export interface IExerciseFindOne {
  id: number
  name: string
  videos: {
    url: string
    index: number
    thumbnail: string
  }
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
  name?: string
  nameEn?: string
  type?: 'barbell' | 'dumbbell' | 'kettlebell' | 'machine' | 'bodyweight' | 'etc'
  trackingFieldId?: number
  description?: string
  videos?: string
}

export type IExerciseList = IResponseList<IExercise>
