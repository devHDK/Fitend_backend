import {ApiRouter} from '../../default'
import * as ctrl from './users-ctrl'

const postUsers = new ApiRouter({
  name: '',
  method: 'post',
  summary: '회원생성',
  tags: ['User'],
  schema: 'requests/web/users/PostUsers',
  responses: {
    200: {description: 'success'}
  },
  handler: ctrl.postUsers
})

const getUsers = new ApiRouter({
  name: '',
  method: 'get',
  summary: '회원목록',
  tags: ['User'],
  schema: 'requests/web/users/GetUsers',
  responses: {
    200: {schema: 'responses/web/users/GetUsers'}
  },
  handler: ctrl.getUsers
})

export {
  getUsers,
  postUsers
}
