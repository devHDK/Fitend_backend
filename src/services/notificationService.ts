import {INotificationFindAll, INotificationList} from '../interfaces/notifications'
import {Notification, User, UserDevice} from '../models/index'

async function findAll(options: INotificationFindAll): Promise<INotificationList> {
  try {
    return await Notification.findAll(options)
  } catch (e) {
    throw e
  }
}

async function findConfirm(userId: number): Promise<boolean> {
  try {
    return await Notification.findConfirm(userId)
  } catch (e) {
    throw e
  }
}

async function updateConfirmWithUserId(userId: number): Promise<void> {
  try {
    await Notification.updateConfirmWithUserId(userId)
  } catch (e) {
    throw e
  }
}

async function updateSettings(userId: number): Promise<void> {
  try {
    const user = await User.findOne({id: userId})
    const userDevice = await UserDevice.findOne(userId, user.deviceId, user.platform)
  } catch (e) {
    throw e
  }
}

export {findAll, findConfirm, updateConfirmWithUserId, updateSettings}
