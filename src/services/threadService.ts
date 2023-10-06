import {Thread, User, UserDevice, Notification} from '../models/index'
import {IThreadFindAll, IThreadList, IThreadCreateOne, IThread, IThreadUpdateOne, IThreadUserList} from '../interfaces/thread'
import {IUserDevice} from '../interfaces/userDevice'
import {firebase, db} from '../loaders'
import {threadSubscriber} from '../subscribers'

async function create(options: IThreadCreateOne): Promise<void> {
  const connection = await db.beginTransaction()
  try {
    const {userId, writerType, title, content} = options
    const threadId = await Thread.create(options, connection)
    const user = await User.findOne({id: userId})
    if (writerType === 'user') {
      await firebase.sendToTopic(`trainer_${options.trainerId}`, {
        notification: {body: `${user.nickname}님이 새로운 스레드를 올렸어요`}
      })
    } else {
      const userDevices = await UserDevice.findAllWithUserId(user.id)
      const contents = `새로운 스레드가 올라왔어요 👀\n${title ? `${title}·` : ``}${content}`
      await Notification.create(
        {
          userId,
          type: 'thread',
          contents,
          info: JSON.stringify({threadId})
        },
        connection
      )
      if (userDevices && userDevices.length > 0) {
        await User.updateBadgeCount(userId, connection)
        threadSubscriber.publishThreadPushEvent({
          tokens: userDevices.map((device: IUserDevice) => device.token),
          type: 'threadCreate',
          contents,
          badge: user.badgeCount + 1
        })
      }
    }
    await db.commit(connection)
  } catch (e) {
    if (connection) await db.rollback(connection)
    throw e
  }
}

async function findAll(options: IThreadFindAll): Promise<IThreadList> {
  try {
    return await Thread.findAll(options)
  } catch (e) {
    throw e
  }
}

async function findAllUsers(trainerId: number): Promise<IThreadUserList> {
  try {
    return await Thread.findAllUsers(trainerId)
  } catch (e) {
    throw e
  }
}

async function findOne(id: number): Promise<IThread> {
  try {
    return await Thread.findOne(id)
  } catch (e) {
    throw e
  }
}

async function updateOne(options: IThreadUpdateOne): Promise<void> {
  try {
    await Thread.updateOne(options)
  } catch (e) {
    throw e
  }
}

async function deleteOne(id: number): Promise<void> {
  try {
    await Thread.deleteOne(id)
  } catch (e) {
    throw e
  }
}

export {create, findAll, findAllUsers, findOne, updateOne, deleteOne}
