import {id} from 'aws-sdk/clients/datapipeline'

export interface IWorkoutSchedule {
  id: number
  userId: number
  trainerId: number
  franchiseId: number
  startDate: string
  seq: number
  totalTime: string
  createdAt: Date
}

export interface IWorkoutScheduleList {
  startDate: Date
  workouts: [
    {
      workoutScheduleId: number
      seq: number
      title: string
      subTitle: string
      isComplete: boolean
      isRecord: boolean
    }
  ]
}

export interface IWorkoutScheduleListForTrainer {
  workoutScheduleId: number
  workoutId: number
  seq: number
  title: string
  subTitle: string
  isComplete: boolean
  isRecord: boolean
  startDate: string
}

export interface IWorkoutScheduleFindAll {
  userId: number
  startDate: Date
  endDate?: Date
  interval?: number
}

export interface IWorkoutScheduleCreate {
  userId: number
  trainerId: number
  franchiseId: number
  workoutId: number
  workoutTitle: string
  workoutSubTitle: string
  startDate: string
  seq: number
  totalTime: string
}

export interface IWorkoutScheduleUpdate {
  id: number
  workoutTitle?: string
  workoutSubTitle?: string
  startDate?: string
  seq?: number
  totalTime?: string
}

export interface IWorkoutScheduleDetail {
  workoutScheduleId: number
  trainerId: number
  userId: number
  startDate: string
  workoutTitle: string
  workoutSubTitle: string
  targetMuscleTypes: string[]
  heartRates?: number[]
  calories?: number
  workoutDuration?: number
  isWorkoutComplete: boolean
  workoutTotalTime: string
  seq: number

  exercises: IWorkoutScheduleExercise[]
}

export interface IWorkoutScheduleExercise {
  workoutPlanId: number
  exerciseId: number
  name: string
  setType?: string
  circuitSeq?: number
  circuitGroupNum?: number
  description: string
  trackingFieldId: number
  isVideoRecord: boolean
  devisionId: boolean
  targetMuscles: [
    {
      id: number
      name: string
      muscleType: string
      type: string
      image: string
    }
  ]
  videos: [
    {
      url: string
      index: number
      thumbnail: string
    }
  ]
  setInfo: [
    {
      index: number
      reps: number
      weight: number
      seconds: number
    }
  ]
}

export interface IWorkoutSchedulePushType {
  tokens: string[]
  badge?: number
  type: 'workoutScheduleCreate' | 'workoutScheduleDelete' | 'workoutScheduleChange'
  contents?: string
  data?: any
}

export type IWorkoutHistoryFindAll = {
  id: number
  userId: number
  start: number
  perPage: number
}

export interface IWorkoutHistory {
  workoutScheduleId: number
  name: string
  createdAt: Date
  setInfo: SetInfo[]
  goalSetInfo: SetInfo[]
}

export type IWorkoutHistoryListForTrainer = IResponseList<IWorkoutHistory>

export type SetInfo = {
  index: number
  reps: number
  weight: number
  seconds: number
}
