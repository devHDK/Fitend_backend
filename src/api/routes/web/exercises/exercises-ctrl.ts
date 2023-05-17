import { Response } from "express"
import { ExerciseService } from "../../../../services"

async function postExercises(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const { name, nameEn, type, trackingFieldId, targetMuscleIds, description, tags, videos } = req.options
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
    if (e.message === "ER_DUP_ENTRY") e.status = 409
    next(e);
  }
}

export {
  postExercises
};
