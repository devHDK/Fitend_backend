import {PoolConnection} from 'mysql'
import {db} from '../loaders'
import {IEmoji, IEmojiComment, IEmojiThread} from '../interfaces/emoji'

const tableName = 'Emojis'
const tableThreadEmoji = 'Threads-Emojis'
const tableCommentEmoji = 'Comments-Emojis'

async function create(emoji: string, connection?: PoolConnection): Promise<number> {
  try {
    const {insertId} = await db.query({
      connection,
      sql: `INSERT INTO ?? SET ?`,
      values: [tableName, {emoji}]
    })
    return insertId
  } catch (e) {
    throw e
  }
}

async function createRelationThread(options: IEmojiThread, connection?: PoolConnection): Promise<void> {
  try {
    await db.query({
      connection,
      sql: `INSERT INTO ?? SET ?`,
      values: [tableThreadEmoji, options]
    })
  } catch (e) {
    throw e
  }
}

async function createRelationComment(options: IEmojiComment, connection?: PoolConnection): Promise<void> {
  try {
    await db.query({
      connection,
      sql: `INSERT INTO ?? SET ?`,
      values: [tableCommentEmoji, options]
    })
  } catch (e) {
    throw e
  }
}

async function findOne(options: {id?: number, emoji?: string}): Promise<IEmoji> {
  try {
    const [row] = await db.query({
      sql: `SELECT t.*
      FROM ?? t
      WHERE ?`,
      values: [tableName, options]
    })
    return row
  } catch (e) {
    throw e
  }
}

async function findOneRelationThread(options: IEmojiThread): Promise<{
  emojiId: number
  threadId: number
  userId?: number
  trainerId?: number
}> {
  const {emojiId, threadId, userId, trainerId} = options
  try {
    let values: any[] = [tableThreadEmoji, {emojiId}, {threadId}]
    if (userId) values.push({userId})
    if (trainerId) values.push({trainerId})
    const [row] = await db.query({
      sql: `SELECT t.*
      FROM ?? t
      WHERE ? AND ? AND ?`,
      values
    })
    return row
  } catch (e) {
    throw e
  }
}

async function findOneRelationComment(options: IEmojiComment): Promise<{
  emojiId: number
  commentId: number
  userId: number
  trainerId: number
}> {
  const {emojiId, commentId, userId, trainerId} = options
  try {
    let values: any[] = [tableCommentEmoji, {emojiId}, {commentId}]
    if (userId) values.push({userId})
    if (trainerId) values.push({trainerId})
    const [row] = await db.query({
      sql: `SELECT t.*
      FROM ?? t
      WHERE ? AND ? AND ?`,
      values
    })
    return row
  } catch (e) {
    throw e
  }
}

async function deleteOneRelationThread(options: IEmojiThread, connection?: PoolConnection): Promise<void> {
  const {emojiId, threadId, userId, trainerId} = options
  try {
    let values: any[] = [tableThreadEmoji, {emojiId}, {threadId}]
    if (userId) values.push({userId})
    if (trainerId) values.push({trainerId})
    await db.query({
      connection,
      sql: `DELETE FROM ?? WHERE ? AND ? AND ?`,
      values
    })
  } catch (e) {
    throw e
  }
}

async function deleteOneRelationComment(options: IEmojiComment, connection?: PoolConnection): Promise<void> {
  const {emojiId, commentId, userId, trainerId} = options
  try {
    let values: any[] = [tableCommentEmoji, {emojiId}, {commentId}]
    if (userId) values.push({userId})
    if (trainerId) values.push({trainerId})
    await db.query({
      connection,
      sql: `DELETE FROM ?? WHERE ? AND ? AND ?`,
      values
    })
  } catch (e) {
    throw e
  }
}

export {tableName, tableThreadEmoji, tableCommentEmoji, create, createRelationThread, createRelationComment, findOne, findOneRelationThread, findOneRelationComment, deleteOneRelationThread, deleteOneRelationComment}
