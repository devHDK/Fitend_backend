export interface IWorkoutPlanFind {
  id?: number
  workoutScheduleId?: number
}

export interface IWorkoutPlan {
  id: number
  exerciseId: number
  workoutScheduleId: number
  setInfo: [{index: number; reps: number; weight: number; seconds: number}] | string
  circuitGroupNum?: number
  isVideoRecord: boolean
  setType?: string
  circuitSeq?: number
}

export interface IWorkoutPlanCreate {
  exerciseId: number
  workoutScheduleId: number
  setInfo: [{index: number; reps: number; weight: number; seconds: number}] | string
  circuitGroupNum?: number
  isVideoRecord: boolean
  setType?: string
  circuitSeq?: number
}
