import {Response} from 'express'
import {FranchisesService} from '../../../../services'

async function getFranchises(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const ret = await FranchisesService.findAllForAdmin()
    res.status(200).json({data: ret})
  } catch (e) {
    next(e)
  }
}

export {getFranchises}
