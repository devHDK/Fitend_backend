import {Response} from 'express'
import {StandardExerciseService} from '../../../../services'

async function postStandardExercises(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {name, nameEn, devisionId, trackingFieldId, targetMuscleIds, machineType, jointType} = req.options
    await StandardExerciseService.create({
      name,
      nameEn,
      devisionId,
      machineType,
      trackingFieldId,
      jointType,
      targetMuscleIds
    })
    res.status(200).json()
  } catch (e) {
    if (e.message === 'ER_DUP_ENTRY') e.status = 409
    next(e)
  }
}

async function postStandardExercisesUpload(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    res.status(200).json()
  } catch (e) {
    if (e.message === 'ER_DUP_ENTRY') e.status = 409
    next(e)
  }
}

export {postStandardExercises, postStandardExercisesUpload}
