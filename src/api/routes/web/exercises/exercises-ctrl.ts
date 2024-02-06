import {Response} from 'express'
import {ExerciseService} from '../../../../services'

async function postExercises(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {standardExerciseId, description, tags, videos} = req.options
    await ExerciseService.create({
      trainerId: req.userId,
      franchiseId: req.franchiseId,
      standardExerciseId,
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
    const {
      search,
      isMe,
      isBookmark,
      tagIds,
      trainerId,
      trackingFieldIds,
      targetMuscleIds,
      machineType,
      jointType,
      devisionId,
      start,
      perPage
    } = req.options
    const ret = await ExerciseService.findAll({
      search,
      trainerId: req.userId,
      isMe,
      isBookmark,
      tagIds,
      machineType,
      jointType,
      devisionId,
      trainerFilterId: trainerId,
      trackingFieldIds,
      targetMuscleIds,
      start,
      perPage
    })

    res.status(200).json(ret)
  } catch (e) {
    if (e.message === 'ER_DUP_ENTRY') e.status = 409
    next(e)
  }
}

async function getExercisesTags(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const ret = await ExerciseService.findAllTags(req.options.search)
    res.status(200).json({data: ret})
  } catch (e) {
    if (e.message === 'ER_DUP_ENTRY') e.status = 409
    next(e)
  }
}

async function getExercisesWithId(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const ret = await ExerciseService.findOne(req.options.id, req.userId)
    res.status(200).json(ret)
  } catch (e) {
    if (e.message === 'ER_DUP_ENTRY') e.status = 409
    next(e)
  }
}

async function putExercisesWithId(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {id, description, tags, videos} = req.options
    await ExerciseService.update({
      id,
      description,
      tags,
      videos: videos && videos.length > 0 ? JSON.stringify(videos) : videos
    })
    res.status(200).json()
  } catch (e) {
    next(e)
  }
}

async function putExercisesBookmark(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {id} = req.options
    await ExerciseService.updateBookmark({exerciseId: id, trainerId: req.userId})
    res.status(200).json()
  } catch (e) {
    next(e)
  }
}

export {postExercises, getExercises, getExercisesTags, getExercisesWithId, putExercisesWithId, putExercisesBookmark}
