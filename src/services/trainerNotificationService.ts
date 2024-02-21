import {INotificationFindAll, INotificationFindAllTrainer, INotificationList} from '../interfaces/notifications'
import {Notification, Trainer, TrainerDevice, TrainerNotification, User, UserDevice} from '../models/index'
import {db} from '../loaders'

async function findAll(options: INotificationFindAllTrainer): Promise<INotificationList> {
  try {
    return await TrainerNotification.findAll(options)
  } catch (e) {
    throw e
  }
}

async function findConfirm(trainerId: number): Promise<boolean> {
  try {
    return await Notification.findConfirm(trainerId)
  } catch (e) {
    throw e
  }
}

async function updateConfirmWithUserId(trainerId: number): Promise<void> {
  const connection = await db.beginTransaction()
  try {
    await Notification.updateConfirmWithUserId(trainerId, connection)
    await User.updateOne({id: trainerId, badgeCount: 0}, connection)
    await db.commit(connection)
  } catch (e) {
    if (connection) await db.rollback(connection)
    throw e
  }
}

async function updateSettings(trainerId: number, isNotification: boolean): Promise<void> {
  try {
    const user = await Trainer.findOne({id: trainerId})
    await TrainerDevice.updateOne({trainerId, deviceId: user.deviceId, platform: user.platform, isNotification})
  } catch (e) {
    throw e
  }
}

export {findAll, findConfirm, updateConfirmWithUserId, updateSettings}
