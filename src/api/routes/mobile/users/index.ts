import {ApiRouter} from '../../default'
import * as ctrl from './users-ctrl'

const getMe = new ApiRouter({
  name: 'getMe',
  method: 'get',
  summary: '토큰 유효성 확인용',
  tags: ['Users'],
  responses: {
    200: {schema: 'responses/mobile/users/GetMe'}
  },
  handler: ctrl.getMe
})

export {getMe}
