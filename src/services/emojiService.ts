import {Comment, Emoji, Thread, UserDevice} from '../models/index'
import {db} from '../loaders'
import {threadSubscriber} from '../subscribers'
import {IUserDevice} from '../interfaces/userDevice'

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

        if (trainerId !== null) {
          const thread = await Thread.findOne(threadId)
          const userDevices = await UserDevice.findAllWithUserId(thread.user.id)

          if (userDevices && userDevices.length > 0) {
            threadSubscriber.publishThreadPushEvent({
              tokens: userDevices.map((device: IUserDevice) => device.token),
              type: 'emojiDelete',
              data: {
                id: emojiId,
                emoji,
                trainerId,
                threadId
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

        if (trainerId !== null) {
          const thread = await Thread.findOne(threadId)
          const userDevices = await UserDevice.findAllWithUserId(thread.user.id)

          if (userDevices && userDevices.length > 0) {
            threadSubscriber.publishThreadPushEvent({
              tokens: userDevices.map((device: IUserDevice) => device.token),
              type: 'emojiCreate',
              data: {
                id: emojiId,
                emoji,
                trainerId,
                threadId
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

        if (trainerId !== null) {
          const comment = await Comment.findOne(commentId)
          const thread = await Thread.findOne(comment.threadId)
          const userDevices = await UserDevice.findAllWithUserId(thread.user.id)

          if (userDevices && userDevices.length > 0) {
            threadSubscriber.publishThreadPushEvent({
              tokens: userDevices.map((device: IUserDevice) => device.token),
              type: 'emojiDelete',
              data: {
                id: emojiId,
                emoji,
                trainerId,
                threadId: comment.threadId,
                commentId
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

        if (trainerId !== null) {
          const comment = await Comment.findOne(commentId)
          const thread = await Thread.findOne(comment.threadId)
          const userDevices = await UserDevice.findAllWithUserId(thread.user.id)

          if (userDevices && userDevices.length > 0) {
            threadSubscriber.publishThreadPushEvent({
              tokens: userDevices.map((device: IUserDevice) => device.token),
              type: 'emojiCreate',
              data: {
                id: emojiId,
                emoji,
                trainerId,
                threadId: comment.threadId,
                commentId
              }
            })
          }
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
