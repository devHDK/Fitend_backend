import {IFranchise, IFranchiseWithWageInfo} from './franchise'
import {IPayrollResponseForAdminWithTrainerId} from './payroll'

export type ITrainerCreateOneForAdmin = {
  nickname: string
  password: string
  email: string
  fcPercentage: number
  instagram: string
  meetingLink: string
  shortIntro: string
  intro: string
  welcomeThreadContent: string
  qualification: CoachingStyle
  speciality: CoachingStyle
  coachingStyle: CoachingStyle
  favorite: CoachingStyle
  profileImage: string
  largeProfileImage: string
  mainVisible: boolean
  role: 'master' | 'external'
  status: 'able' | 'disable'
}

export type ICreateTrainerInfoForAdmin = {
  trainerId: number
  instagram: string
  meetingLink: string
  shortIntro: string
  intro: string
  welcomeThreadContent: string
  qualification: string
  speciality: string
  coachingStyle: string
  favorite: string
  largeProfileImage: string
}

export type CoachingStyle = {
  data: string[]
}
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
  createdAt?: string
  deviceId?: string
  platform?: 'ios' | 'android'
  meetingLink?: string
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
  profileImage: string
  status: string
  role: string
  shortIntro: string
  createdAt: Date
}

export type ITrainerListForAdmin = IResponseList<ITrainerDataForAdmin>

export type ITrainerFindAllForAdmin = {
  start: number
  status: string
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
  nickname?: string
  email?: string
  profileImage?: string
  mainVisible?: boolean
  role?: 'master' | 'external'
  status?: 'able' | 'disable'
  password?: string
  deviceId?: string
  platform?: 'ios' | 'android'
}

export interface ITrainerInfoUpdate {
  trainerId: number
  instagram?: string
  meetingLink?: string
  shortIntro?: string
  intro?: string
  welcomeThreadContent?: string
  qualification?: string
  speciality?: string
  coachingStyle?: string
  favorite?: string
  largeProfileImage?: string
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
  profileImage: string
  largeProfileImage: string
  status: string
  mainVisible: boolean
  instagram: string
  meetingLink: string
  shortIntro: string
  intro: string
  role: string
  qualification: CoachingStyle
  speciality: CoachingStyle
  coachingStyle: CoachingStyle
  favorite: CoachingStyle
  welcomeThreadContent: string
  fcPercentage: number
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
