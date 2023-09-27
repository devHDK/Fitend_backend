import {Response} from 'express'
import {ThreadService} from '../../../../services'

async function getThreads(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {start, perPage} = req.options
    const ret = await ThreadService.findAll({userId: req.userId, start, perPage})
    res.status(200).json(ret)
  } catch (e) {
    next(e)
  }
}

export {getThreads}
