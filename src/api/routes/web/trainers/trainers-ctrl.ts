import {Response} from 'express'
import {TrainerService} from '../../../../services'

async function getTrainers(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const ret = await TrainerService.findAll(req.franchiseId)
    res.status(200).json({data: ret})
  } catch (e) {
    next(e)
  }
}

async function getMe(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const trainer = await TrainerService.getMe({id: req.userId})
    res.status(200).json({trainer})
  } catch (e) {
    if (e.message === 'no_token') e.status = 401
    next(e)
  }
}

async function getTrainersMeetingBoundary(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const ret = await TrainerService.findTrainersMeetingBoundaryWithId(req.options.id)
    res.status(200).json(ret)
  } catch (e) {
    next(e)
  }
}

async function putFCMToken(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    await TrainerService.updateFCMToken({
      trainerId: req.userId,
      token: req.options.token,
      platform: req.options.platform,
      deviceId: req.options.deviceId
    })
    res.status(200).json()
  } catch (e) {
    if (e.message === 'ticket_expired') e.status = 401
    if (e.message === 'no_token') e.status = 401
    next(e)
  }
}

async function putTrainerMeetingBoundary(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {id, workStartTime, workEndTime} = req.options
    await TrainerService.updateMeetingBoundary({trainerId: id, workStartTime, workEndTime})
    res.status(200).json()
  } catch (e) {
    next(e)
  }
}

export {getTrainers, getMe, getTrainersMeetingBoundary, putFCMToken, putTrainerMeetingBoundary}
