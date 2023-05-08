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

export {createUser, getMe}
