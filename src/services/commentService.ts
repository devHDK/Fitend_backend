import {Comment, User, UserDevice, Notification, Thread} from '../models/index'
import {ICommentCreateOne, IComment, ICommentUpdateOne} from '../interfaces/comment'
import {IUserDevice} from '../interfaces/userDevice'
import {firebase, db} from '../loaders'
import {threadSubscriber} from '../subscribers'

async function create(options: ICommentCreateOne): Promise<void> {
  const connection = await db.beginTransaction()
  try {
    const {threadId, userId, trainerId, content} = options
    const commentId = await Comment.create(options, connection)
    const thread = await Thread.findOne(threadId)
    const user = await User.findOne({id: thread.user.id})
    if (userId) {
      await Thread.updateOne({id: threadId, commentChecked: false}, connection)
      await firebase.sendToTopic(`trainer_${trainerId}`, {
        notification: {body: `${user.nickname}님이 스레드에 댓글을 달았어요`}
      })
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
          badge: user.badgeCount + 1
        })
      }
    }
    await db.commit(connection)
  } catch (e) {
    if (connection) await db.rollback(connection)
    throw e
  }
}

async function findAll(threadId: number): Promise<IComment[]> {
  try {
    let ret = await Comment.findAll(threadId)
    ret = ret.map(row => {
      row.user = row.user.id ? row.user : null
      row.trainer = row.trainer.id ? row.trainer : null
      return row
    })
    return ret
  } catch (e) {
    throw e
  }
}

async function findOne(id: number): Promise<IComment> {
  try {
    return await Comment.findOne(id)
  } catch (e) {
    throw e
  }
}

async function updateOne(options: ICommentUpdateOne): Promise<void> {
  try {
    await Comment.updateOne(options)
  } catch (e) {
    throw e
  }
}

async function deleteOne(id: number): Promise<void> {
  try {
    await Comment.deleteOne(id)
  } catch (e) {
    throw e
  }
}

export {create, findAll, findOne, updateOne, deleteOne}
