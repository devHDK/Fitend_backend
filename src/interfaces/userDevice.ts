export interface IUserDevice {
  id: number
  userId: number
  type: 'student' | 'presenter'
  token: string
  deviceId: string
  platform: 'ios' | 'android'
  notification: boolean
  clubNotification: boolean
  createdAt: string | Date
  updatedAt: string | Date
}

export interface IUserDeviceUpdate {
  id?: number
  userId?: number
  type?: 'student' | 'presenter'
  token?: string
  deviceId?: string
  platform?: 'ios' | 'android'
  notification?: boolean
  clubNotification?: boolean
}
