export interface ITicketHolding {
  ticketId: number
  startAt: string
  endAt: string
  days?: number
}

export interface ITicketHoldingUpdate {
  id: number
  startAt: string
  endAt: string
  days?: number
}
