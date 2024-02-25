import {PoolConnection} from 'mysql'
import {db} from '../loaders'
import {ICommentFindAll, IComment, ICommentCreateOne, ICommentUpdateOne, ICommentOne} from '../interfaces/comment'
import {Emoji, Trainer, User} from '.'

const tableName = 'Comments'
const tableCommentEmoji = 'Comments-Emojis'

async function create(options: ICommentCreateOne, connection?: PoolConnection): Promise<number> {
  try {
    const {insertId} = await db.query({
      connection,
      sql: `INSERT INTO ?? SET ?`,
      values: [tableName, options]
    })
    return insertId
  } catch (e) {
    throw e
  }
}

async function findAll(threadId: number): Promise<IComment[]> {
  try {
    return await db.query({
      sql: `SELECT t.id, t.threadId, t.trainerId, t.content, t.userId, t.gallery, t.createdAt,
            JSON_OBJECT('id', u.id, 'nickname', u.nickname, 'gender', u.gender) as user,
            JSON_OBJECT('id', tra.id, 'nickname', tra.nickname, 'profileImage', tra.profileImage) as trainer,
            (SELECT JSON_ARRAYAGG(
                JSON_OBJECT('id', e.id, 'emoji', e.emoji, 'userId', ce.userId, 'trainerId', ce.trainerId
              ))
            FROM ?? e
            JOIN ?? ce ON ce.emojiId = e.id AND ce.commentId = t.id
            ) as emojis
            FROM ?? t
            LEFT JOIN ?? u ON u.id = t.userId
            LEFT JOIN ?? tra ON tra.id = t.trainerId
            WHERE t.threadId = ?
            GROUP BY t.id
            ORDER BY t.createdAt ASC
            LIMIT 100`,
      values: [Emoji.tableName, Emoji.tableCommentEmoji, tableName, User.tableName, Trainer.tableName, threadId]
    })
  } catch (e) {
    throw e
  }
}

async function findOne(id: number): Promise<ICommentOne> {
  try {
    const [row] = await db.query({
      sql: `SELECT * 
      FROM ??
      WHERE ?
      `,
      values: [tableName, {id}]
    })
    return row
  } catch (e) {
    throw e
  }
}

async function updateOne(options: ICommentUpdateOne, connection?: PoolConnection): Promise<void> {
  const {id, ...data} = options
  try {
    await db.query({
      connection,
      sql: `UPDATE ?? SET ? WHERE ? `,
      values: [tableName, data, {id}]
    })
  } catch (e) {
    throw e
  }
}

async function deleteOne(id: number, connection?: PoolConnection): Promise<void> {
  try {
    await db.query({
      connection,
      sql: `DELETE FROM ?? WHERE ? `,
      values: [tableName, {id}]
    })
  } catch (e) {
    throw e
  }
}

export {tableName, create, findAll, findOne, updateOne, deleteOne}
