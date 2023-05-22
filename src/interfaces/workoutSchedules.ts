export interface IWorkoutScheduleList {
  startDate: Date
  workouts: [
    {
      scheduleId: number
      seq: number
      title: string
      subTitle: string
      isComplete: boolean
    }
  ]
}

export interface IWorkoutScheduleFindAll {
  userId: number
  startDate: Date
}
