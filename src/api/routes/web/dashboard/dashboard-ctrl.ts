import {Response} from 'express'
import {DashboardService} from '../../../../services'

async function getDashboardActiveUsers(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const ret = await DashboardService.findActiveUsers(req.franchiseId, req.options.trainerId)
    res.status(200).json(ret)
  } catch (e) {
    next(e)
  }
}

async function getDashboardSessions(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const ret = await DashboardService.findSessions(req.franchiseId, req.options.trainerId)
    res.status(200).json(ret)
  } catch (e) {
    next(e)
  }
}

async function getDashboardWorkoutToday(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const ret = await DashboardService.findAllWorkoutToday(req.franchiseId, req.options.today, req.options.trainerId)
    res.status(200).json({data: ret})
  } catch (e) {
    next(e)
  }
}

async function getDashboardWorkoutYesterday(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const ret = await DashboardService.findAllWorkoutYesterday(
      req.franchiseId,
      req.options.today,
      req.options.trainerId
    )
    res.status(200).json({data: ret})
  } catch (e) {
    next(e)
  }
}

async function getDashboardWorkoutUsers(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const ret = await DashboardService.findAllWorkoutUsers(req.franchiseId, req.options.today, req.options.trainerId)
    res.status(200).json({data: ret})
  } catch (e) {
    next(e)
  }
}

async function getDashboardExpiredThreeSessions(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const ret = await DashboardService.findExpiredThreeSessions(req.franchiseId, req.options.trainerId)
    res.status(200).json({data: ret})
  } catch (e) {
    next(e)
  }
}

export {
  getDashboardActiveUsers,
  getDashboardSessions,
  getDashboardWorkoutToday,
  getDashboardWorkoutYesterday,
  getDashboardWorkoutUsers,
  getDashboardExpiredThreeSessions
}
