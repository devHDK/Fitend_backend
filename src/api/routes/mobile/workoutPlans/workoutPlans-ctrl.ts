import {Response} from 'express'
import {WorkoutPlanService} from '../../../../services'

async function getSchedules(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {id, startDate, perPage} = req.options
    console.log(req.options)
    const ret = await WorkoutPlanService.findAllWorkoutScheduleInDate({id, startDate, perPage})
    res.status(200).json(ret)
  } catch (e) {
    next(e)
  }
}

export {getSchedules}
