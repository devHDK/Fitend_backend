export interface IMeeting {
  id: number
  trainerId: number
  startTime: string
  endTime: string
}

export interface IMeetingCreate {
  trainerId: number
  userId: number
  startTime: string
  endTime: string
}

export interface IMeetingFindAll {
  franchiseId: number
  userId?: number
  trainerId?: number
  startDate: string
  endDate: string
}

export interface IMeetingFindAllForUser {
  userId: number
  startDate: string
  interval?: string
}

export interface IMeetingDetail {
  id: number
  startTime: string
  endTime: string
  status: string
  userId: number
  userNickname: string
  trainer: {
    id: number
    nickname: string
    profileImage: string
  }
}

export interface IMeetingFindOne {
  id: number
  startTime: string
  endTime: string
  status: string
}

export interface IMeetingList {
  startDate: string
  meetings: [
    {
      id: number
      startTime: string
      endTime: string
      status: string
      userNickname: string
      trainer: {
        id: number
        nickname: string
        profileImage: string
      }
    }
  ]
}

export interface IMeetingListForMeetingSelect {
  startDate: string
  data: [
    {
      startTime: string
      endTime: string
      type: string
    }
  ]
}

export interface IMeetingListForTicket {
  id: number
  seq: number
  startTime: string
  endTime: string
  userNickname: string
  trainerNickname: string
  status: string
}

export interface IMeetingUpdate {
  id: number
  trainerId?: number
  startTime?: string
  endTime?: string
  status?: string
}

export interface IMeetingPushType {
  tokens: string[]
  badge: number
  type: 'meetingCreate' | 'meetingCancel' | 'meetingChangeDate'
  contents: string
  data?: any
}
