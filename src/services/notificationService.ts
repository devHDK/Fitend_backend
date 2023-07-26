import {INotificationFindAll, INotificationList} from '../interfaces/notifications'
import {Notification, User, UserDevice} from '../models/index'
import {db} from '../loaders'

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
  const connection = await db.beginTransaction()
  try {
    await Notification.updateConfirmWithUserId(userId, connection)
    await User.updateOne({id: userId, badgeCount: 0}, connection)
    await db.commit(connection)
  } catch (e) {
    if (connection) await db.rollback(connection)
    throw e
  }
}

async function updateSettings(userId: number, isNotification: boolean): Promise<void> {
  try {
    const user = await User.findOne({id: userId})
    await UserDevice.updateOne({userId, deviceId: user.deviceId, platform: user.platform, isNotification})
  } catch (e) {
    throw e
  }
}

export {findAll, findConfirm, updateConfirmWithUserId, updateSettings}
