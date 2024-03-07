export type IFranchise = {
  franchiseId: number
  name: string
}

export type IFranchiseWithWageInfo = {
  franchiseId: number
  name: string
  baseWage: number
  fcPercentage: number
  ptPercentage: number
}

export type IFranchiseTrainers = {
  franchiseId: number
  trainerId: string
  baseWage: number
  fcPercentage: number
  ptPercentage: number
  createdAt: Date
}
