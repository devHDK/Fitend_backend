export interface IVerification {
  id: number
  phone: string
  type: 'register' | 'reset' | 'id'
  code: number
  confirmed: boolean
  used: boolean
  createdAt: string | Date
}

export interface IVerificationCreate {
  phone: string
  type: 'register' | 'reset' | 'id'
}

export interface IVerificationFindOne {
  id?: number
  phone?: string
  type?: 'register' | 'reset' | 'id'
  code?: number
  confirmed?: boolean
  used?: boolean
}

export interface IVerificationUpdate {
  id: number
  phone?: string
  type?: 'register' | 'reset' | 'id'
  code?: number
  confirmed?: boolean
  used?: boolean
  createdAt?: string | Date
}
