export interface ITrainer {
  id?: number
  nickname?: string
  email?: string
  password?: {
    password: string,
    salt: string
  }
  salt?: string
  profileImage?: string
  createdAt?: string
}

export type ITrainerList = IResponseList<ITrainer>

export interface ITrainerFindOne {
  email?: string
}

export interface ITrainerFindOneForAuth {
  email: number,
  password: string
}

export interface ITrainerUpdate {
  id: number
  nickname?: string
  gender?: 'male' | 'female'
  birth?: string
  phone?: string
  cityId?: number
  isMarried?: boolean
  deviceId?: string
  accountInfo?: object | string
  deletedAt?: Date
  categoryIds?: number[]
  deleteType?: 'point' | 'use' | 'service' | 'error' | 'etc' | 'force'
  deleteDescription?: string
  status?: 'general' | 'delete'
}
