import {INotificationFindAll, INotificationList} from '../interfaces/notifications'
import {Notification} from '../models/index'

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

export {findAll, findConfirm, updateConfirmWithUserId}
