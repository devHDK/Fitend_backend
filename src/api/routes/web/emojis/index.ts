import {ApiRouter} from '../../default'
import * as ctrl from './emojis-ctrl'

const putEmojis = new ApiRouter({
  name: '',
  method: 'put',
  summary: '이모지 추가/삭제',
  tags: ['Emoji'],
  schema: 'requests/web/emojis/PutEmojis',
  responses: {
    200: {schema: 'responses/web/emojis/PutEmojis'}
  },
  handler: ctrl.putEmojis
})

export {putEmojis}
