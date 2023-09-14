export interface IWorkoutRecord {
  id: number
  workoutPlanId: number
  setInfo: string | [{index: number; reps: number; weight: number; seconds: number}]
}

export interface IWorkoutRecordsCreate {
  records: IWorkoutRecordSetInfoCreate[]
  scheduleRecords: IWorkoutRecordScheduleCreate
}

export interface IWorkoutRecordSetInfoCreate {
  workoutPlanId: number
  setInfo: string | [{index: number; reps: number; weight: number; seconds: number}]
}

export interface IWorkoutRecordScheduleCreate {
  workoutScheduleId: number
  heartRates: string
  workoutDuration: number
}

export interface IWorkoutRecordDetail {
  exerciseName: string
  targetMuscles: string[]
  trackingFieldId: number
  workoutPlanId: number
  setInfo: string | [{index: number; reps: number; weight: number; seconds: number}]
}
