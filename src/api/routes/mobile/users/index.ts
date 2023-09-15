import {ApiRouter} from '../../default'
import * as ctrl from './users-ctrl'

const postUsersPasswordConfirm = new ApiRouter({
  name: 'password/confirm',
  method: 'post',
  summary: '패스워드 확인',
  schema: 'requests/mobile/users/PostUsersPasswordConfirm',
  tags: ['Users'],
  responses: {
    200: {description: 'success'},
    404: {description: 'not_found'}
  },
  handler: ctrl.postUsersPasswordConfirm
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

const putFCMToken = new ApiRouter({
  name: 'fcmToken',
  method: 'put',
  summary: 'fcmToken update',
  schema: 'requests/mobile/users/PutFCMToken',
  tags: ['Users'],
  responses: {
    200: {description: 'success'}
  },
  handler: ctrl.putFCMToken
})

const putUsersPassword = new ApiRouter({
  name: 'password',
  method: 'put',
  summary: '비밀번호 변경',
  schema: 'requests/mobile/users/PutUsersPassword',
  tags: ['Users'],
  responses: {
    200: {description: 'success'}
  },
  handler: ctrl.putUsersPassword
})

export {postUsersPasswordConfirm, getMe, putFCMToken, putUsersPassword}
