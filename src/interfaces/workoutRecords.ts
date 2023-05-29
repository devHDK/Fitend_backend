export interface IWorkoutRecord {
  id: number
  workoutPlanId: number
  setInfo: string | [{index: number; reps: number; weight: number; seconds: number}]
}

export interface IWorkoutRecordCreate {
  workoutPlanId: number
  setInfo: string | [{index: number; reps: number; weight: number; seconds: number}]
}

export interface IWorkoutRecordDetail {
  exerciseName: string
  targetMuscles: string[]
  setInfo: string | [{index: number; reps: number; weight: number; seconds: number}]
}
