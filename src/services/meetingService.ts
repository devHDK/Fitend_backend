import _ from 'lodash'
import moment from 'moment-timezone'
import {
  Ticket,
  Notification,
  User,
  UserDevice,
  Meeting,
  Thread,
  Trainer,
  EventSchedule,
  Reservation
} from '../models/index'
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

    const meetingCount = await Meeting.findOneWithTimeAndTrainerId({trainerId, startTime, endTime})
    if (meetingCount > 0) throw new Error('schedule_dupplicate')

    const reservationCount = await Reservation.findOneWithTimeAndTrainerId({trainerId, startTime, endTime})
    if (reservationCount > 0) throw new Error('schedule_dupplicate')

    const eventCount = await EventSchedule.findOneWithTimeAndTrainerId({trainerId, startTime, endTime})
    if (eventCount > 0) throw new Error('schedule_dupplicate')

    const meetingId = await Meeting.create(
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
        title: `${user.nickname.substring(1)}님 안녕하세요!`,
        content: trainerThread.welcomeThreadContent,
        gallery: trainerThread.welcomeThreadGallery ? JSON.stringify(trainerThread.welcomeThreadGallery) : null,
        trainerId,
        userId,
        type: 'general',
        writerType: 'trainer'
      },
      connection
    )

    const threadContents = `새로운 스레드가 올라왔어요 👀\n${user.nickname.substring(1)}님 안녕하세요!${
      trainerThread.welcomeThreadContent
    }`
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

async function createForTrainer(options: {
  trainerId: number
  userId: number
  startTime: string
  endTime: string
}): Promise<void> {
  const connection = await db.beginTransaction()
  try {
    const {trainerId, userId, startTime, endTime} = options
    const isActive = await Ticket.findOneWithUserId(userId)
    if (!isActive) throw new Error('ticket_expired')

    const meetingCount = await Meeting.findOneWithTimeAndTrainerId({trainerId, startTime, endTime})
    if (meetingCount > 0) throw new Error('schedule_dupplicate')

    const reservationCount = await Reservation.findOneWithTimeAndTrainerId({trainerId, startTime, endTime})
    if (reservationCount > 0) throw new Error('schedule_dupplicate')

    const eventCount = await EventSchedule.findOneWithTimeAndTrainerId({trainerId, startTime, endTime})
    if (eventCount > 0) throw new Error('schedule_dupplicate')

    const meetingId = await Meeting.create(
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
    const {startTime, endTime} = options

    const meetingDetail = await Meeting.findOneWithId(options.id)
    const trainerId = meetingDetail.trainer.id

    const meetingCount = await Meeting.findOneWithTimeAndTrainerId({trainerId, startTime, endTime})
    if (meetingCount > 0) throw new Error('schedule_dupplicate')

    const reservationCount = await Reservation.findOneWithTimeAndTrainerId({trainerId, startTime, endTime})
    if (reservationCount > 0) throw new Error('schedule_dupplicate')

    const eventCount = await EventSchedule.findOneWithTimeAndTrainerId({trainerId, startTime, endTime})
    if (eventCount > 0) throw new Error('schedule_dupplicate')

    await Meeting.update(options, connection)

    const user = await User.findOne({id: meetingDetail.userId})
    const userDevices = await UserDevice.findAllWithUserId(user.id)

    const contents = `미팅이 변경 되었어요 ✍️\n${util.changeTimeFormatForPush(
      meetingDetail.startTime,
      options.startTime
    )}`
    await Notification.create(
      {
        userId: meetingDetail.userId,
        type: 'meeting',
        contents,
        info: JSON.stringify({meetingId: options.id})
      },
      connection
    )

    if (userDevices && userDevices.length > 0) {
      await User.updateBadgeCount(meetingDetail.userId, connection)
      meetingSubscriber.publishMeetingPushEvent({
        tokens: userDevices.map((device: IUserDevice) => device.token),
        type: 'meetingChangeDate',
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

async function deleteOne(id: number): Promise<void> {
  const connection = await db.beginTransaction()
  try {
    const meetingDetail = await Meeting.findOneWithId(id)

    await Meeting.deleteOne(id)

    const user = await User.findOne({id: meetingDetail.userId})
    const userDevices = await UserDevice.findAllWithUserId(user.id)

    const contents = `미팅이 취소 되었어요 🥺\n${util.defaultTimeFormatForPush(meetingDetail.startTime)}`
    await Notification.create(
      {
        userId: meetingDetail.userId,
        type: 'meeting',
        contents,
        info: JSON.stringify({meetingId: id})
      },
      connection
    )

    if (userDevices && userDevices.length > 0) {
      await User.updateBadgeCount(meetingDetail.userId, connection)
      meetingSubscriber.publishMeetingPushEvent({
        tokens: userDevices.map((device: IUserDevice) => device.token),
        type: 'meetingCancel',
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

export {create, createForTrainer, findAll, findAllForUser, findOneWithId, update, deleteOne}
