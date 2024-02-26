export interface IPayrollFindAll {
  trainerId: number
  franchiseId: number
  startDate: Date
}

export interface IPayrollFindAllForAdmin {
  trainerId: number
  startDate: Date
}

export interface IPayrollResponse {
  thisMonth: IMonth
}

export interface IPayrollResponseForAdminWithTrainerId {
  reservations?: IReservationForAdmin[]
  coaching?: ICoachingForAdmin[]
}

export interface IMonth {
  userCount: IUserCount
  wageInfo: IWageInfo
  reservations?: IReservation[]
  coaching?: ICoaching[]
}

export interface ICoaching {
  ticketId: number
  nickname: string
  type: string
  startedAt: string
  expiredAt: string
  coachingPrice: number
  doneCount: number
}

export interface IReservation {
  ticketId: number
  type: string
  nickname: string
  sessionPrice: number
  coachingPrice: number
  totalSession: number
  leftSession: number
  thisMonthCount?: number
}

export interface IWageInfo {
  baseWage: number
  ptPercentage: number
  fcPercentage: number
}

export interface IUserCount {
  preUser: number
  paidUser: number
  leaveUser: number
}

export interface ICoachingForAdmin {
  ticketId: number
  nickname: string
  type: string
  coachingPrice: number
  doneCount: number
}

export interface IReservationForAdmin {
  ticketId: number
  type: string
  nickname: string
  sessionPrice: number
  thisMonthCount?: number
}
