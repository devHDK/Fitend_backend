import {ApiRouter} from '../../default'
import * as ctrl from './emojis-ctrl'

const putEmojis = new ApiRouter({
  name: '',
  method: 'put',
  summary: '이모지 추가/삭제',
  tags: ['Emoji'],
  schema: 'requests/mobile/emojis/PutEmojis',
  responses: {
    200: {description: 'success'}
  },
  handler: ctrl.putEmojis
})

export {putEmojis}
