import {Response} from 'express'
import {MeetingService} from '../../../../services'

async function postMeeting(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {userId, trainerId, startTime, endTime} = req.options
    const ret = await MeetingService.createForTrainer({
      userId,
      trainerId,
      startTime,
      endTime
    })
    res.status(200).json(ret)
  } catch (e) {
    if (e.message === 'ticket_expired') e.status = 403
    if (e.message === 'schedule_dupplicate') e.status = 409
    next(e)
  }
}

async function getMeetings(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {userId, trainerId, startDate, endDate} = req.options
    const ret = await MeetingService.findAll({
      franchiseId: req.franchiseId,
      userId,
      trainerId,
      startDate,
      endDate
    })
    res.status(200).json({data: ret})
  } catch (e) {
    next(e)
  }
}

async function getMeetingsWithId(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {id} = req.options
    const ret = await MeetingService.findOneWithId(id)
    res.status(200).json(ret)
  } catch (e) {
    next(e)
  }
}

async function putMeetingsWithId(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {id, status, startTime, endTime} = req.options
    await MeetingService.update({id, status, startTime, endTime})
    res.status(200).json()
  } catch (e) {
    if (e.message === 'schedule_dupplicate') e.status = 409
    next(e)
  }
}

async function deleteMeetingsWithId(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {id} = req.options
    await MeetingService.deleteOne(id)
    res.status(200).json()
  } catch (e) {
    next(e)
  }
}

export {postMeeting, getMeetings, getMeetingsWithId, putMeetingsWithId, deleteMeetingsWithId}
