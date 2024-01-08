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
  activeTrainers?: [
    {
      id: number
      nickname: string
    }
  ]
  activeTickets: ITicketList
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
  trainers: [{id: string; nickname: string}]
  createdAt: Date
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

export interface IUserPreSurveyCreate {
  userId?: number
  experience: number
  purpose: number
  achievement: string
  obstacle: string
  place: 'home' | 'gym'
}

export type IUserWithWorkoutList = IUsersWorkoutSchedules[]
