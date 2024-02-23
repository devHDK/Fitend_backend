import {Comment, Emoji, Thread, TrainerDevice, User, UserDevice} from '../models/index'
import {db} from '../loaders'
import {threadSubscriber} from '../subscribers'
import {IUserDevice} from '../interfaces/userDevice'
import {ITrainerDevice} from '../interfaces/trainerDevice'

async function updateEmoji(options: {
  emoji?: string
  threadId?: number
  commentId?: number
  userId?: number
  trainerId?: number
}): Promise<{emojiId: number}> {
  const connection = await db.beginTransaction()
  try {
    const {emoji, threadId, commentId, userId, trainerId} = options
    let emojiId: number
    const isEmoji = await Emoji.findOne({emoji})
    if (isEmoji) emojiId = isEmoji.id
    else {
      emojiId = await Emoji.create(emoji, connection)
    }
    if (threadId) {
      const isThreadEmoji = await Emoji.findOneRelationThread({
        emojiId,
        threadId,
        userId,
        trainerId
      })

      if (isThreadEmoji) {
        await Emoji.deleteOneRelationThread(
          {
            emojiId,
            threadId,
            userId,
            trainerId
          },
          connection
        )

        const thread = await Thread.findOne(threadId)
        if (trainerId) {
          const userDevices = await UserDevice.findAllWithUserId(thread.user.id)

          if (userDevices && userDevices.length > 0) {
            threadSubscriber.publishThreadPushEvent({
              tokens: userDevices.map((device: IUserDevice) => device.token),
              type: 'emojiDelete',
              data: {
                id: emojiId.toString(),
                emoji: emoji.toString(),
                trainerId: thread.trainer.id.toString(),
                threadId: threadId.toString()
              }
            })
          }
        } else if (userId) {
          const user = await User.findOne({id: thread.user.id})
          const trainerDevices = await TrainerDevice.findAllWithUserId(thread.trainer.id)
          if (trainerDevices && trainerDevices.length > 0) {
            threadSubscriber.publishThreadPushEvent({
              tokens: trainerDevices.map((device: ITrainerDevice) => device.token),
              type: 'emojiDelete',
              data: {
                id: emojiId.toString(),
                emoji: emoji.toString(),
                userId: thread.user.id.toString(),
                nickname: user.nickname,
                gender: user.gender,
                threadId: thread.id.toString()
              }
            })
          }
        }
      } else {
        await Emoji.createRelationThread(
          {
            emojiId,
            threadId,
            userId,
            trainerId
          },
          connection
        )

        const thread = await Thread.findOne(threadId)
        if (trainerId) {
          const userDevices = await UserDevice.findAllWithUserId(thread.user.id)

          if (userDevices && userDevices.length > 0) {
            threadSubscriber.publishThreadPushEvent({
              tokens: userDevices.map((device: IUserDevice) => device.token),
              type: 'emojiCreate',
              data: {
                id: emojiId.toString(),
                emoji: emoji.toString(),
                trainerId: thread.trainer.id.toString(),
                threadId: threadId.toString()
              }
            })
          }
        } else if (userId) {
          const user = await User.findOne({id: thread.user.id})
          const trainerDevices = await TrainerDevice.findAllWithUserId(thread.trainer.id)
          if (trainerDevices && trainerDevices.length > 0) {
            threadSubscriber.publishThreadPushEvent({
              tokens: trainerDevices.map((device: ITrainerDevice) => device.token),
              type: 'emojiCreate',
              data: {
                id: emojiId.toString(),
                emoji: emoji.toString(),
                userId: thread.user.id.toString(),
                nickname: user.nickname,
                gender: user.gender,
                threadId: thread.id.toString()
              }
            })
          }
        }
      }
    } else {
      const isCommentEmoji = await Emoji.findOneRelationComment({
        emojiId,
        commentId,
        userId,
        trainerId
      })
      if (isCommentEmoji) {
        await Emoji.deleteOneRelationComment(
          {
            emojiId,
            commentId,
            userId,
            trainerId
          },
          connection
        )

        const comment = await Comment.findOne(commentId)
        const thread = await Thread.findOne(comment.threadId)
        if (trainerId) {
          const userDevices = await UserDevice.findAllWithUserId(thread.user.id)

          if (userDevices && userDevices.length > 0) {
            threadSubscriber.publishThreadPushEvent({
              tokens: userDevices.map((device: IUserDevice) => device.token),
              type: 'emojiDelete',
              data: {
                id: emojiId.toString(),
                emoji: emoji.toString(),
                trainerId: comment.trainerId.toString(),
                threadId: comment.threadId.toString(),
                commentId: commentId.toString()
              }
            })
          }
        } else if (userId) {
          const user = await User.findOne({id: thread.user.id})
          const trainerDevices = await TrainerDevice.findAllWithUserId(thread.trainer.id)
          if (trainerDevices && trainerDevices.length > 0) {
            threadSubscriber.publishThreadPushEvent({
              tokens: trainerDevices.map((device: ITrainerDevice) => device.token),
              type: 'emojiDelete',
              data: {
                id: emojiId.toString(),
                emoji: emoji.toString(),
                userId: thread.user.id.toString(),
                nickname: user.nickname,
                gender: user.gender,
                threadId: thread.id.toString(),
                commentId: commentId.toString()
              }
            })
          }
        }
      } else {
        await Emoji.createRelationComment(
          {
            emojiId,
            commentId,
            userId,
            trainerId
          },
          connection
        )

        const comment = await Comment.findOne(commentId)
        const thread = await Thread.findOne(comment.threadId)
        const userDevices = await UserDevice.findAllWithUserId(thread.user.id)
        if (trainerId) {
          if (userDevices && userDevices.length > 0) {
            threadSubscriber.publishThreadPushEvent({
              tokens: userDevices.map((device: IUserDevice) => device.token),
              type: 'emojiCreate',
              data: {
                id: emojiId.toString(),
                emoji: emoji.toString(),
                trainerId: trainerId.toString(),
                threadId: comment.threadId.toString(),
                commentId: commentId.toString()
              }
            })
          }
        } else if (userId) {
          const user = await User.findOne({id: thread.user.id})
          const trainerDevices = await TrainerDevice.findAllWithUserId(thread.trainer.id)

          threadSubscriber.publishThreadPushEvent({
            tokens: trainerDevices.map((device: ITrainerDevice) => device.token),
            type: 'emojiCreate',
            data: {
              id: emojiId.toString(),
              emoji: emoji.toString(),
              userId: thread.user.id.toString(),
              nickname: user.nickname,
              gender: user.gender,
              threadId: thread.id.toString(),
              commentId: commentId.toString()
            }
          })
        }
      }
    }
    await db.commit(connection)
    return {emojiId}
  } catch (e) {
    if (connection) await db.rollback(connection)
    throw e
  }
}

export {updateEmoji}
