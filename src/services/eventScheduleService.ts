import {
  IEventScheduleFindAll,
  IEventScheduleCreate,
  IEventScheduleList,
  IEventScheduleUpdate,
  IEventScheduleDetail
} from '../interfaces/eventSchedule'
import {EventSchedule} from '../models/index'

async function create(options: IEventScheduleCreate): Promise<void> {
  try {
    // 겹치는 일정 validation
    // const reservationDuplicate = await Reservation.findOneWithTime({trainerId, startTime, endTime})
    // const eventDuplicate = await EventSchedule.findOneWithTime({trainerId, startTime, endTime})
    // if (reservationDuplicate > 0 || eventDuplicate > 0) throw new Error('event_duplicate')
    await EventSchedule.create(options)
  } catch (e) {
    throw e
  }
}

async function findAll(options: IEventScheduleFindAll): Promise<[IEventScheduleList]> {
  try {
    return await EventSchedule.findAll(options)
  } catch (e) {
    throw e
  }
}

async function findOneWithId(id: number): Promise<IEventScheduleDetail> {
  try {
    return await EventSchedule.findOneWithId(id)
  } catch (e) {
    throw e
  }
}

async function update(options: IEventScheduleUpdate): Promise<void> {
  try {
    await EventSchedule.update(options)
  } catch (e) {
    throw e
  }
}

async function deleteOne(id: number): Promise<void> {
  try {
    await EventSchedule.deleteOne(id)
  } catch (e) {
    throw e
  }
}

export {create, findAll, findOneWithId, update, deleteOne}
