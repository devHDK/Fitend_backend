export interface IThread {
  id: number
  userId: number
  trainerId: number
  title: number
  writerType: number
  type: number
  content: number
  gallery: {
    "type": ["image", "video"]
    "url": string
    "thumbnail": string
  }
  workoutInfo: {
    "workoutScheduleId": number
    "targetMuscleIds": number[]
    "title": string
    "subTitle": string
    "workoutDuration": string
    "totalSet": number
    "heartRate"?: number
    "calories"?: number
  },
  user: {
    "id": number
    "nickname": string
    "gender": ["male", "female"]
  }
  trainer: {
    "id": number
    "nickname": string
    "profile": string
  }
  emojis: {
    "id": number
    "emoji": string
    "users": number[]
  }[]
  commentCount: number
  createdAt: Date
}

export type IThreadList = IResponseList<IThread>

export interface IThreadCreateOne {
  userId: number
  trainerId: number
  writerType: 'user' | 'trainer'
  type: 'general' | 'record'
  title?: string
  content: string
  gallery?: string
  workoutInfo?: {
    workoutScheduleId: number
    targetMuscleIds: number[]
    title: string
    subTitle: string
    workoutDuration: number
    totalSet: number
    heartRate: number
    calories: number
  }
}

export interface IThreadFindAll {
  userId: number
  start: number
  perPage: number
}

export interface IThreadUpdateOne {
  id: number
  title?: string
  content: string
  gallery?: string
}

export interface IAdministratorDelete {
  id: number
}
