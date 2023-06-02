import {Response} from 'express'
import {WorkoutScheduleService} from '../../../../services'

async function postWorkoutSchedulesFeedbacks(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {id: workoutScheduleId, strengthIndex, issueIndex, contents} = req.options
    await WorkoutScheduleService.createFeedbacks({
      userId: req.userId,
      workoutScheduleId,
      strengthIndex,
      issueIndex,
      contents
    })
    res.status(200).json()
  } catch (e) {
    if (e.message === 'not_allowed') e.status = 403
    if (e.message === 'duplicate_feedback') e.status = 409
    next(e)
  }
}

async function getWorkoutSchedules(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {startDate} = req.options
    const ret = await WorkoutScheduleService.findAll({userId: req.userId, startDate})
    res.status(200).json({data: ret})
  } catch (e) {
    next(e)
  }
}

async function getWorkoutSchedulesWithId(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const ret = await WorkoutScheduleService.findOne(req.options.id)
    if (!ret) throw new Error('not_found')
    res.status(200).json(ret)
  } catch (e) {
    if (e.message === 'not_found') e.status = 404
    next(e)
  }
}

async function putWorkoutSchedulesWithId(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {id, startDate, seq} = req.options
    await WorkoutScheduleService.updateStartDate({
      id,
      startDate,
      seq
    })
    res.status(200).json()
  } catch (e) {
    if (e.message === 'not_allowed') e.status = 403
    next(e)
  }
}

export {postWorkoutSchedulesFeedbacks, getWorkoutSchedules, getWorkoutSchedulesWithId, putWorkoutSchedulesWithId}
