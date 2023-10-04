import {Response} from 'express'
import {ThreadService} from '../../../../services'

async function postThreads(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {trainerId, title, content, gallery} = req.options
    const ret = await ThreadService.create({
      userId: req.userId,
      trainerId,
      writerType: 'user',
      type: 'general',
      title,
      content,
      gallery: gallery ? JSON.stringify(gallery) : null
    })
    res.status(200).json(ret)
  } catch (e) {
    next(e)
  }
}

async function getThreads(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {start, perPage} = req.options
    const ret = await ThreadService.findAll({userId: req.userId, start, perPage})
    res.status(200).json(ret)
  } catch (e) {
    next(e)
  }
}

export {postThreads, getThreads}
