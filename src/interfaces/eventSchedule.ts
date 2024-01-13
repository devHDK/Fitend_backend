export interface IEventSchedule {
  id: number
  trainerId: number
  type: 'cs' | 'etc'
  title: string
  startTime: string
  endTime: string
  createdAt: string
}

export interface IEventScheduleCreate {
  franchiseId: number
  trainerId: number
  type: 'cs' | 'etc'
  title: string
  startTime: string
  endTime: string
}

export interface IEventScheduleFindAll {
  franchiseId: number
  trainerId?: number
  startDate: string
  endDate: string
}

export interface IEventScheduleDetail {
  id: number
  type: 'cs' | 'etc'
  title: string
  startTime: string
  endTime: string
  trainer: {
    id: number
    nickname: string
    profileImage: string
  }
}
export interface IEventScheduleList {
  id: number
  type: 'cs' | 'etc'
  title: string
  startTime: string
  endTime: string
  trainer: {
    id: number
    nickname: string
    profileImage: string
  }
}

export interface IEventListForMeetingSelect {
  startDate: string
  data: [
    {
      startTime: string
      endTime: string
      type: string
    }
  ]
}

export interface IEventScheduleUpdate {
  id: number
  trainerId: number
  title: string
  type: number
  startTime: string
  endTime: string
}
