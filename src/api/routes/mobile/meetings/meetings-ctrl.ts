import {Response} from 'express'
import {MeetingService} from '../../../../services'

async function postMeeting(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {trainerId, startTime, endTime} = req.options
    const ret = await MeetingService.create({userId: req.userId, trainerId, startTime, endTime})
    res.status(200).json()
  } catch (e) {
    next(e)
  }
}

async function getMeetings(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {startDate, interval} = req.options
    const ret = await MeetingService.findAllForUser({userId: req.userId, startDate, interval})
    res.status(200).json({data: ret})
  } catch (e) {
    next(e)
  }
}

export {postMeeting, getMeetings}
