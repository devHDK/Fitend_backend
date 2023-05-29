export interface IWorkoutFeedback {
  workoutScheduleId: number
  strengthIndex: number
  issueIndex: number
  contents: string
  createdAt: Date
}

export interface IWorkoutFeedbackCreate {
  workoutScheduleId: number
  strengthIndex: number
  issueIndex: number
  contents: string
}
