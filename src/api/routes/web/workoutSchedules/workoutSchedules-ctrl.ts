import {Response} from 'express'
import {WorkoutScheduleService} from '../../../../services'

async function postWorkoutSchedules(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {userId, workoutId, workoutTitle, workoutSubTitle, startDate, seq, totalTime, workoutPlans} = req.options
    await WorkoutScheduleService.create({
      userId,
      trainerId: req.userId,
      franchiseId: req.franchiseId,
      workoutId,
      workoutTitle,
      workoutSubTitle,
      startDate,
      seq,
      totalTime,
      workoutPlans
    })
    res.status(200).json()
  } catch (e) {
    next(e)
  }
}

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

async function getWorkoutHistoryWithId(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const ret = await WorkoutScheduleService.findAllHistory(req.options.id, req.options.userId)
    res.status(200).json({data: ret})
  } catch (e) {
    if (e.message === 'not_found') e.status = 404
    next(e)
  }
}

async function putWorkoutSchedulesWithId(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {id, workoutTitle, workoutSubTitle, startDate, seq, totalTime, workoutPlans} = req.options
    await WorkoutScheduleService.update({
      id,
      workoutTitle,
      workoutSubTitle,
      startDate,
      seq,
      totalTime,
      workoutPlans
    })
    res.status(200).json()
  } catch (e) {
    if (e.message === 'not_allowed') e.status = 403
    next(e)
  }
}

async function deleteWorkoutSchedulesWithId(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    await WorkoutScheduleService.deleteOne(req.options.id)
    res.status(200).json()
  } catch (e) {
    if (e.message === 'not_allowed') e.status = 403
    next(e)
  }
}

export {
  postWorkoutSchedules,
  getWorkoutSchedules,
  getWorkoutSchedulesWithId,
  getWorkoutHistoryWithId,
  putWorkoutSchedulesWithId,
  deleteWorkoutSchedulesWithId
}
