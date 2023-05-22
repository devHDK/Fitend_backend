export interface IWorkoutScheduleList {
  id: number
  startDate: Date
  seq: number
  workoutTitle: string
  workoutSubTitle: string
}

export interface IWorkoutScheduleFindAll {
  userId: number
  startDate: Date
}
