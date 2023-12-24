import {ApiRouter} from '../../default'
import * as ctrl from './users-ctrl'

const postUsers = new ApiRouter({
  name: '',
  method: 'post',
  summary: '회원생성',
  tags: ['User'],
  schema: 'requests/web/users/PostUsers',
  responses: {
    200: {description: 'success'},
    409: {description: '이메일 또는 휴대폰번호 중복'}
  },
  handler: ctrl.postUsers
})

const postUsersInflow = new ApiRouter({
  name: 'inflow',
  method: 'post',
  summary: 'inflowContent 생성',
  tags: ['User'],
  schema: 'requests/web/users/PostUserInflowContents',
  responses: {
    200: {schema: 'responses/web/users/PostUserInflowContents'}
  },
  handler: ctrl.postUserInflowContents
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

const getUsersInflow = new ApiRouter({
  name: 'inflow',
  method: 'get',
  summary: '유입관리 회원목록',
  tags: ['User'],
  schema: 'requests/web/users/GetUsersInflow',
  responses: {
    200: {schema: 'responses/web/users/GetUsersInflow'}
  },
  handler: ctrl.getUsersInflow
})

const getUsersWorkout = new ApiRouter({
  name: 'workout',
  method: 'get',
  summary: '회원목록 + 운동스케줄',
  tags: ['User'],
  schema: 'requests/web/users/GetUsersWorkout',
  responses: {
    200: {schema: 'responses/web/users/GetUserWorkouts'}
  },
  handler: ctrl.getUsersWorkouts
})

const getUsersWithId = new ApiRouter({
  name: ':id',
  method: 'get',
  paths: ['common/IdPath'],
  summary: '회원상세',
  tags: ['User'],
  responses: {
    200: {schema: 'responses/web/users/GetUsersWithId'}
  },
  handler: ctrl.getUsersWithId
})

const putUsers = new ApiRouter({
  name: ':id',
  method: 'put',
  paths: ['common/IdPath'],
  summary: '회원수정',
  tags: ['User'],
  schema: 'requests/web/users/PutUsers',
  responses: {
    200: {description: 'success'},
    409: {description: '이메일 또는 휴대폰번호 중복'}
  },
  handler: ctrl.putUsers
})

const putUsersInflowContent = new ApiRouter({
  name: 'inflow/:id',
  method: 'put',
  paths: ['common/IdPath'],
  summary: '회원 inflowContent 수정',
  tags: ['User'],
  schema: 'requests/web/users/PutUserInflowContents',
  responses: {
    200: {description: 'success'}
  },
  handler: ctrl.putUsersInflowContent
})

const putUsersInflowComplete = new ApiRouter({
  name: 'inflowComplete/:id',
  method: 'put',
  paths: ['common/IdPath'],
  summary: '회원 유입 플로우 완료',
  tags: ['User'],
  responses: {
    200: {description: 'success'}
  },
  handler: ctrl.PutUserInflowComplete
})

const deleteUsersInflowContent = new ApiRouter({
  name: 'inflow/:id',
  method: 'delete',
  paths: ['common/IdPath'],
  summary: '회원 inflowContent 삭제',
  tags: ['User'],
  responses: {
    200: {description: 'success'}
  },
  handler: ctrl.deleteInflowContentWithId
})

export {
  postUsers,
  postUsersInflow,
  getUsers,
  getUsersInflow,
  getUsersWorkout,
  getUsersWithId,
  putUsers,
  putUsersInflowContent,
  putUsersInflowComplete,
  deleteUsersInflowContent
}
