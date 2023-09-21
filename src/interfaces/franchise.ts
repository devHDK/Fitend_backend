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
