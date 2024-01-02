import {Response} from 'express'
import {TrainerService} from '../../../../services'

async function getTrainers(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const ret = await TrainerService.findAllForUserSelect()
    res.status(200).json(ret)
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

export {getTrainers, getTrainersWithId}
