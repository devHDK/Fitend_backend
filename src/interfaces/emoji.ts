export interface IEmoji {
  id: number
  emoji: string
}

export interface IEmojiThread {
  emojiId: number
  threadId: number
  userId?: number
  trainerId?: number
}

export interface IEmojiComment {
  emojiId: number
  commentId: number
  userId?: number
  trainerId?: number
}