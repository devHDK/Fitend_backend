import {IWorkoutRequestDayList} from './workoutRequestDay'
import {ITicket, ITicketList} from './tickets'
import {IWorkoutScheduleList} from './workoutSchedules'

export interface IUser {
  id?: number
  nickname?: string
  password?: any
  email?: string
  phone?: string
  gender?: 'male' | 'female'
  birth?: string
  job?: string
  memo?: string
  platform?: 'android' | 'ios'
  deviceId?: string
  badgeCount?: number
  isNotification?: boolean
  weight?: number
  height?: number
  activeTrainers?: [
    {
      id: number
      nickname: string
    }
  ]
  activeTickets: ITicketList
  lastTickets: ITicketList
  lastTrainers?: [
    {
      id: number
      nickname: string
    }
  ]
  createdAt?: string
  deletedAt?: Date | string
}

export interface IUserCreateOne {
  nickname: string
  email: string
  phone: string
  birth?: string
  gender: 'male' | 'female'
  memo?: string
  password: string
}

export interface IUserData {
  id: number
  nickname: string
  phone: string
  gender: 'male' | 'female'
  availableTickets: [
    {
      id: number
      isActive: boolean
      type: 'fitness' | 'personal'
      month: number
      expiredAt: string
    }
  ]
  trainers: [{id: string; nickname: string}]
  createdAt: Date
  isHolding: boolean
  isActive: boolean
}

export interface IUserDataForAdmin {
  id: number
  nickname: string
  phone: string
  email: string
  franchises: [{id: number; name: string}]
  trainers: [{id: number; nickname: string}]
  createdAt: Date
}

export type IUsersWorkoutSchedulesFindAll = {
  trainerId?: number
  franchiseId: number
  startDate: Date
  interval?: number
}

export type IUserListForTrainer = IResponseList<IUserData>

export type IUserListForAdmin = IResponseList<IUserDataForAdmin>

export type IUserBodySpecList = IResponseList<IUserBodySpecsData>

export interface IUserFindOne {
  uniqueKey?: string
  id?: number
  email?: string
  phone?: string
  referralCode?: string
  nickname?: string
}

export interface IUserFindAll {
  franchiseId: number
  start: number
  perPage: number
  search?: string
  status?: string
  trainerId?: number
}

export interface IFindActiveUsers {
  franchiseId: number
  trainerId?: number
}

export interface IUserUpdate {
  id: number
  nickname?: string
  email?: string
  phone?: string
  birth?: string
  gender?: string
  password?: string
  badgeCount?: number
  memo?: string
  platform?: string
  deviceId?: string
  inflowComplete?: boolean
}

export interface IUsersWorkoutSchedules {
  id: number
  nickname: string
  phone: string
  gender: 'male' | 'female'
  birth: string
  requestDates: IWorkoutRequestDayList[]
  workouts: IWorkoutScheduleList[]
  createdAt?: string
  deletedAt?: Date | string
}

export interface IUserBodySpecCreate {
  userId?: number
  height: number
  weight: number
}

export interface IUserBodySpecsData {
  bodySpecId: number
  height: number
  weight: number
  createdAt: Date
}

export interface IUserPreSurveyCreate {
  userId?: number
  experience: number
  purpose: number
  achievement: string
  obstacle: string
  preferDays: string
  place: 'home' | 'gym' | 'both'
}

export interface IUserPreSurveyUpdate {
  userId?: number
  experience?: number
  purpose?: number
  achievement?: string
  obstacle?: string
  preferDays?: string
  place?: 'home' | 'gym' | 'both'
}

export interface IUserPushType {
  tokens: string[]
  badge: number
  type: 'userCreate'
  contents: string
  data?: any
  sound?: 'default'
}

export type IUserWithWorkoutList = IUsersWorkoutSchedules[]
