import {PoolConnection} from 'mysql'
import {db} from '../loaders'
import {Comment, Emoji, Trainer, User} from './'
import {
  IThreadFindAll, IThreadList, IThread, IThreadCreateOne, IThreadUpdateOne
} from '../interfaces/thread'

const tableName = 'Threads'

async function create(options: IThreadCreateOne, connection?: PoolConnection): Promise<number> {
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

async function findAll(options: IThreadFindAll): Promise<IThreadList> {
  try {
    const {userId, start, perPage} = options

    const rows: IThread[] = await db.query({
      sql: `SELECT t.id, t.writerType, t.title, t.content, t.type, t.gallery, t.workoutInfo, t.createdAt,
            JSON_OBJECT('id', u.id, 'nickname', u.nickname, 'gender', u.gender) as user,
            JSON_OBJECT('id', tra.id, 'nickname', tra.nickname, 'profileImage', tra.profileImage) as trainer,
            (SELECT JSON_ARRAYAGG(
                JSON_OBJECT('id', e.id, 'emoji', e.emoji, 'userId', te.userId, 'trainerId', te.trainerId
              ))
            FROM ?? e
            JOIN ?? te ON te.emojiId = e.id AND te.threadId = t.id
            ) as emojis,
            COUNT(cm.id) as commentCount
            FROM ?? t
            JOIN ?? u ON u.id = t.userId
            JOIN ?? tra ON tra.id = t.trainerId
            LEFT JOIN ?? cm ON cm.threadId = t.id
            WHERE t.userId = ?
            GROUP BY t.id
            ORDER BY t.createdAt DESC
            LIMIT ${start}, ${perPage}`,
      values: [Emoji.tableName, Emoji.tableThreadEmoji, tableName, User.tableName, Trainer.tableName, Comment.tableName, userId]
    })
    const [rowTotal] = await db.query({
      sql: `SELECT COUNT(1) as total FROM ?? t
            WHERE t.userId = ?`,
      values: [tableName, userId]
    })
    return {data: rows, total: rowTotal ? rowTotal.total : 0}
  } catch (e) {
    throw e
  }
}

async function findOne(id: number): Promise<IThread> {
  try {
    const [row] = await db.query({
      sql: `SELECT t.id, t.writerType, t.title, t.content, t.type, t.gallery, t.workoutInfo, t.createdAt,
      JSON_OBJECT('id', u.id, 'nickname', u.nickname, 'gender', u.gender) as user,
      JSON_OBJECT('id', tra.id, 'nickname', tra.nickname, 'profileImage', tra.profileImage) as trainer,
      (SELECT JSON_ARRAYAGG(
          JSON_OBJECT('id', e.id, 'emoji', e.emoji, 'userId', te.userId, 'trainerId', te.trainerId
        ))
      FROM ?? e
      JOIN ?? te ON te.emojiId = e.id AND te.threadId = t.id
      GROUP BY e.id
      ) as emojis
      FROM ?? t
      JOIN ?? u ON u.id = t.userId
      JOIN ?? tra ON tra.id = t.trainerId
      WHERE t.id = ?
      GROUP BY t.id`,
      values: [Emoji.tableName, Emoji.tableThreadEmoji, tableName, User.tableName, Trainer.tableName, id]
    })
    return row
  } catch (e) {
    throw e
  }
}

async function updateOne(options: IThreadUpdateOne, connection?: PoolConnection): Promise<void> {
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
