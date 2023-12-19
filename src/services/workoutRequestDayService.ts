import {IWorkoutRequestDayCreate, IWorkoutRequestDayFindAll, IWorkoutRequestDayDelete, IWorkoutRequestDayList} from '../interfaces/workoutRequestDay'
import {WorkoutRequestDay} from '../models/index'
import {db} from '../loaders'

async function create(options: IWorkoutRequestDayCreate): Promise<void> {
  try {
    await WorkoutRequestDay.create(options)
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') {
      throw new Error('duplicate_date')
    }
    throw e
  }
}

async function findAll(options: IWorkoutRequestDayFindAll): Promise<[IWorkoutRequestDayList]> {
  try {
    return await WorkoutRequestDay.findAll(options)
  } catch (e) {
    throw e
  }
}

async function deleteOne(options: IWorkoutRequestDayDelete): Promise<void> {
  try {
    await WorkoutRequestDay.deleteOne(options)
  } catch (e) {
    throw e
  }
}

export {create, findAll, deleteOne}
