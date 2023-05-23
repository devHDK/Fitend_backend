export interface IAdministrator {
  id: number
  username: string
  createdAt: Date
}

export interface IAdministratorSecret extends IAdministrator {
  password: {
    password: string
    salt: string
  }
}

export type IAdministratorList = IResponseList<IAdministrator>

export interface IAdministratorCreate {
  username: string
  password: string
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
