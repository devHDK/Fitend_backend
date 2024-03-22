import {ApiRouter} from '../../default'
import * as ctrl from './users-ctrl'

const getUsers = new ApiRouter({
  name: '',
  method: 'get',
  summary: '일반 회원 목록 조회',
  schema: 'requests/admin/users/GetUsers',
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
  tags: ['Users'],
  responses: {
    200: {schema: 'responses/admin/users/GetUsersWithId'}
  },
  handler: ctrl.getUsersWithId
})

const getUsersBodySpecsWithId = new ApiRouter({
  name: ':id/bodySpec',
  method: 'get',
  paths: ['common/IdPath'],
  summary: '회원 bodySpec 조회',
  tags: ['Users'],
  schema: 'requests/admin/users/GetUsersBodySpecsWithId',
  responses: {
    200: {schema: 'responses/admin/users/GetUsersBodySpecsWithId'}
  },
  handler: ctrl.getUsersBodySpecsWithId
})

const putUsers = new ApiRouter({
  name: ':id',
  method: 'put',
  paths: ['common/IdPath'],
  summary: '회원수정',
  tags: ['Users'],
  schema: 'requests/admin/users/PutUsers',
  responses: {
    200: {description: 'success'},
    409: {description: '이메일 또는 휴대폰번호 중복'}
  },
  handler: ctrl.putUsers
})

export {getUsers, getUsersWithId, getUsersBodySpecsWithId, putUsers}
