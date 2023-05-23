export interface ITicket {
  id: number
  type: 'personal' | 'fitness'
  totalSession: string
  startedAt: string
  expiredAt: string
  createdAt: string
}

export interface ITicketFindAll {
  franchiseId: number
  search?: string
  status?: boolean
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
  createdAt: string
}>
