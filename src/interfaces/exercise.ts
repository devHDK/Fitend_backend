export interface IExercise {
  id: number
  name: string
  type: 'resistance' | 'flexibility' | 'cardio'
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
  name: string
  nameEn: string
  type: 'resistance' | 'flexibility' | 'cardio'
  trackingFieldId: number
  description: string
  videos: string
}

export interface IExerciseTag {
  id?: string
  name?: string
}

export interface IExerciseFindAll {
  start: number
  perPage: number
}

export interface IExerciseFindOne {
  id: number
  name: string
  videos: {
    url: string
    index: number
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

export type IExerciseList = IResponseList<IExercise>
