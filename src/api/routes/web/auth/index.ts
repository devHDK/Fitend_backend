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
    403: {description: '계정 상태를 확인해주세요'},
    404: {description: '이메일을 확인해주세요'},
    409: {description: '비밀번호를 확인해주세요'}
  },
  handler: ctrl.postAuth
})

const postAuthLogout = new ApiRouter({
  name: 'logout',
  method: 'post',
  summary: '로그아웃',
  tags: ['Auth'],
  schema: 'requests/web/auth/PostAuthLogout',
  responses: {
    200: {description: 'Success'}
  },
  handler: ctrl.postAuthLogout
})

const postAuthRefresh = new ApiRouter({
  name: 'refresh',
  method: 'post',
  summary: '만료 토큰 갱신(app)',
  tags: ['Auth'],
  schema: 'requests/web/auth/PostAuthRefresh',
  isPublic: true,
  responses: {
    200: {schema: 'responses/web/auth/PostAuthRefresh'},
    401: {description: '유효하지 않은 토큰입니다.'}
  },
  handler: ctrl.postAuthRefresh
})

const putAuthPassword = new ApiRouter({
  name: 'password',
  method: 'put',
  summary: '비밀번호 변경',
  tags: ['Auth'],
  schema: 'requests/web/auth/PutAuthPassword',
  responses: {
    200: {description: 'Success'},
    404: {description: '비밀번호 오류'}
  },
  handler: ctrl.putAuthPassword
})

export {postAuth, postAuthLogout, postAuthRefresh, putAuthPassword}
