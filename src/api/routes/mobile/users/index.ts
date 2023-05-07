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

const getOne = new ApiRouter({
  name: ':id',
  method: 'get',
  summary: '회원 조회',
  tags: ['Users'],
  schema: 'requests/mobile/users/GetOne',
  responses: {
    200: {schema: 'responses/mobile/users/GetOne'}
  },
  handler: ctrl.getOne
})

export {createUser, getOne}
