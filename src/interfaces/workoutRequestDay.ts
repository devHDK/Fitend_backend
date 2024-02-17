export interface IWorkoutRequestDayCreate {
  userId: number
  workoutDate: string
}

export interface IWorkoutRequestDayFindAll {
  userId: number
  startDate: string
  endDate: string
}

export interface IWorkoutRequestDayList {
  workoutDate: string
}

export interface IWorkoutRequestDayDelete {
  userId: number
  workoutDate: string
}

export interface IWorkoutRequestDayDeleteBetween {
  userId: number
  start: string
  end: string
}
