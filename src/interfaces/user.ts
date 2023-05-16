export interface IUser {
  id?: number
  nickname?: string
  password?: any
  email?: string
  phone?: string
  createdAt?: string
  deletedAt?: Date | string
}

export interface IUserCreateOne {
  nickname: string
  email: string
  phone: string
  birth: string
  gender: string
  password: string
}

export interface IUserData{
  id: number,
  nickname: string,
  phone: string,
  trainers: [{id: string, nickname: string}],
  createdAt: Date
}

export type IUserListForTrainer = IResponseList<IUserData>

export interface IUserFindOne {
  uniqueKey?: string
  id?: number
  email?: string
  referralCode?: string
  nickname?: string
}

export interface IUserFindAll {
  start: number
  perPage: number
}

export interface IUserUpdatePassword {
  id: number
  accountInfo: {password: string; salt: string}
}

export interface IUserUpdate {
  id: number
  nickname: string
  email: string
  phone: string
  birth: string
  gender: string
  password: string
}
