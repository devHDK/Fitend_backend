export type INotificationFindAll = {
  userId: number
  start: number
  perPage: number
}

export type INotificationFindAllTrainer = {
  trainerId: number
  start: number
  perPage: number
}

export type INotificationList = IResponseList<{
  id: number
  type: 'reservaion' | 'thread' | 'workoutSchedules' | 'noFeedback' | 'meeting'
  userNickname: string
  totalSession: number
  createdAt: string
}>
