import {Response} from 'express'
import {ExerciseService} from '../../../../services'

async function postExercises(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {name, nameEn, type, trackingFieldId, targetMuscleIds, description, tags, videos} = req.options
    await ExerciseService.create({
      trainerId: req.userId,
      name,
      nameEn,
      type,
      trackingFieldId,
      targetMuscleIds,
      description,
      tags,
      videos
    })
    res.status(200).json()
  } catch (e) {
    if (e.message === 'ER_DUP_ENTRY') e.status = 409
    next(e)
  }
}

async function getExercises(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {search, start, perPage} = req.options
    const ret = await ExerciseService.findAll({search, start, perPage})
    res.status(200).json(ret)
  } catch (e) {
    if (e.message === 'ER_DUP_ENTRY') e.status = 409
    next(e)
  }
}

async function getExercisesWithId(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const ret = await ExerciseService.findOne(req.options.id)
    res.status(200).json(ret)
  } catch (e) {
    if (e.message === 'ER_DUP_ENTRY') e.status = 409
    next(e)
  }
}

async function putExercises(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {id, name, nameEn, type, trackingFieldId, targetMuscleIds, description, tags, videos} = req.options
    await ExerciseService.update({
      id,
      name,
      nameEn,
      type,
      trackingFieldId,
      targetMuscleIds,
      description,
      tags,
      videos: videos && videos.length > 0 ? JSON.stringify(videos) : videos
    })
    res.status(200).json()
  } catch (e) {
    next(e)
  }
}

export {postExercises, getExercises, getExercisesWithId, putExercises}
