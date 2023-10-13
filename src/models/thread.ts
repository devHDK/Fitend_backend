import {PoolConnection} from 'mysql'
import moment from 'moment-timezone'
import _ from 'lodash'
import {db} from '../loaders'
import {Comment, Emoji, Ticket, Trainer, User} from './'
import {
  IThreadFindAll,
  IThreadList,
  IThread,
  IThreadCreateOne,
  IThreadUpdateOne,
  IThreadUserList
} from '../interfaces/thread'

moment.tz.setDefault('Asia/Seoul')

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
      sql: `SELECT t.id, t.workoutScheduleId, t.writerType, t.title, t.content, t.type, t.gallery, t.workoutInfo, t.createdAt,
            t.checked, t.commentChecked,
            JSON_OBJECT('id', u.id, 'nickname', u.nickname, 'gender', u.gender) as user,
            JSON_OBJECT('id', tra.id, 'nickname', tra.nickname, 'profileImage', tra.profileImage) as trainer,
            (SELECT JSON_ARRAYAGG(
                JSON_OBJECT('id', e.id, 'emoji', e.emoji, 'userId', te.userId, 'trainerId', te.trainerId
              ))
            FROM ?? e
            JOIN ?? te ON te.emojiId = e.id AND te.threadId = t.id
            ) as emojis,
            COUNT(CASE WHEN cm.id AND cm.userId THEN 1 END) as userCommentCount,
            COUNT(CASE WHEN cm.id AND cm.trainerId THEN 1 END) as trainerCommentCount
            FROM ?? t
            JOIN ?? u ON u.id = t.userId
            JOIN ?? tra ON tra.id = t.trainerId
            LEFT JOIN ?? cm ON cm.threadId = t.id
            WHERE t.userId = ?
            GROUP BY t.id
            ORDER BY t.createdAt DESC
            LIMIT ${start}, ${perPage}`,
      values: [
        Emoji.tableName,
        Emoji.tableThreadEmoji,
        tableName,
        User.tableName,
        Trainer.tableName,
        Comment.tableName,
        userId
      ]
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

async function findAllWithWorkoutScheduleId(workoutScheduleId: number): Promise<IThread[]> {
  try {
    return await db.query({
      sql: `SELECT t.id, t.workoutScheduleId, t.writerType, t.title, t.content, t.type, t.gallery, t.workoutInfo, t.createdAt,
            t.checked, t.commentChecked,
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
            WHERE t.workoutScheduleId = ?
            GROUP BY t.id
            ORDER BY t.createdAt DESC`,
      values: [
        Emoji.tableName,
        Emoji.tableThreadEmoji,
        tableName,
        User.tableName,
        Trainer.tableName,
        Comment.tableName,
        workoutScheduleId
      ]
    })
  } catch (e) {
    throw e
  }
}

async function findAllUsers(trainerId: number): Promise<IThreadUserList> {
  try {
    const currentTime = moment().format('YYYY-MM-DD')
    const rows = await db.query({
      sql: `SELECT t.id, t.nickname, t.gender,
      JSON_ARRAYAGG(JSON_OBJECT('id', ti.id, 'isActive', ti.expiredAt >= '${currentTime}', 'type', ti.type)) as availableTickets,
      (SELECT th.updatedAt 
        FROM ?? th 
        WHERE th.userId = tr.userId AND th.trainerId = tr.trainerId 
        ORDER BY th.updatedAt DESC 
        LIMIT 1) as updatedAt,
        (SELECT IF(th.id, false, true)
          FROM ?? th 
          WHERE th.userId = tr.userId AND th.trainerId = tr.trainerId 
          AND (th.checked = false OR th.commentChecked = false)
          LIMIT 1) as isChecked
      FROM ?? t
      JOIN ?? tr ON tr.userId = t.id AND tr.trainerId = ?
      JOIN ?? ti ON ti.id = tr.ticketId
      GROUP BY t.id
      ORDER BY updatedAt DESC
      LIMIT 100`,
      values: [tableName, tableName, User.tableName, Ticket.tableTicketRelation, trainerId, Ticket.tableName]
    })
    return rows.map((row) => {
      row.isChecked = row.isChecked === null ? true : row.isChecked
      row.availableTickets = row.availableTickets
        .filter((ticket) => {
          return ticket.isActive
        })
        .map((ticket) => {
          delete ticket.isActive
          return ticket
        })
      return row
    })
  } catch (e) {
    throw e
  }
}

async function findOne(id: number): Promise<IThread> {
  try {
    const [row] = await db.query({
      sql: `SELECT t.id, t.workoutScheduleId, t.writerType, t.title, t.content, t.type, t.gallery, t.workoutInfo, t.createdAt,
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

export {tableName, create, findAll, findAllWithWorkoutScheduleId, findAllUsers, findOne, updateOne, deleteOne}
