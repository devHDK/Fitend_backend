export interface IReservation {
  id: number
  title: string
  subTitle: string
  totalTime: string
  primaryTypes: string[]
  trainerId: number
  trainerNickname: string
  updatedAt: Date
}

export interface IReservationCreate {
  ticketId: number
  trainerId: number
  startTime: string
  endTime: string
  seq: number
}

export interface IReservationFindAll {
  franchiseId: string
  startDate: string
  endDate: string
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
