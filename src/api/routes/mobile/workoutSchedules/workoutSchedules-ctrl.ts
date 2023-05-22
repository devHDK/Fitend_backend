import {Response} from 'express'
import {WorkoutScheduleService} from '../../../../services'

async function getWorkoutSchedules(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {startDate} = req.options
    const ret = await WorkoutScheduleService.findAll({userId: req.userId, startDate})
    res.status(200).json({data: ret})
  } catch (e) {
    next(e)
  }
}

export {getWorkoutSchedules}
