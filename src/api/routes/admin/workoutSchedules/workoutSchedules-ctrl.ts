import {Response} from 'express'
import {WorkoutScheduleService} from '../../../../services'

async function getWorkoutSchedules(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {startDate, endDate, userId} = req.options
    const ret = await WorkoutScheduleService.findAllForTrainer({userId, startDate, endDate})
    res.status(200).json({data: ret})
  } catch (e) {
    next(e)
  }
}

async function getWorkoutSchedulesWithId(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const ret = await WorkoutScheduleService.findOneForTrainer(req.options.id)
    if (!ret) throw new Error('not_found')
    res.status(200).json(ret)
  } catch (e) {
    if (e.message === 'not_found') e.status = 404
    next(e)
  }
}

export {getWorkoutSchedules, getWorkoutSchedulesWithId}
