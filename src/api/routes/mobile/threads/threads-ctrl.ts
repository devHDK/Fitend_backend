import {Response} from 'express'
import {ThreadService} from '../../../../services'

async function postThreads(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {trainerId, title, content, gallery, isMeetingThread, isChangeDateThread} = req.options
    const threadId = await ThreadService.create({
      userId: req.userId,
      trainerId,
      writerType: 'user',
      type: 'general',
      title,
      content,
      gallery: gallery && gallery.length > 0 ? JSON.stringify(gallery) : null,
      isMeetingThread,
      isChangeDateThread
    })
    res.status(200).json(threadId)
  } catch (e) {
    next(e)
  }
}

async function postWelcomeThreads(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {id} = req.options
    const threadId = await ThreadService.createWelcomeThread({
      userId: req.userId,
      trainerId: id
    })
    res.status(200).json(threadId)
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
    await ThreadService.updateOne({
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

async function deleteThreadsWithId(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {id} = req.options
    await ThreadService.deleteOne(id)
    res.status(200).json()
  } catch (e) {
    next(e)
  }
}

export {postThreads, postWelcomeThreads, getThreads, getThreadsWithId, putThreadsWithId, deleteThreadsWithId}
