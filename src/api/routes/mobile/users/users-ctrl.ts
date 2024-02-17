import {Response} from 'express'
import {AuthService, UserService} from '../../../../services'

async function postUserRegister(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {
      trainerId,
      height,
      weight,
      experience,
      purpose,
      achievement,
      obstacle,
      nickname,
      email,
      password,
      phone,
      birth,
      gender,
      place,
      preferDays
    } = req.options
    const ret = await AuthService.createAccountForUser({
      trainerId,
      height,
      weight,
      experience,
      purpose,
      achievement,
      obstacle,
      nickname,
      email,
      password,
      phone,
      birth,
      gender,
      place,
      preferDays
    })
    res.status(200).json(ret)
  } catch (e) {
    next(e)
  }
}

async function postUsersPasswordConfirm(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    await UserService.confirmPassword({id: req.userId, password: req.options.password})
    res.status(200).json()
  } catch (e) {
    if (e.message === 'not_found') e.status = 404
    next(e)
  }
}

async function postIsExist(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {email} = req.options

    await UserService.findOneIsExist({email})

    res.status(200).json()
  } catch (e) {
    if (e.message === 'already_in_use') e.status = 409

    next(e)
  }
}

async function postNextWorkoutSurvey(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {mondayDate, selectedDates, noSchedule} = req.options

    console.log(selectedDates)

    await UserService.createNextWorkoutSurvey({userId: req.userId, mondayDate, selectedDates, noSchedule})

    res.status(200).json()
  } catch (e) {
    next(e)
  }
}

async function getMe(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const user = await UserService.getMe({id: req.userId})
    res.status(200).json({user})
  } catch (e) {
    if (e.message === 'ticket_expired') e.status = 401
    if (e.message === 'no_token') e.status = 401
    next(e)
  }
}

async function getNextWorkoutSurvey(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {mondayDate} = req.options

    const ret = await UserService.findNextWeekSurvey(mondayDate, req.userId)

    res.status(200).json({data: ret})
  } catch (e) {
    next(e)
  }
}

async function putFCMToken(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    await UserService.updateFCMToken({
      userId: req.userId,
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

async function putUsersPassword(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {password, newPassword} = req.options
    await UserService.updatePassword({id: req.userId, password, newPassword})
    res.status(200).json()
  } catch (e) {
    if (e.message === 'not_found') e.status = 404
    next(e)
  }
}

export {
  postUserRegister,
  postUsersPasswordConfirm,
  postIsExist,
  postNextWorkoutSurvey,
  getMe,
  getNextWorkoutSurvey,
  putFCMToken,
  putUsersPassword
}
