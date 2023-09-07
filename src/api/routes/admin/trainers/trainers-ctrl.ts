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

export {getTrainers}
