import {Emoji} from '../models/index'
import {db} from '../loaders'

async function updateEmoji(options: {
  emoji?: string
  threadId?: number
  commentId?: number
  userId?: number
  trainerId?: number
}): Promise<void> {
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
        await Emoji.deleteOneRelationThread({
          emojiId,
          threadId,
          userId,
          trainerId
        }, connection)
      } else {
        await Emoji.createRelationThread({
          emojiId,
          threadId,
          userId,
          trainerId
        }, connection)
      }
    } else {
      const isCommentEmoji = await Emoji.findOneRelationComment({
        emojiId,
        commentId,
        userId,
        trainerId
      })
      if (isCommentEmoji) {
        await Emoji.deleteOneRelationComment({
          emojiId,
          commentId,
          userId,
          trainerId
        }, connection)
      } else {
        await Emoji.createRelationComment({
          emojiId,
          commentId,
          userId,
          trainerId
        }, connection)
      }
    }
    await db.commit(connection)
  } catch (e) {
    if (connection) await db.rollback(connection)
    throw e
  }
}

export {updateEmoji}
