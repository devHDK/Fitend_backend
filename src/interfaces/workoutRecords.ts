import {DateTime} from 'aws-sdk/clients/devicefarm'
import {IThreadWorkoutInfo} from './thread'

export interface IWorkoutRecord {
  id: number
  workoutPlanId: number
  setInfo: string | [{index: number; reps: number; weight: number; seconds: number}]
}

export interface IWorkoutRecordsCreate {
  records: IWorkoutRecordSetInfoCreate[]
  scheduleRecords: IWorkoutRecordScheduleCreate
  workoutInfo: IThreadWorkoutInfo
}

export interface IWorkoutRecordSetInfoCreate {
  workoutPlanId: number
  setInfo: string | [{index: number; reps: number; weight: number; seconds: number}]
}

export interface IWorkoutRecordScheduleCreate {
  workoutScheduleId: number
  heartRates: string
  workoutDuration: number
  calories: number
}

export interface IWorkoutRecordDetail {
  exerciseName: string
  targetMuscles: string[]
  trackingFieldId: number
  workoutPlanId: number
  setInfo: string | [{index: number; reps: number; weight: number; seconds: number}]
}

export interface IWorkoutHistory {
  startDate: DateTime
  exerciseName: string
  workoutRecordId: number
  workoutPlanId: number
  setInfo: string | [{index: number; reps: number; weight: number; seconds: number}]
}
