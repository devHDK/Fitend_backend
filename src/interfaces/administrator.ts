export interface IAdministrator {
  id: number
  username: string
  role: 'master'
  enabled: boolean
  authorities?: string[]
  createdAt: Date
  updatedAt?: Date
}

export interface IAdministratorSecret extends IAdministrator {
  password: string
  salt: string
}

export type IAdministratorList = IResponseList<IAdministrator>

export interface IAdministratorCreate {
  username: string
  password: string
  salt: string
  role: 'master'
  enabled?: boolean
  createdAt?: Date
}

export interface IAdministratorFindAll {
  search: string
  sort?: string
  order?: string
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
