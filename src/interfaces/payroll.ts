export interface IPayrollCreateSave {
  trainerId: number
  month: Date
  baseWage?: number
  ptPercentage?: number
  fcPercentage: number
  sessions?: IReservation[] | string
  coaching: IResponseList<ICoaching> | string
}

export interface IPayrollUpdateSave {
  trainerId: number
  month: Date
  baseWage: number
  ptPercentage: number
  fcPercentage: number
}

export interface IPayrollFindAll {
  trainerId: number
  franchiseId: number
  startDate: Date
}

export interface IPayrollFindAllForAdmin {
  startDate: Date
}

export interface IPayrollFindSave {
  trainerId: number
  month: Date
  baseWage?: number
  ptPercentage?: number
  fcPercentage: number
  sessions?: IReservation[]
  coaching: IResponseList<ICoaching>
}
export interface IPayrollResponse {
  thisMonth: IMonth
}

export interface IPayrollResponseForAdmin {
  userCount: IUserCountForAdmin
  totalSales: number
  coachList: {
    trainerId: number
    nickname: string
    sales: number
  }[]
}

export interface IMonth {
  userCount: IUserCount
  wageInfo: IWageInfo
  reservations?: IReservation[]
  coaching?: IResponseList<ICoaching>
}

export interface ICalculatedPayroll {
  userCount: IUserCount
  wageInfo: {
    fcPercentage: number
    ptPercentage: number
    baseWage: number
    wage: number
    monthEndWage: number
  }
  reservations?: IReservation[]
  coaching?: IResponseList<ICoaching>
  isSaved: boolean
}
export interface ICoaching {
  ticketId: number
  nickname: string
  type: number
  coachingPrice?: number
  payroll?: number
  startedAt: string
  expiredAt: string
  holdingList: IHolding[]
  usedDate?: number
}

export interface IReservation {
  ticketId: number
  type: string
  nickname: string
  sessionPrice: number
  payroll?: number
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

export interface IUserCountForAdmin extends IUserCount {
  activeUser: number
}

export interface IHolding {
  holdId: number
  startAt: string
  endAt: string
  days: number
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
