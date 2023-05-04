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

const getUsersDelete = new ApiRouter({
  name: 'delete',
  method: 'get',
  summary: '탈퇴 회원 목록 조회',
  schema: 'requests/admin/users/GetUsersDelete',
  roles: ['master'],
  tags: ['Users'],
  responses: {
    200: {schema: 'responses/admin/users/GetUsersDelete'}
  },
  handler: ctrl.getUsersDelete
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

const getUsersPointsWithId = new ApiRouter({
  name: ':id/points',
  paths: ['common/IdPath'],
  method: 'get',
  schema: 'requests/admin/users/GetUsersPointsWithId',
  summary: '일반 회원 상세 > 포인트 내역',
  roles: ['master'],
  tags: ['Users'],
  responses: {
    200: {schema: 'responses/admin/users/GetUsersPointsWithId'}
  },
  handler: ctrl.getUsersPointsWithId
})

const getUsersGifticonsWithId = new ApiRouter({
  name: ':id/gifticons',
  paths: ['common/IdPath'],
  method: 'get',
  schema: 'requests/admin/users/GetUsersGifticonsWithId',
  summary: '일반 회원 상세 > 구매 내역',
  roles: ['master'],
  tags: ['Users'],
  responses: {
    200: {schema: 'responses/admin/users/GetUsersGifticonsWithId'}
  },
  handler: ctrl.getUsersGifticonsWithId
})

const getUsersInquiriesWithId = new ApiRouter({
  name: ':id/inquiries',
  paths: ['common/IdPath'],
  method: 'get',
  schema: 'requests/admin/users/GetUsersInquiriesWithId',
  summary: '일반 회원 상세 > 1:1 문의',
  roles: ['master'],
  tags: ['Users'],
  responses: {
    200: {schema: 'responses/admin/users/GetUsersInquiriesWithId'}
  },
  handler: ctrl.getUsersInquiriesWithId
})

const putUsersStatus = new ApiRouter({
  name: ':id/status',
  paths: ['common/IdPath'],
  method: 'put',
  schema: 'requests/admin/users/PutUsersStatusWithId',
  summary: '일반 회원 상세 > 상태 변경',
  roles: ['master'],
  tags: ['Users'],
  responses: {
    200: {description: 'success'}
  },
  handler: ctrl.putUsersStatus
})

const putUsersPointsWithId = new ApiRouter({
  name: ':id/points',
  paths: ['common/IdPath'],
  method: 'put',
  schema: 'requests/admin/users/PutUsersPointsWithId',
  summary: '일반 회원 상세 > 포인트 내역',
  roles: ['master'],
  tags: ['Users'],
  responses: {
    200: {description: 'success'}
  },
  handler: ctrl.putUsersPointsWithId
})

// const getUsersMissionsWithId = new ApiRouter({
//   name: ':id/missions',
//   paths: ['common/IdPath'],
//   method: 'get',
//   schema: 'requests/admin/users/GetUsersMissionsWithId',
//   summary: '일반 회원 상세 > 미션 목록',
//   roles: ['master'],
//   tags: ['Users'],
//   responses: {
//     200: {schema: 'responses/admin/users/GetUsersMissionsWithId'}
//   },
//   handler: ctrl.getUsersMissionsWithId
// })

export {
  getUsers,
  getUsersDelete,
  getUsersWithId,
  getUsersPointsWithId,
  getUsersGifticonsWithId,
  getUsersInquiriesWithId,
  putUsersStatus,
  putUsersPointsWithId
}
