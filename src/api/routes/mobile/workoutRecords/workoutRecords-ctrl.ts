import {Response} from 'express'
import {WorkoutRecordService} from '../../../../services'

async function postWorkoutSchedulesRecords(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {records} = req.options
    await WorkoutRecordService.createRecords(req.userId, records)
    res.status(200).json()
  } catch (e) {
    if (e.message === 'not_allowed') e.status = 403
    if (e.message === 'duplicate_record') e.status = 409
    next(e)
  }
}

async function getWorkoutRecords(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {workoutScheduleId} = req.options
    const ret = await WorkoutRecordService.findOne(workoutScheduleId)
    res.status(200).json(ret)
  } catch (e) {
    next(e)
  }
}

export {postWorkoutSchedulesRecords, getWorkoutRecords}
