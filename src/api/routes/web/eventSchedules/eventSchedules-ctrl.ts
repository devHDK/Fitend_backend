import {Response} from 'express'
import {EventScheduleService} from '../../../../services'

async function postEventSchedules(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {trainerId, title, type, startTime, endTime} = req.options
    await EventScheduleService.create({
      franchiseId: req.franchiseId,
      trainerId,
      title,
      type,
      startTime,
      endTime
    })
    res.status(200).json()
  } catch (e) {
    if (e.message === 'event_duplicate') e.status = 409
    next(e)
  }
}

async function getEventSchedules(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {trainerId, startDate, endDate} = req.options
    const ret = await EventScheduleService.findAll({
      franchiseId: req.franchiseId,
      trainerId,
      startDate,
      endDate
    })
    res.status(200).json({data: ret})
  } catch (e) {
    next(e)
  }
}

async function getEventSchedulesWithId(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const ret = await EventScheduleService.findOneWithId(req.options.id)
    if (!ret) throw new Error('not_found')
    res.status(200).json(ret)
  } catch (e) {
    if (e.message === 'not_found') e.status = 404
    next(e)
  }
}

async function putEventSchedulesWithId(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {id, trainerId, title, type, startTime, endTime} = req.options
    await EventScheduleService.update({id, trainerId, title, type, startTime, endTime})
    res.status(200).json()
  } catch (e) {
    next(e)
  }
}

async function deleteEventSchedulesWithId(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {id} = req.options
    await EventScheduleService.deleteOne(id)
    res.status(200).json()
  } catch (e) {
    next(e)
  }
}

export {
  postEventSchedules,
  getEventSchedules,
  getEventSchedulesWithId,
  putEventSchedulesWithId,
  deleteEventSchedulesWithId
}
