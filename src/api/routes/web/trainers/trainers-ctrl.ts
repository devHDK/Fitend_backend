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

export {getTrainers}
