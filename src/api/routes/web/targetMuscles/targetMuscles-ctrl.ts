import {Response} from "express"
import {TargetMuscleService} from "../../../../services"

async function getTargetMuscles(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const ret = await TargetMuscleService.findAll()
    res.status(200).json({data: ret})
  } catch (e) {
    next(e)
  }
}

export {
  getTargetMuscles
}
