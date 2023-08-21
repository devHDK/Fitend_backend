export interface IPayrollFindAll {
  trainerId: number
  franchiseId: number
  startDate: Date
}

export interface IPayrollResponse {
  thisMonth: IMonth
  lastMonth: IMonth
}

export interface IMonth {
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
