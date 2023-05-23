export interface ITicket {
  id: number
  type: 'personal' | 'fitness'
  startedAt: string
  expiredAt: string
  createdAt: string
}

export interface ITicketFindAll {
  search?: string
  status?: boolean
  start: number
  perPage: number
}

export type ITicketList = IResponseList<{
  id: number
  type: 'personal' | 'fitness'
  userNickname: string
  totalSession: number
  createdAt: string
}>
