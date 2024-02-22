import {IFranchise, IFranchiseWithWageInfo} from './franchise'
import {IPayrollResponseForAdminWithTrainerId} from './payroll'

export interface ITrainer {
  id?: number
  nickname?: string
  email?: string
  password?: {
    password: string
    salt: string
  }
  salt?: string
  profileImage?: string
  role?: 'master' | 'external'
  createdAt?: string
}

export type ITrainerList = {
  id: number
  nickname: string
}

export type ITrainerListForUser = {
  id: number
  nickname: string
  profileImage: string
  largeProfileImage: string
  shortIntro: string
}

export interface ITrainerDataForAdmin {
  id: number
  nickname: string
  email: string
  franchises: [{id: number; name: string}]
  users: number
  createdAt: Date
}

export type ITrainerListForAdmin = IResponseList<ITrainerDataForAdmin>

export type ITrainerFindAllForAdmin = {
  franchiseId: number
  start: number
  perPage: number
  search?: string
}

export type ITrainerFindExtend = {
  start: number
  perPage: number
  search: string
}

export interface ITrainerFindOne {
  email?: string
  id?: number
}

export interface ITrainerFindOneWageInfo {
  trainerId?: number
  franchiseId?: number
}

export interface ITrainerWageInfo {
  baseWage?: number
  ptPercentage?: number
  fcPercentage?: number
}

export interface ITrainerUpdate {
  id: number
  password?: string
}

export interface ITrainerMeetingBoundary {
  trainerId: number
  workStartTime: string
  workEndTime: string
}

export type ITrainerDetail = {
  id: number
  nickname: string
  email: string
  createdAt: Date
  activeUsers: ActiveUsers
  franchiseInfo: IFranchiseWithWageInfo
  thisMonthSession: IPayrollResponseForAdminWithTrainerId
}

export type ITrainerDetailForUser = {
  id: number
  nickname: string
  email: string
  profileImage: string
  largeProfileImage: string
  franchises?: [{id: number; name: string}]
  shortIntro: string
  intro: string
  instagram: string
  qualification: {data: [string]}
  speciality: {data: [string]}
  coachingStyle: {data: [string]}
  favorite: {data: [string]}
}

export type ActiveUsers = {
  fitnessActiveUsers: FitnessActiveUsersClass
  personalActiveUsers: FitnessActiveUsersClass
}

export type FitnessActiveUsersClass = {
  thisMonthCount: number
  lastMonthCount: number
}
