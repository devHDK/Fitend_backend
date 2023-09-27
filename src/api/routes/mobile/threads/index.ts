import {ApiRouter} from '../../default'
import * as ctrl from './threads-ctrl'

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
