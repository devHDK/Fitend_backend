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
    404: {description: '이메일 또는 비밀번호 오류'}
  },
  handler: ctrl.postAuth
})

export {postAuth}
