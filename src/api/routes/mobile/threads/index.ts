import {ApiRouter} from '../../default'
import * as ctrl from './threads-ctrl'

const postThreads = new ApiRouter({
  name: '',
  method: 'get',
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

export {getThreads}
