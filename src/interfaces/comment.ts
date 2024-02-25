export interface IComment {
  id: number
  userId?: number
  trainerId: number
  threadId: number
  content: number
  gallery: {
    type: ['image', 'video']
    url: string
    thumbnail: string
  }
  user: {
    id: number
    nickname: string
    gender: ['male', 'female']
  }
  trainer: {
    id: number
    nickname: string
    profile: string
  }
  emojis: {
    id: number
    emoji: string
    userId: number
    trainerId: number
  }[]
  commentCount: number
  createdAt: Date
}

export interface ICommentOne {
  id: number
  userId?: number
  trainerId?: number
  threadId: number
  content: number
  gallery: {
    type: ['image', 'video']
    url: string
    thumbnail: string
  }

  updatedAt: Date
  createdAt: Date
}

export interface ICommentCreateOne {
  userId?: number
  trainerId?: number
  threadId: number
  content: string
  gallery?: string
}

export interface ICommentFindAll {
  threadId: number
}

export interface ICommentUpdateOne {
  id: number
  content: string
  gallery?: string
}

export interface ICommentPushType {
  tokens: string[]
  badge: number
  type: 'CommentCreate'
  contents: string
  data?: any
}
