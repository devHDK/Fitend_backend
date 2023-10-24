import {ApiRouter} from '../../default'
import * as ctrl from './threads-ctrl'

const postThreads = new ApiRouter({
  name: '',
  method: 'post',
  summary: 'Threads 생성',
  tags: ['Thread'],
  schema: 'requests/mobile/threads/PostThreads',
  responses: {
    200: {schema: 'responses/mobile/threads/PostThreads'}
  },
  handler: ctrl.postThreads
})

const getThreads = new ApiRouter({
  name: '',
  method: 'get',
  summary: 'Threads 목록 조회',
  tags: ['Thread'],
  schema: 'requests/mobile/threads/GetThreads',
  responses: {
    200: {schema: 'responses/mobile/threads/GetThreads'}
  },
  handler: ctrl.getThreads
})

const getThreadsWithId = new ApiRouter({
  name: ':id',
  paths: ['common/IdPath'],
  method: 'get',
  summary: 'Threads 상세 조회',
  tags: ['Thread'],
  responses: {
    200: {schema: 'responses/mobile/threads/GetThreadsWithId'},
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
  schema: 'requests/mobile/threads/PutThreadsWithId',
  responses: {
    200: {description: 'Success'}
  },
  handler: ctrl.putThreadsWithId
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

export {postThreads, getThreads, getThreadsWithId, putThreadsWithId, deleteThreadsWithId}
