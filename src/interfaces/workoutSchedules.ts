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
  interval?: Date
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
  workoutTitle?: string
  workoutSubTitle?: string
  startDate?: string
  seq?: number
  totalTime?: string
}

export interface IWorkoutScheduleDetail {
  workoutScheduleId: number
  startDate: number
  workoutTitle: string
  workoutSubTitle: string
  targetMuscleTypes: string[]
  workoutTotalTime: string
  seq: number
  exercises: IWorkoutScheduleExercise[]
}

export interface IWorkoutScheduleExercise {
  workoutPlanId: number
  exerciseId: number
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
