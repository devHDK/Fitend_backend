export interface IUser {
  id?: number
  nickname?: string
  password?: any
  email?: string
  phone?: string
  createdAt?: string
  deletedAt?: Date | string
}

// export interface IUser {
//   id?: number
//   nickname?: string
//   email?: string
//   accountInfo?: any
//   cityId?: number
//   isMarried?: boolean
//   referralCode?: string
//   referrerId?: number
//   gender?: string
//   name?: string
//   birth?: string
//   phone?: string
//   uniqueKey?: string
//   deviceId?: string
//   isMarketing?: boolean
//   createdAt?: string
//   point?: number
//   type?: 'email' | 'facebook' | 'naver' | 'apple'
//   deletedAt?: Date | string
//   updatedAt?: Date | string
//   deletedType?: 'point' | 'use' | 'service' | 'error' | 'etc' | 'force'
// }

export interface IUserCreateOne {
  id?: number
  nickname?: string
  email?: string
  password: object
}

// export interface IUserCreateOne {
//   id?: number
//   nickname?: string
//   email?: string
//   accountInfo?: object
//   cityId?: number
//   isMarried?: boolean
//   referralCode?: string
//   referrerId?: number
//   gender?: string
//   name?: string
//   birth?: string
//   uniqueKey?: string
//   deviceId?: string
//   isMarketing?: boolean
//   point?: number
//   accountId?: string
//   type: 'email' | 'facebook' | 'naver' | 'apple'
// }

export type IUserList = IResponseList<IUser>

export interface IUserFindOne {
  uniqueKey?: string
  id?: number
  email?: string
  referralCode?: string
  nickname?: string
}

export interface IUserUpdatePassword {
  id: number
  accountInfo: {password: string; salt: string}
}

export interface IUserUpdate {
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
