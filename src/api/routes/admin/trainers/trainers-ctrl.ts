import {Response} from 'express'
import {TrainerService} from '../../../../services'

async function postTrainers(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {
      nickname,
      email,
      password,
      fcPercentage,
      instagram,
      meetingLink,
      shortIntro,
      intro,
      welcomeThreadContent,
      qualification,
      speciality,
      coachingStyle,
      favorite,
      profileImage,
      largeProfileImage,
      mainVisible,
      role,
      status
    } = req.options
    await TrainerService.create({
      nickname,
      email,
      password,
      fcPercentage,
      instagram,
      meetingLink,
      shortIntro,
      intro,
      welcomeThreadContent,
      qualification,
      speciality,
      coachingStyle,
      favorite,
      profileImage,
      largeProfileImage,
      mainVisible,
      role,
      status
    })
    res.status(200).json()
  } catch (e) {
    next(e)
  }
}

async function getTrainers(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {search, start, perPage} = req.options
    const ret = await TrainerService.findAllForAdmin({search, start, perPage})
    res.status(200).json(ret)
  } catch (e) {
    next(e)
  }
}

async function getTrainersWithId(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const ret = await TrainerService.findOneWithIdForAdmin(req.options.id)
    res.status(200).json(ret)
  } catch (e) {
    if (e.message === 'not_found') e.status = 404
    next(e)
  }
}

export {postTrainers, getTrainers, getTrainersWithId}
