import {
  Comment,
  User,
  UserDevice,
  Notification,
  Thread,
  Trainer,
  TrainerDevice,
  TrainerNotification
} from '../models/index'
import {ICommentCreateOne, IComment, ICommentUpdateOne, ICommentOne} from '../interfaces/comment'
import {IUserDevice} from '../interfaces/userDevice'
import {firebase, db} from '../loaders'
import {threadSubscriber} from '../subscribers'
import {ITrainerDevice} from '../interfaces/trainerDevice'

async function create(options: ICommentCreateOne): Promise<{id: number}> {
  const connection = await db.beginTransaction()
  try {
    const {threadId, userId, trainerId, content} = options
    const commentId = await Comment.create(options, connection)
    const thread = await Thread.findOne(threadId)
    const user = await User.findOne({id: thread.user.id})
    if (userId) {
      await Thread.updateOne({id: threadId, commentChecked: false}, connection)
      // await firebase.sendToTopic(`trainer_${trainerId}`, {
      //   notification: {body: `${user.nickname}님이 스레드에 댓글을 달았어요`}
      // })

      const user = await User.findOne({id: userId})
      const trainer = await Trainer.findOne({id: thread.trainer.id})
      const trainerDevices = await TrainerDevice.findAllWithUserId(thread.trainer.id)
      const contents = `${user.nickname}님이 댓글을 달았어요 📥\n${content}`
      const info = {
        userId,
        nickname: user.nickname,
        gender: user.gender,
        threadId
      }
      await TrainerNotification.create(
        {
          trainerId: thread.trainer.id,
          type: 'thread',
          contents,
          info: JSON.stringify(info)
        },
        connection
      )

      if (trainerDevices && trainerDevices.length > 0) {
        threadSubscriber.publishThreadPushEvent({
          tokens: trainerDevices.map((device: ITrainerDevice) => device.token),
          type: 'commentCreate',
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
    } else {
      const userDevices = await UserDevice.findAllWithUserId(user.id)
      const contents = `스레드에 댓글이 달렸어요 📥\n${content}`
      await Notification.create(
        {
          userId: user.id,
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
          type: 'commentCreate',
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

    return {id: commentId}
  } catch (e) {
    if (connection) await db.rollback(connection)
    throw e
  }
}

async function findAll(threadId: number): Promise<IComment[]> {
  try {
    let ret = await Comment.findAll(threadId)
    ret = ret.map((row) => {
      row.user = row.user.id ? row.user : null
      row.trainer = row.trainer.id ? row.trainer : null
      return row
    })
    return ret
  } catch (e) {
    throw e
  }
}

async function findOne(id: number): Promise<ICommentOne> {
  try {
    return await Comment.findOne(id)
  } catch (e) {
    throw e
  }
}

async function updateOne(options: ICommentUpdateOne): Promise<void> {
  try {
    const {id} = options

    await Comment.updateOne(options)

    const comment = await Comment.findOne(id)
    const thread = await Thread.findOne(comment.threadId)
    const user = await User.findOne({id: thread.user.id})
    const trainerDevices = await TrainerDevice.findAllWithUserId(thread.trainer.id)
    if (trainerDevices && trainerDevices.length > 0) {
      threadSubscriber.publishThreadPushEvent({
        tokens: trainerDevices.map((device: ITrainerDevice) => device.token),
        type: 'commentUpdate',
        data: {
          userId: thread.user.id.toString(),
          nickname: user.nickname,
          gender: user.gender,
          threadId: thread.id.toString()
        }
      })
    }
  } catch (e) {
    throw e
  }
}

async function updateOneForTrainer(options: ICommentUpdateOne): Promise<void> {
  try {
    const comment = await Comment.findOne(options.id)
    const thread = await Thread.findOne(comment.threadId)

    await Comment.updateOne(options)

    const userDevices = await UserDevice.findAllWithUserId(thread.user.id)

    if (userDevices && userDevices.length > 0) {
      threadSubscriber.publishThreadPushEvent({
        tokens: userDevices.map((device: IUserDevice) => device.token),
        type: 'commentUpdate',
        data: {
          threadId: comment.threadId.toString()
        }
      })
    }
  } catch (e) {
    throw e
  }
}

async function deleteOne(id: number): Promise<void> {
  try {
    const comment = await Comment.findOne(id)

    await Comment.deleteOne(id)

    const thread = await Thread.findOne(comment.threadId)
    const user = await User.findOne({id: thread.user.id})
    const trainerDevices = await TrainerDevice.findAllWithUserId(thread.trainer.id)
    if (trainerDevices && trainerDevices.length > 0) {
      threadSubscriber.publishThreadPushEvent({
        tokens: trainerDevices.map((device: ITrainerDevice) => device.token),
        type: 'commentDelete',
        data: {
          userId: thread.user.id.toString(),
          nickname: user.nickname,
          gender: user.gender,
          threadId: thread.id.toString()
        }
      })
    }
  } catch (e) {
    throw e
  }
}

async function deleteOneForTrainer(id: number): Promise<void> {
  try {
    const comment = await Comment.findOne(id)
    const thread = await Thread.findOne(comment.threadId)

    await Comment.deleteOne(id)

    const userDevices = await UserDevice.findAllWithUserId(thread.user.id)

    if (userDevices && userDevices.length > 0) {
      threadSubscriber.publishThreadPushEvent({
        tokens: userDevices.map((device: IUserDevice) => device.token),
        type: 'commentDelete',
        data: {
          threadId: comment.threadId.toString(),
          commentId: comment.id.toString()
        }
      })
    }
  } catch (e) {
    throw e
  }
}

export {create, findAll, findOne, updateOne, updateOneForTrainer, deleteOne, deleteOneForTrainer}
