export interface IStandardExerciseCreate {
  name: string
  nameEn: string
  devisionId: number
  trackingFieldId: number
  machineType: 'bodyweight' | 'kettlebell' | 'barbell' | 'dumbbell' | 'machine' | 'etc'
  jointType?: 'single' | 'multi'
}

export interface IStandardExerciseUpload {
  name: string
  nameEn: string
  devision: string
  trackingField: string
  machineType: string
  jointType?: string
  primary: string
  secondary?: string
  linkedExercises?: string
}

export interface IStandardExerciseFindAll {
  search?: string
  devisionId?: number
  machineType?: string
  targetMuscleIds?: number[]
  start: number
  perPage: number
}

export interface IStandardExercises {
  id: number
  name: string
  devision: string
  machineType: string
  jointType?: string
  targetMuscles: {
    id: number
    name: string
  }[]
}

export interface IStandardExerciseUpdate {
  id: number
  name?: string
  nameEn?: string
  trackingFieldId?: number
  devisionId?: number
  machineType?: string
  jointType?: string
}

export type IStandardExercisesList = IResponseList<IStandardExercises>
