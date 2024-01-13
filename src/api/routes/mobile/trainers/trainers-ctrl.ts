import {Response} from 'express'
import {TrainerService} from '../../../../services'

async function getTrainers(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const ret = await TrainerService.findAllForUserSelect()
    res.status(200).json({data: ret})
  } catch (e) {
    next(e)
  }
}

async function getTrainersWithId(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const ret = await TrainerService.findOneWithIdForUser(req.options.id)
    res.status(200).json(ret)
  } catch (e) {
    if (e.message === 'not_found') e.status = 404
    next(e)
  }
}

async function getTrainerschedules(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {startDate, endDate} = req.options
    const ret = await TrainerService.findAllTrainerScheduleWithId({startDate, endDate, trainerId: req.options.id})
    res.status(200).json({data: ret})
  } catch (e) {
    if (e.message === 'not_found') e.status = 404
    next(e)
  }
}

export {getTrainers, getTrainersWithId, getTrainerschedules}
