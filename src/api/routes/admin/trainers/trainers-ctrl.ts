import {Response} from 'express'
import {TrainerService} from '../../../../services'

async function postTrainers(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {nickname, email, password} = req.options
    await TrainerService.create({nickname, email, password})
    res.status(200).json()
  } catch (e) {
    next(e)
  }
}

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

export {postTrainers, getTrainers, getTrainersWithId}
