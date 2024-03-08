import {Response} from 'express'
import {DashboardService} from '../../../../services'

async function getDashboardActiveUsers(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const ret = await DashboardService.findActiveUsers({franchiseId: 1})
    res.status(200).json(ret)
  } catch (e) {
    next(e)
  }
}

export {getDashboardActiveUsers}
