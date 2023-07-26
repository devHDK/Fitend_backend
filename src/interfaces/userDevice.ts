export interface IUserDevice {
  userId: number
  deviceId: string
  token: string
  platform: 'ios' | 'android'
  createdAt: string | Date
  updatedAt: string | Date
}

export interface IUserDeviceUpdate {
  userId: number
  platform: 'ios' | 'android'
  deviceId: string
  token?: string
  isNotification?: boolean
}
