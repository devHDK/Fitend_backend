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
}
