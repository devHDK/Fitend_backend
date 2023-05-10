import {ApiRouter} from '../../default'
import * as ctrl from './auth-ctrl'

const postAuth = new ApiRouter({
  name: '',
  method: 'post',
  summary: '로그인',
  tags: ['Auth'],
  schema: 'requests/web/auth/PostAuth',
  isPublic: true,
  responses: {
    200: {schema: 'responses/web/auth/PostAuth'},
    404: {description: '이메일 또는 비밀번호를 확인해주세요.'}
  },
  handler: ctrl.postAuth
})

const postAuthRefresh = new ApiRouter({
  name: 'refresh',
  method: 'post',
  summary: '만료 토큰 갱신',
  tags: ['Auth'],
  schema: 'requests/web/auth/PostAuthRefresh',
  isPublic: true,
  responses: {
    200: {schema: 'responses/web/auth/PostAuthRefresh'},
    401: {description: '유효하지 않은 토큰입니다.'}
  },
  handler: ctrl.postAuthRefresh
})

export {
  postAuth,
  postAuthRefresh
}
