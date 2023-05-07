import {ApiRouter} from '../../default'
import * as ctrl from './users-ctrl'

const createUser = new ApiRouter({
  name: '',
  method: 'post',
  summary: '회원 생성',
  tags: ['Users'],
  isPublic: true,
  schema: 'requests/mobile/users/PostCreateUser',
  responses: {
    200: '회원 생성'
  },
  handler: ctrl.createUser
})

export {createUser}
