import {Response} from 'express'
import {WorkoutRecordService} from '../../../../services'
import {WorkoutRecords} from '../../../../models'

async function postWorkoutSchedulesRecords(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {scheduleRecords, records, workoutInfo} = req.options
    let ret
    const threadId = await WorkoutRecordService.createRecords(req.userId, {records, scheduleRecords, workoutInfo})
    if (threadId) ret = threadId

    res.status(200).json(ret || null)
  } catch (e) {
    if (e.message === 'not_allowed') e.status = 403
    if (e.message === 'duplicate_record') e.status = 409
    next(e)
  }
}

async function getWorkoutRecords(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {workoutScheduleId} = req.options
    const userId = req.userId
    const ret = await WorkoutRecordService.findOne(workoutScheduleId, userId)
    res.status(200).json(ret)
  } catch (e) {
    next(e)
  }
}

async function getWorkoutHistoryWithExerciseId(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {id, start, perPage} = req.options
    const userId = req.userId

    const ret = await WorkoutRecordService.findWorkoutHistoryWithExerciseId(id, userId, start, perPage)
    res.status(200).json(ret)
  } catch (e) {
    next(e)
  }
}

export {postWorkoutSchedulesRecords, getWorkoutRecords, getWorkoutHistoryWithExerciseId}
