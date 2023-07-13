export interface IReservation {
  id: number
  ticketId: number
  trainerId: number
  startTime: string
  endTime: string
  seq: number
}

export interface IReservationCreate {
  ticketId: number
  trainerId: number
  startTime: string
  endTime: string
  seq: number
}

export interface IReservationFindAll {
  franchiseId: number
  userId?: number
  trainerId?: number
  startDate: string
  endDate: string
}

export interface IReservationFindAllForUser {
  userId: number
  startDate: string
}

export interface IReservationDetail {
  id: number
  startTime: string
  endTime: string
  status: string
  ticketType: string
  ticketStartedAt: string
  ticketExpiredAt: string
  userNickname: string
  trainer: {
    id: number
    nickname: string
    profileImage: string
  }
  seq: number
  totalSession: number
}

export interface IReservationFindOne {
  id: number
  ticketId: number
  startTime: string
  endTime: string
  status: string
  startedAt: string
  expiredAt: string
  seq: number
  times: number
}

export interface IReservationList {
  id: number
  startTime: string
  endTime: string
  status: string
  ticketType: string
  userNickname: string
  trainer: {
    id: number
    nickname: string
    profileImage: string
  }
  seq: number
  totalSession: number
}

export interface IReservationUpdate {
  id: number
  ticketId?: number
  trainerId?: number
  startTime?: string
  endTime?: string
  seq?: number
  status?: string
  times?: number
}
