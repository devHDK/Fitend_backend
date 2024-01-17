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

async function getTrainersMeetingBoundary(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const ret = await TrainerService.findTrainersMeetingBoundaryWithId(req.options.id)
    res.status(200).json(ret)
  } catch (e) {
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

export {getTrainers, getTrainersMeetingBoundary, putTrainerMeetingBoundary}
