import {ApiRouter} from '../../default'
import * as ctrl from './threads-ctrl'

const postThreads = new ApiRouter({
  name: '',
  method: 'post',
  summary: 'Threads 생성',
  tags: ['Thread'],
  schema: 'requests/web/threads/PostThreads',
  responses: {
    200: {schema: 'responses/web/threads/PostThreads'}
  },
  handler: ctrl.postThreads
})

const getThreads = new ApiRouter({
  name: '',
  method: 'get',
  summary: 'Threads 목록 조회',
  tags: ['Thread'],
  schema: 'requests/web/threads/GetThreads',
  responses: {
    200: {schema: 'responses/web/threads/GetThreads'}
  },
  handler: ctrl.getThreads
})

const getThreadsUsers = new ApiRouter({
  name: 'users',
  method: 'get',
  summary: 'Threads 유저 목록 조회',
  tags: ['Thread'],
  schema: 'requests/web/threads/GetThreadsUsers',
  responses: {
    200: {schema: 'responses/web/threads/GetThreadsUsers'}
  },
  handler: ctrl.getThreadsUsers
})

const getThreadsWithId = new ApiRouter({
  name: ':id',
  paths: ['common/IdPath'],
  method: 'get',
  summary: 'Threads 상세 조회',
  tags: ['Thread'],
  responses: {
    200: {schema: 'responses/web/threads/GetThreadsWithId'},
    404: {description: 'not_found'}
  },
  handler: ctrl.getThreadsWithId
})

const putThreadsWithId = new ApiRouter({
  name: ':id',
  paths: ['common/IdPath'],
  method: 'put',
  summary: 'Threads 수정',
  tags: ['Thread'],
  schema: 'requests/web/threads/PutThreadsWithId',
  responses: {
    200: {description: 'Success'}
  },
  handler: ctrl.putThreadsWithId
})

const putThreadsCheck = new ApiRouter({
  name: ':id/check',
  paths: ['common/IdPath'],
  method: 'put',
  summary: '스레드 및 댓글 읽음처리',
  tags: ['Thread'],
  schema: 'requests/web/threads/PutThreadsCheck',
  responses: {
    200: {description: 'Success'}
  },
  handler: ctrl.putThreadsCheck
})

const deleteThreadsWithId = new ApiRouter({
  name: ':id',
  paths: ['common/IdPath'],
  method: 'delete',
  summary: 'Threads 삭제',
  tags: ['Thread'],
  responses: {
    200: {description: 'Success'}
  },
  handler: ctrl.deleteThreadsWithId
})

export {
  postThreads,
  getThreads,
  getThreadsUsers,
  getThreadsWithId,
  putThreadsWithId,
  putThreadsCheck,
  deleteThreadsWithId
}
