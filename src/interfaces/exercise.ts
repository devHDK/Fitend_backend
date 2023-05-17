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
