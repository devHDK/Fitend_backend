export interface IWorkoutSchedule {
  id: number
  userId: number
  trainer: number
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
    }
  ]
}

export interface IWorkoutScheduleFindAll {
  userId: number
  startDate: Date
}

export interface IWorkoutScheduleCreate {
  userId: number
  trainerId: number
  workoutId: number
  workoutTitle: string
  workoutSubTitle: string
  startDate: string
  seq: number
  totalTime: string
}

export interface IWorkoutScheduleUpdate {
  id: number
  workoutTitle: string
  workoutSubTitle: string
  startDate: string
  seq: number
  totalTime: string
}

export interface IWorkoutScheduleDetail {
  workoutScheduleId: number
  workoutTitle: string
  workoutSubTitle: string
  targetMuscleTypes: string[]
  workoutTotalTime: string
  exercises: [
    {
      workoutPlanId: number
      name: string
      description: string
      trackingFieldId: number
      targetMuscles: [
        {
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
  ]
}
