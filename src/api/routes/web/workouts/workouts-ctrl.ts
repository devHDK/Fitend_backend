import {Response} from "express"
import {WorkoutService} from "../../../../services"

async function postWorkouts(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {title, subTitle, totalTime, exercises} = req.options
    await WorkoutService.create({trainerId: req.userId, title, subTitle, totalTime, exercises})
    res.status(200).json()
  } catch (e) {
    next(e)
  }
}

async function getWorkouts(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {search, start, perPage} = req.options
    const ret = await WorkoutService.findAll({search, start, perPage})
    res.status(200).json(ret)
  } catch (e) {
    next(e)
  }
}

async function getWorkoutsWithId(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const ret = await WorkoutService.findOneWithId(req.options.id)
    if (!ret) throw new Error('not_found')
    res.status(200).json(ret)
  } catch (e) {
    if (e.message === "not_found") e.status = 404
    next(e)
  }
}

// async function putExercises(req: IRequest, res: Response, next: Function): Promise<void> {
//   try {
//     const { id, name, nameEn, type, trackingFieldId, targetMuscleIds, description, tags, videos } = req.options
//     await ExerciseService.update({
//       id,
//       name,
//       nameEn,
//       type,
//       trackingFieldId,
//       targetMuscleIds,
//       description,
//       tags,
//       videos: videos && videos.length > 0 ? JSON.stringify(videos) : videos
//     })
//     res.status(200).json()
//   } catch (e) {
//     next(e)
//   }
// }

export {
  postWorkouts,
  getWorkouts,
  getWorkoutsWithId,
  // putExercises
}
