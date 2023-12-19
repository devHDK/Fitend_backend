import {Response} from 'express'
import {WorkoutRequestDayService} from '../../../../services'

async function postWorkoutsRequestDays(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {userId, workoutDate} = req.options
    await WorkoutRequestDayService.create({
      userId,
      workoutDate
    })
    res.status(200).json()
  } catch (e) {
    if (e.message === 'duplicate_date') e.status = 409
    next(e)
  }
}

async function getWorkoutsRequestDays(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {userId, startDate, endDate} = req.options
    const ret = await WorkoutRequestDayService.findAll({
      userId,
      startDate,
      endDate
    })
    res.status(200).json({data: ret})
  } catch (e) {
    next(e)
  }
}

async function deleteWorkoutsRequestDays(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {userId, workoutDate} = req.options
    await WorkoutRequestDayService.deleteOne({userId, workoutDate})
    res.status(200).json()
  } catch (e) {
    next(e)
  }
}

export {
  postWorkoutsRequestDays,
  getWorkoutsRequestDays,
  deleteWorkoutsRequestDays
}
