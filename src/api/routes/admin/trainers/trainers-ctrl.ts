import {Response} from 'express'
import {TrainerService} from '../../../../services'

async function getTrainers(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {search, franchiseId, start, perPage} = req.options
    const ret = await TrainerService.findAllForAdmin({search, franchiseId, start, perPage})
    res.status(200).json(ret)
  } catch (e) {
    next(e)
  }
}

async function getTrainersWithId(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const ret = await TrainerService.findOneWithIdForAdmin(req.options.id)
    res.status(200).json(ret)
  } catch (e) {
    if (e.message === 'not_found') e.status = 404
    next(e)
  }
}

export {getTrainers, getTrainersWithId}
