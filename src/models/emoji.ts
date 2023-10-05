import {PoolConnection} from 'mysql'
import {db} from '../loaders'
import {
  IThreadFindAll, IThreadList, IThread
} from '../interfaces/thread'

const tableName = 'Emojis'
const tableThreadEmoji = 'Threads-Emojis'
const tableCommentEmoji = 'Comments-Emojis'

// async function create(options: IAdministratorCreate, connection?: PoolConnection): Promise<void> {
//   try {
//     await db.query({
//       connection,
//       sql: `INSERT INTO ?? SET ?`,
//       values: [tableName, options]
//     })
//   } catch (e) {
//     throw e
//   }
// }

async function findAll(options: IThreadFindAll): Promise<IThreadList> {
  try {
    const {userId, start, perPage} = options

    const rows: IThread[] = await db.query({
      sql: `SELECT t.id, t.writerType, t.title, t.content, t.type, t.gallery, t.workoutInfo, t.createdAt,
            JSON_OBJECT('id', u.id, 'nickname', u.nickname, 'gender', u.gender) as user,
            JSON_OBJECT('id', tra.id, 'nickname', tra.nickname, 'profile', tra.profile) as trainer,
            (SELECT e.id, e.emoji, JSON_ARRAYAGG(JSON_OBJECT('userId', te.userId, 'trainerId', te.trainerId))) users
            FROM ?? e
            JOIN ?? te ON te.emojiId = e.id AND te.threadId = t.id
            ) as emojis,
            COUNT(cm.id) as commentCount
            FROM ?? t
            JOIN ?? u ON u.id = t.userId
            JOIN ?? t ON t.id = t.trainerId
            JOIN ?? cm ON cm.threadId = t.id
            GROUP BY t.id
            LIMIT ${start}, ${perPage}`,
      values: [tableName]
    })
    const [rowTotal] = await db.query({
      sql: `SELECT COUNT(1) as total FROM ?? t`,
      values: [tableName]
    })
    return {data: rows, total: rowTotal ? rowTotal.total : 0}
  } catch (e) {
    throw e
  }
}

// async function findOne(id: number): Promise<IAdministrator> {
//   try {
//     const [row] = await db.query({
//       sql: `SELECT t.*
//       FROM ?? t
//       WHERE ?`,
//       values: [tableName, {id}]
//     })
//     return row
//   } catch (e) {
//     throw e
//   }
// }

// async function findOneSecret(id?: number, username?: string): Promise<IAdministratorSecret> {
//   try {
//     const options: any = {}
//     if (id) options.id = id
//     if (username) options.username = username

//     const [adminUser]: [IAdministratorSecret] = await db.query({
//       sql: `SELECT * FROM ?? WHERE ?`,
//       values: [tableName, options]
//     })
//     return adminUser
//   } catch (e) {
//     throw e
//   }
// }

// async function updatePassword(options: IAdministratorUpdatePassword, connection?: PoolConnection): Promise<void> {
//   try {
//     const {id, password, salt} = options
//     await db.query({
//       connection,
//       sql: `UPDATE ?? SET ? WHERE ?`,
//       values: [
//         tableName,
//         {
//           password,
//           salt
//         },
//         {id}
//       ]
//     })
//   } catch (e) {
//     throw e
//   }
// }

// async function updateOne(options: IAdministratorUpdate, connection?: PoolConnection): Promise<IAdministratorUpdate> {
//   const {id, ...data} = options
//   try {
//     const {affectedRows} = await db.query({
//       connection,
//       sql: `UPDATE ?? SET ? WHERE ? `,
//       values: [tableName, data, {id}]
//     })
//     if (affectedRows > 0) return options
//   } catch (e) {
//     throw e
//   }
// }

// async function deleteOne(options: IAdministratorDelete, connection?: PoolConnection): Promise<IAdministratorDelete> {
//   const {id} = options
//   try {
//     const {affectedRows} = await db.query({
//       connection,
//       sql: `DELETE FROM ?? WHERE ? `,
//       values: [tableName, {id}]
//     })
//     if (affectedRows > 0) return options
//   } catch (e) {
//     throw e
//   }
// }

export {tableName, tableThreadEmoji, tableCommentEmoji, findAll}
