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

export interface IWorkoutFindAll {
  search?: string
  start: number
  perPage: number
}

export interface IWorkoutDetail {
  id: number
  title: string
  subTitle: string
  primaryTypes: string[]
  totalTime: string
  trainerId: number
  trainerNickname: string
  trainerProfileImage: string
  updatedAt: Date
  exercises: [
    {
      id: number
      videos: [
        {
          url: string
          index: number
          thumbnail: string
        }
      ]
      name: string
      trackingFieldId: number
      setInfo: [{index: number; reps: number; weight: number; seconds: number}]
    }
  ]
}

export interface IWorkUpdate {
  id: number
  title: string
  subTitle: string
  totalTime: string
}

export type IWorkoutList = IResponseList<IWorkout>
