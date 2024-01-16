import {Response} from 'express'
import {MeetingService} from '../../../../services'

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

export {getMeetings}
