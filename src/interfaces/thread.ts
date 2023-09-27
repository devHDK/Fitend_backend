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

export interface IThreadCreate {
  userId: number
  trainerId: number
  password: string
}

export interface IThreadFindAll {
  userId: number
  start: number
  perPage: number
}

export interface IAdministratorUpdate {
  id: number
  name: string
  nickname: string
}

export interface IAdministratorUpdatePassword {
  id: number
  password: string
  salt: string
}

export interface IAdministratorDelete {
  id: number
}
