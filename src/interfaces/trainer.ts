export interface ITrainer {
  id?: number
  nickname?: string
  email?: string
  password?: {
    password: string
    salt: string
  }
  salt?: string
  profileImage?: string
  createdAt?: string
}

export type ITrainerList = {
  id: number
  nickname: string
}

export interface ITrainerFindOne {
  email?: string
}
