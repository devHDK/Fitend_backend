export type IInflowContentFindAll = {
  trainerId?: number
  franchiseId: number
}

export type INotificationList = IResponseList<{
  id: number
  type: 'reservaion' | 'thread' | 'workoutSchedules' | 'noFeedback'
  userNickname: string
  totalSession: number
  createdAt: string
}>

export interface IUserInflowContents {
  id: number
  nickname: string
  phone: string
  gender: 'male' | 'female'
  birth: string
  inflowComplete: boolean
  activeTrainers?: [
    {
      id: number
      nickname: string
    }
  ]
  inflowContents?: [
    {
      id: number
      name: string
      complete: boolean
      memo?: string
    }
  ]
  createdAt?: string
  deletedAt?: Date | string
}

export type IUserInflowContentsList = IUserInflowContents[]
