import {Response} from 'express'
import {UserService} from '../../../../services'

async function postUsers(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {nickname, email, password, phone, birth, gender, memo} = req.options
    await UserService.create({franchiseId: req.franchiseId, nickname, email, password, phone, birth, gender, memo})
    res.status(200).json()
  } catch (e) {
    if (e.message === 'already_in_use') e.status = 409
    next(e)
  }
}

async function postUserInflowContents(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {userId, name, complete, memo} = req.options
    const ret = await UserService.createInflowContent({
      userId,
      name,
      complete,
      memo
    })
    res.status(200).json(ret)
  } catch (e) {
    next(e)
  }
}

async function postUserBodySpecs(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {id, height, weight} = req.options
    await UserService.createUserBodySpec({
      userId: id,
      height,
      weight
    })
    res.status(200).json()
  } catch (e) {
    next(e)
  }
}

async function postUserPreSurvey(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {experience, purpose, achievement, obstacle, place, preferDays} = req.options
    await UserService.createPreSurvey({
      userId: req.options.id,
      experience,
      purpose,
      achievement,
      obstacle,
      place,
      preferDays
    })
    res.status(200).json()
  } catch (e) {
    next(e)
  }
}

async function getUsers(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {search, status, trainerId, start, perPage} = req.options
    const ret = await UserService.findAllForTrainer({
      franchiseId: req.franchiseId,
      start,
      perPage,
      search,
      status,
      trainerId
    })
    res.status(200).json(ret)
  } catch (e) {
    next(e)
  }
}

async function getUsersInflow(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {trainerId} = req.options
    const ret = await UserService.findAllInflowForTrainer({
      franchiseId: req.franchiseId,
      trainerId
    })
    res.status(200).json(ret)
  } catch (e) {
    next(e)
  }
}

async function getUsersWorkouts(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {trainerId, startDate, interval} = req.options
    const ret = await UserService.findAllUsersWorkout({
      franchiseId: req.franchiseId,
      startDate,
      interval,
      trainerId
    })
    res.status(200).json(ret)
  } catch (e) {
    next(e)
  }
}

async function getUsersWithId(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const ret = await UserService.findOneWithId(req.options.id)
    res.status(200).json(ret)
  } catch (e) {
    next(e)
  }
}

async function getUsersBodySpecsWithId(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {id, start, perPage} = req.options
    const ret = await UserService.findBodySpecsWithId({id, start, perPage})
    res.status(200).json(ret)
  } catch (e) {
    next(e)
  }
}
async function putUsers(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {id, nickname, email, password, phone, birth, gender, memo} = req.options
    await UserService.update({id, nickname, email, password, phone, birth, gender, memo})
    res.status(200).json()
  } catch (e) {
    if (e.message === 'already_in_use') e.status = 409
    next(e)
  }
}

async function putUserMemo(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {id, memo} = req.options
    await UserService.update({id, memo})
    res.status(200).json()
  } catch (e) {
    if (e.message === 'already_in_use') e.status = 409
    next(e)
  }
}

async function PutUserInflowComplete(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {id} = req.options
    await UserService.updateInflowComplete({id})
    res.status(200).json()
  } catch (e) {
    next(e)
  }
}

async function putUsersInflowContent(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {id, name, complete, memo} = req.options
    await UserService.updateInflowContent({id, name, complete, memo})
    res.status(200).json()
  } catch (e) {
    next(e)
  }
}

async function putUserPreSurvey(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {experience, purpose, achievement, obstacle, place, preferDays} = req.options
    await UserService.updatePreSurvey({
      userId: req.options.id,
      experience,
      purpose,
      achievement,
      obstacle,
      place,
      preferDays
    })
    res.status(200).json()
  } catch (e) {
    next(e)
  }
}

async function deleteInflowContentWithId(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {id} = req.options
    await UserService.deleteInflowContentWithId({id})
    res.status(200).json()
  } catch (e) {
    next(e)
  }
}

export {
  postUsers,
  postUserInflowContents,
  postUserBodySpecs,
  postUserPreSurvey,
  getUsers,
  getUsersInflow,
  getUsersWorkouts,
  getUsersWithId,
  getUsersBodySpecsWithId,
  putUsers,
  putUserMemo,
  PutUserInflowComplete,
  putUsersInflowContent,
  putUserPreSurvey,
  deleteInflowContentWithId
}
