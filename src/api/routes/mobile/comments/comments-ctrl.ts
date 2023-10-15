import {Response} from 'express'
import {CommentService} from '../../../../services'

async function postComments(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {threadId, content, gallery} = req.options
    const commentId = await CommentService.create({
      userId: req.userId,
      threadId,
      content,
      gallery: gallery ? JSON.stringify(gallery) : null
    })
    console.log(commentId)
    res.status(200).json(commentId)
  } catch (e) {
    next(e)
  }
}

async function getComments(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {threadId} = req.options
    const ret = await CommentService.findAll(threadId)
    console.log(ret)
    res.status(200).json({data: ret})
  } catch (e) {
    next(e)
  }
}

async function putCommentsWithId(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {id, content, gallery} = req.options
    await CommentService.updateOne({
      id,
      content,
      gallery: gallery ? JSON.stringify(gallery) : null
    })
    res.status(200).json()
  } catch (e) {
    next(e)
  }
}

async function deleteCommentsWithId(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {id} = req.options
    await CommentService.deleteOne(id)
    res.status(200).json()
  } catch (e) {
    next(e)
  }
}

export {postComments, getComments, putCommentsWithId, deleteCommentsWithId}
