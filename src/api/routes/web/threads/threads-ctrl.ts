import {Response} from 'express'
import {ThreadService} from '../../../../services'

async function postThreads(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {userId, title, content, gallery} = req.options
    const threadId = await ThreadService.create({
      userId,
      trainerId: req.userId,
      writerType: 'trainer',
      type: 'general',
      title,
      content,
      gallery: gallery && gallery.length > 0 ? JSON.stringify(gallery) : null
    })
    res.status(200).json(threadId)
  } catch (e) {
    next(e)
  }
}

async function getThreads(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {userId, start, perPage} = req.options
    const ret = await ThreadService.findAll({userId, start, perPage})
    res.status(200).json(ret)
  } catch (e) {
    next(e)
  }
}

async function getThreadsUsers(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {search, order} = req.options
    const ret = await ThreadService.findAllUsers({
      trainerId: req.userId,
      search,
      order
    })
    res.status(200).json({data: ret})
  } catch (e) {
    next(e)
  }
}

async function getThreadsWithId(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {id} = req.options
    const ret = await ThreadService.findOne(id)
    if (!ret) throw new Error('not_found')
    res.status(200).json(ret)
  } catch (e) {
    if (e.message === 'not_found') e.status = 404
    next(e)
  }
}

async function putThreadsWithId(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {id, title, content, gallery} = req.options
    await ThreadService.updateOneForTrainer({
      id,
      title,
      content,
      gallery: gallery ? JSON.stringify(gallery) : null
    })
    res.status(200).json()
  } catch (e) {
    next(e)
  }
}

async function putThreadsCheck(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {id, checked, commentChecked} = req.options
    await ThreadService.updateChecked({
      id,
      checked,
      commentChecked
    })
    res.status(200).json()
  } catch (e) {
    next(e)
  }
}

async function deleteThreadsWithId(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {id} = req.options
    await ThreadService.deleteOneForTrainer(id)
    res.status(200).json()
  } catch (e) {
    next(e)
  }
}

export {
  postThreads,
  getThreads,
  getThreadsUsers,
  getThreadsWithId,
  putThreadsWithId,
  putThreadsCheck,
  deleteThreadsWithId
}
