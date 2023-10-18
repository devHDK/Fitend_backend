export interface IThread {
  id: number
  userId: number
  trainerId: number
  title: number
  writerType: number
  type: number
  content: number
  checked: boolean
  commentChecked: boolean
  gallery: {
    type: ['image', 'video']
    url: string
    thumbnail: string
  }
  workoutInfo: {
    workoutScheduleId: number
    targetMuscleIds: number[]
    title: string
    subTitle: string
    workoutDuration: string
    totalSet: number
    heartRate?: number
    calories?: number
  }
  user: {
    id: number
    nickname: string
    gender: ['male', 'female']
  }
  trainer: {
    id: number
    nickname: string
    profile: string
  }
  emojis: {
    id: number
    emoji: string
    users: number[]
  }[]
  userCommentCount: number
  trainerCommentCount: number
  createdAt: Date
}

export type IThreadList = IResponseList<IThread>
export type IThreadUserList = IThreadUser[]

export interface IThreadUser {
  id: number
  nickname: string
  gender: 'male' | 'female'
  availableTickets: [
    {
      id: number
      isActive: boolean
      type: 'fitness' | 'personal'
    }
  ]
  updatedAt: string
  updatedCount: number
}

export interface IThreadCreateOne {
  userId: number
  trainerId: number
  workoutScheduleId?: number
  writerType: 'user' | 'trainer'
  type: 'general' | 'record'
  title?: string
  content: string
  gallery?: string
  workoutInfo?: IThreadWorkoutInfo | string
}

export interface IThreadWorkoutInfo {
  trainerId?: number
  workoutScheduleId: number
  targetMuscleIds: number[]
  title: string
  subTitle: string
  workoutDuration: number
  totalSet: number
  heartRate?: number
  calories?: number
}
export interface IThreadFindAll {
  userId: number
  start: number
  perPage: number
}

export interface IThreadFindAllUsers {
  trainerId: number
  search?: string
  order?: 'ASC' | 'DESC'
}

export interface IThreadUpdateOne {
  id: number
  title?: string
  content?: string
  gallery?: string
  checked?: boolean
  commentChecked?: boolean
}

export interface IThreadCreatedId {
  id: number
}

export interface IThreadPushType {
  tokens: string[]
  badge: number
  type: 'threadCreate' | 'commentCreate'

  contents: string
  data?: any
}
