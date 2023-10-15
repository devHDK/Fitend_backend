import {Response} from 'express'
import {EmojiService} from '../../../../services'

async function putEmojis(req: IRequest, res: Response, next: Function): Promise<void> {
  try {
    const {emoji, threadId, commentId} = req.options
    const emojiId = await EmojiService.updateEmoji({
      emoji,
      threadId,
      commentId,
      userId: req.userId
    })
    res.status(200).json(emojiId)
  } catch (e) {
    next(e)
  }
}

export {putEmojis}
