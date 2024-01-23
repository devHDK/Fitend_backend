import _ from 'lodash'
import moment from 'moment-timezone'
import {Ticket, Notification, User, UserDevice, Meeting, Thread, Trainer} from '../models/index'
import {db} from '../loaders'
import {util} from '../libs'
import {meetingSubscriber} from '../subscribers'
import {IUserDevice} from '../interfaces/userDevice'
import {
  IMeetingDetail,
  IMeetingFindAll,
  IMeetingFindAllForUser,
  IMeetingList,
  IMeetingUpdate
} from '../interfaces/meetings'

async function create(options: {trainerId: number; userId: number; startTime: string; endTime: string}): Promise<void> {
  const connection = await db.beginTransaction()
  try {
    const {trainerId, userId, startTime, endTime} = options
    const isActive = await Ticket.findOneWithUserId(userId)
    if (!isActive) throw new Error('ticket_expired')

    let meetingId = 0

    meetingId = await Meeting.create(
      {
        trainerId,
        userId,
        startTime,
        endTime
      },
      connection
    )

    const user = await User.findOne({id: userId})
    const userDevices = await UserDevice.findAllWithUserId(user.id)

    const trainerThread = await Trainer.findOneTrainerThread({id: trainerId})
    const threadId = await Thread.create(
      {
        title: `${user.nickname.substring(1)}님 안녕하세요`,
        content: trainerThread.welcomeThreadContent,
        gallery: JSON.stringify(trainerThread.welcomeThreadGallery),
        trainerId,
        userId,
        type: 'general',
        writerType: 'trainer'
      },
      connection
    )

    const threadContents = `새로운 스레드가 올라왔어요 👀\n${trainerThread.welcomeThreadContent}`
    await Notification.create(
      {
        userId,
        type: 'thread',
        contents: threadContents,
        info: JSON.stringify({threadId})
      },
      connection
    )

    const contents = `미팅이 확정 되었어요 😊\n${util.defaultTimeFormatForPush(startTime)}`
    await Notification.create(
      {
        userId,
        type: 'meeting',
        contents,
        info: JSON.stringify({meetingId})
      },
      connection
    )

    if (userDevices && userDevices.length > 0) {
      await User.updateBadgeCount(userId, connection)
      meetingSubscriber.publishMeetingPushEvent({
        tokens: userDevices.map((device: IUserDevice) => device.token),
        type: 'meetingCreate',
        contents,
        badge: user.badgeCount + 1
      })
    }

    await db.commit(connection)
  } catch (e) {
    if (connection) await db.rollback(connection)
    throw e
  }
}

async function findAll(options: IMeetingFindAll): Promise<[IMeetingList]> {
  try {
    return await Meeting.findAll(options)
  } catch (e) {
    throw e
  }
}

async function findAllForUser(options: IMeetingFindAllForUser): Promise<[IMeetingList]> {
  try {
    return await Meeting.findAllForUser(options)
  } catch (e) {
    throw e
  }
}

async function findOneWithId(id: number): Promise<IMeetingDetail> {
  try {
    return await Meeting.findOneWithId(id)
  } catch (e) {
    throw e
  }
}

async function update(options: IMeetingUpdate): Promise<void> {
  const connection = await db.beginTransaction()
  try {
    await Meeting.update(options, connection)
    await db.commit(connection)
  } catch (e) {
    if (connection) await db.rollback(connection)
    throw e
  }
}

async function deleteOne(id: number): Promise<void> {
  try {
    await Meeting.deleteOne(id)
  } catch (e) {
    throw e
  }
}

export {create, findAll, findAllForUser, findOneWithId, update, deleteOne}
