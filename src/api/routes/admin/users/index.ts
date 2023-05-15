import {ApiRouter} from '../../default'
import * as ctrl from './users-ctrl'

const getUsers = new ApiRouter({
  name: '',
  method: 'get',
  summary: '일반 회원 목록 조회',
  schema: 'requests/admin/users/GetUsers',
  roles: ['master'],
  tags: ['Users'],
  responses: {
    200: {schema: 'responses/admin/users/GetUsers'}
  },
  handler: ctrl.getUsers
})

const getUsersWithId = new ApiRouter({
  name: ':id',
  paths: ['common/IdPath'],
  method: 'get',
  summary: '일반 회원 상세 조회',
  roles: ['master'],
  tags: ['Users'],
  responses: {
    200: {schema: 'responses/admin/users/GetUsersWithId'}
  },
  handler: ctrl.getUsersWithId
})

export {
  getUsers,
  getUsersWithId,
}
