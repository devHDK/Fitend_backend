import {Response} from 'express'
import {EmojiService} from '../../../../services'

async function putEmojis(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {emoji, threadId, commentId} = req.options
    await EmojiService.updateEmoji({
      emoji,
      threadId,
      commentId,
      trainerId: req.userId
    })
    res.status(200).json()
  } catch (e) {
    next(e)
  }
}

export {putEmojis}
