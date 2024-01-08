import {ApiRouter} from '../../default'
import * as ctrl from './auth-ctrl'

const postAuth = new ApiRouter({
  name: 'login',
  method: 'post',
  summary: '로그인',
  tags: ['Auth'],
  schema: 'requests/mobile/auth/PostAuth',
  isPublic: true,
  responses: {
    200: {schema: 'responses/mobile/auth/PostAuth'},
    403: {description: '접근 권한이 없는 회원입니다.'},
    404: {description: '이메일을 확인해주세요.'},
    409: {description: '비밀번호를 확인해주세요.'}
  },
  handler: ctrl.postAuth
})

const postAuthLogout = new ApiRouter({
  name: 'logout',
  method: 'post',
  summary: '로그아웃',
  tags: ['Auth'],
  schema: 'requests/mobile/auth/PostAuthLogout',
  responses: {
    200: {description: 'Success'}
  },
  handler: ctrl.postAuthLogout
})

const postAuthRefresh = new ApiRouter({
  name: 'refresh',
  method: 'post',
  summary: '만료 토큰 갱신',
  tags: ['Auth'],
  schema: 'requests/mobile/auth/PostAuthRefresh',
  isPublic: true,
  responses: {
    200: {schema: 'responses/mobile/auth/PostAuthRefresh'},
    401: {description: '유효하지 않은 토큰입니다.'}
  },
  handler: ctrl.postAuthRefresh
})

export {postAuth, postAuthLogout, postAuthRefresh}
