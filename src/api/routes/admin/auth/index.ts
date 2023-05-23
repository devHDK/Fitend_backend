import {ApiRouter} from '../../default'
import * as ctrl from './auth-ctrl'

const postAuth = new ApiRouter({
  name: '',
  method: 'post',
  summary: '로그인',
  tags: ['Auth'],
  schema: 'requests/admin/auth/PostAuth',
  isPublic: true,
  responses: {
    200: {schema: 'responses/admin/auth/PostAuth'},
    404: {description: '이메일 또는 비밀번호 오류'}
  },
  handler: ctrl.postAuth
})

export {postAuth}
