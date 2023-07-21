import {Response} from 'express'
import {DashboardService} from '../../../../services'

async function getDashboardWorkoutToday(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const ret = await DashboardService.findAllWorkoutToday(req.franchiseId, req.options.today)
    res.status(200).json({data: ret})
  } catch (e) {
    next(e)
  }
}

async function getDashboardWorkoutYesterday(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const ret = await DashboardService.findAllWorkoutYesterday(req.franchiseId, req.options.today)
    res.status(200).json({data: ret})
  } catch (e) {
    next(e)
  }
}

async function getDashboardActiveUsers(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const ret = await DashboardService.findActiveUsers(req.franchiseId)
    res.status(200).json(ret)
  } catch (e) {
    next(e)
  }
}

async function getDashboardWorkoutUsers(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const ret = await DashboardService.findAllWorkoutUsers(req.franchiseId, req.options.today)
    res.status(200).json({data: ret})
  } catch (e) {
    next(e)
  }
}

export {getDashboardWorkoutToday, getDashboardWorkoutYesterday, getDashboardActiveUsers, getDashboardWorkoutUsers}
