import {ITicketHolding} from './ticketHoldings'

export interface ITicket {
  id: number
  type: 'personal' | 'fitness'
  totalSession: number
  serviceSession: number
  sessionPrice: number
  coachingPrice: number
  startedAt: string
  expiredAt: string
  createdAt: string
}

export interface ITicketFindOne {
  id?: number
  type?: 'personal' | 'fitness'
  totalSession?: number
  serviceSession?: number
  startedAt?: string
  expiredAt?: string
}

export interface ITicketFindAll {
  franchiseId: number
  search?: string
  status?: string
  trainerId?: number
  start: number
  perPage: number
}

export interface ITicketDetail {
  id: number
  type: 'personal' | 'fitness'
  users: [
    {
      id: number
      nickname: string
    }
  ]
  totalSession: number
  serviceSession: number
  restSession: number
  startedAt: string
  expiredAt: string
  trainers: [
    {
      id: number
      nickname: string
    }
  ]
}

export type ITicketList = IResponseList<{
  id: number
  type: 'personal' | 'fitness'
  userNickname: string
  totalSession: number
  validSession: number
  isHolding?: boolean
  startedAt: string
  expiredAt: string
  createdAt: string
}>
