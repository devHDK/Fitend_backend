export type INotificationFindAll = {
  userId: number
  start: number
  perPage: number
}

export type INotificationList = IResponseList<{
  id: number
  type: 'personal' | 'fitness'
  userNickname: string
  totalSession: number
  createdAt: string
}>
