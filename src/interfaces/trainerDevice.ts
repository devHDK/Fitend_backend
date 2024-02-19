export interface ITrainerDevice {
  trainerId: number
  deviceId: string
  token: string
  platform: 'ios' | 'android'
  isNotification: boolean
  createdAt: string | Date
  updatedAt: string | Date
}

export interface ITrainerDeviceUpdate {
  trainerId: number
  platform: 'ios' | 'android'
  deviceId: string
  token?: string
  isNotification?: boolean
}
