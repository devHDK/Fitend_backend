export interface IWorkout {
  id: number
  title: string
  totalTime: string
  primaryTypes: string[]
  trainerId: number
  trainerNickname: string
  updatedAt: Date
}

export interface IWorkoutCreate {
  trainerId: number
  title: string
  subTitle: string
  totalTime: string
}

export interface IExerciseTag {
  id?: string
  name?: string
}

export interface IWorkoutFindAll {
  search?: string
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
  type?: 'resistance' | 'flexibility' | 'cardio'
  trackingFieldId?: number
  description?: string
  videos?: string
}

export type IWorkoutList = IResponseList<IWorkout>
