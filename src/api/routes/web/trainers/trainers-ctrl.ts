import {Response} from 'express'
import {TrainerService} from '../../../../services'

async function getTrainers(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const ret = await TrainerService.findAll(req.franchiseId)
    res.status(200).json({data: ret})
  } catch (e) {
    next(e)
  }
}

async function getMe(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const trainer = await TrainerService.getMe({id: req.userId})
    res.status(200).json({trainer})
  } catch (e) {
    if (e.message === 'no_token') e.status = 401
    if (e.message === 'disable_user') e.status = 401
    next(e)
  }
}

async function getTrainerDetail(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const ret = await TrainerService.findOneWithIdForUser(req.userId)
    res.status(200).json(ret)
  } catch (e) {
    if (e.message === 'not_found') e.status = 404
    next(e)
  }
}

async function getTrainersMeetingBoundary(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const ret = await TrainerService.findTrainersMeetingBoundaryWithId(req.options.id)
    res.status(200).json(ret)
  } catch (e) {
    next(e)
  }
}

async function putFCMToken(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    await TrainerService.updateFCMToken({
      trainerId: req.userId,
      token: req.options.token,
      platform: req.options.platform,
      deviceId: req.options.deviceId
    })
    res.status(200).json()
  } catch (e) {
    if (e.message === 'ticket_expired') e.status = 401
    if (e.message === 'no_token') e.status = 401
    next(e)
  }
}

async function putTrainerMeetingBoundary(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {id, workStartTime, workEndTime} = req.options
    await TrainerService.updateMeetingBoundary({trainerId: id, workStartTime, workEndTime})
    res.status(200).json()
  } catch (e) {
    next(e)
  }
}

async function putTrainerDetail(req: IRequest, res: Response, next: Function): Promise<void> {
  const {
    nickname,
    email,
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
    bankInfo
  } = req.options
  try {
    await TrainerService.updateTrainerDetailForTrainer({
      id: req.userId,
      nickname,
      email,
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
      bankInfo
    })
    res.status(200).json()
  } catch (e) {
    next(e)
  }
}

export {
  getTrainers,
  getMe,
  getTrainerDetail,
  getTrainersMeetingBoundary,
  putFCMToken,
  putTrainerMeetingBoundary,
  putTrainerDetail
}
