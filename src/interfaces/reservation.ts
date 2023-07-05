export interface IReservation {
  id: number
  title: string
  subTitle: string
  totalTime: string
  primaryTypes: string[]
  trainerId: number
  trainerNickname: string
  updatedAt: Date
}

export interface IReservationCreate {
  ticketId: number
  trainerId: number
  startTime: string
  endTime: string
  seq: number
}

export interface IReservationFindAll {
  search?: string
  isMe?: boolean
  isBookmark?: boolean
  types?: string[]
  trainerId: number
  trainerFilterId?: number
  start: number
  perPage: number
}

export interface IReservationDetail {
  id: number
  title: string
  subTitle: string
  primaryTypes: string[]
  totalTime: string
  trainerId: number
  trainerNickname: string
  trainerProfileImage: string
  updatedAt: Date
  isBookmark: boolean
  exercises: [
    {
      id: number
      videos: [
        {
          url: string
          index: number
          thumbnail: string
        }
      ]
      name: string
      trackingFieldId: number
      setInfo: [{index: number; reps: number; weight: number; seconds: number}]
      targetMuscles: string[]
    }
  ]
}

export type IReservationList = IResponseList<IReservation>
