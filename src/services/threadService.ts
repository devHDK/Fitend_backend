import {Thread, User, UserDevice, Notification, Trainer, TrainerDevice, TrainerNotification} from '../models/index'
import {
  IThreadFindAll,
  IThreadList,
  IThreadCreateOne,
  IThread,
  IThreadUpdateOne,
  IThreadUserList,
  IThreadCreatedId,
  IThreadFindAllUsers
} from '../interfaces/thread'
import {IUserDevice} from '../interfaces/userDevice'
import {firebase, db} from '../loaders'
import {threadSubscriber} from '../subscribers'
import {ITrainerDevice} from '../interfaces/trainerDevice'

async function create(options: IThreadCreateOne): Promise<IThreadCreatedId> {
  const connection = await db.beginTransaction()
  try {
    const {userId, writerType, title, content, isMeetingThread, trainerId} = options

    delete options.isMeetingThread

    const threadId = await Thread.create(options, connection)
    const user = await User.findOne({id: userId})
    if (writerType === 'user') {
      const trainer = await Trainer.findOne({id: trainerId})
      const trainerDevices = await TrainerDevice.findAllWithUserId(trainerId)
      const contents = `${user.nickname}님이 스레드를 올렸어요 👀\n${title ? `${title} ∙ ` : ''}${content}`
      const info = {
        userId,
        nickname: user.nickname,
        gender: user.gender,
        threadId
      }
      await TrainerNotification.create(
        {
          trainerId,
          type: 'thread',
          contents,
          info: JSON.stringify(info)
        },
        connection
      )

      if (trainerDevices && trainerDevices.length > 0) {
        threadSubscriber.publishThreadPushEvent({
          tokens: trainerDevices.map((device: ITrainerDevice) => device.token),
          type: 'threadCreate',
          sound: 'default',
          badge: trainer.badgeCount + 1,
          contents,
          data: {
            userId: userId.toString(),
            nickname: user.nickname,
            gender: user.gender,
            threadId: threadId.toString()
          }
        })
      }

      if (isMeetingThread) {
        // await User.createInflowContent({complete: false, name: '사전상담여부', userId}, connection)
        const trainerThread = await Trainer.findOneTrainerThread({id: trainerId})
        const trainerThreadId = await Thread.create(
          {
            title: `${user.nickname.substring(1)}님 안녕하세요!`,
            content: trainerThread.welcomeThreadContent,
            gallery: trainerThread.welcomeThreadGallery ? JSON.stringify(trainerThread.welcomeThreadGallery) : null,
            trainerId,
            userId,
            type: 'general',
            writerType: 'trainer'
          },
          connection
        )

        const contents = `새로운 스레드가 올라왔어요 👀\n${user.nickname.substring(1)}님 안녕하세요! ∙${
          trainerThread.welcomeThreadContent
        }`
        await Notification.create(
          {
            userId,
            type: 'thread',
            contents,
            info: JSON.stringify({threadId: trainerThreadId})
          },
          connection
        )
        const userDevices = await UserDevice.findAllWithUserId(user.id)
        if (userDevices && userDevices.length > 0) {
          await User.updateBadgeCount(userId, connection)
          threadSubscriber.publishThreadPushEvent({
            tokens: userDevices.map((device: IUserDevice) => device.token),
            type: 'threadCreate',
            contents,
            badge: user.badgeCount + 1,
            sound: 'default',
            data: {
              threadId: threadId.toString()
            }
          })
        }
      }
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
          badge: user.badgeCount + 1,
          sound: 'default',
          data: {
            threadId: threadId.toString()
          }
        })
      }
    }

    await db.commit(connection)

    return {id: threadId}
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

async function findAllUsers(options: IThreadFindAllUsers): Promise<IThreadUserList> {
  try {
    return await Thread.findAllUsers(options)
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

async function updateOneForTrainer(options: IThreadUpdateOne): Promise<void> {
  try {
    const thread = await Thread.findOne(options.id)
    await Thread.updateOne(options)

    const userDevices = await UserDevice.findAllWithUserId(thread.user.id)

    if (userDevices && userDevices.length > 0) {
      threadSubscriber.publishThreadPushEvent({
        tokens: userDevices.map((device: IUserDevice) => device.token),
        type: 'threadUpdate',
        data: {
          threadId: thread.id.toString()
        }
      })
    }
  } catch (e) {
    throw e
  }
}

async function updateChecked(options: IThreadUpdateOne): Promise<void> {
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

async function deleteOneForTrainer(id: number): Promise<void> {
  try {
    const thread = await Thread.findOne(id)

    await Thread.deleteOne(id)

    const userDevices = await UserDevice.findAllWithUserId(thread.user.id)

    if (userDevices && userDevices.length > 0) {
      threadSubscriber.publishThreadPushEvent({
        tokens: userDevices.map((device: IUserDevice) => device.token),
        type: 'threadDelete',
        data: {
          threadId: thread.id.toString()
        }
      })
    }
  } catch (e) {
    throw e
  }
}

export {
  create,
  findAll,
  findAllUsers,
  findOne,
  updateOne,
  updateOneForTrainer,
  updateChecked,
  deleteOne,
  deleteOneForTrainer
}
