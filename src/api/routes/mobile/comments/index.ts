import {ApiRouter} from '../../default'
import * as ctrl from './comments-ctrl'

const postComments = new ApiRouter({
  name: '',
  method: 'post',
  summary: 'comments 생성',
  tags: ['Comment'],
  schema: 'requests/mobile/comments/PostComments',
  responses: {
    200: {description: 'Success'}
  },
  handler: ctrl.postComments
})

const getComments = new ApiRouter({
  name: '',
  method: 'get',
  summary: 'comments 목록 조회',
  tags: ['Comment'],
  schema: 'requests/mobile/comments/GetComments',
  responses: {
    200: {schema: 'responses/mobile/comments/GetComments'}
  },
  handler: ctrl.getComments
})

const putCommentsWithId = new ApiRouter({
  name: ':id',
  paths: ['common/IdPath'],
  method: 'put',
  summary: 'comments 수정',
  tags: ['Comment'],
  schema: 'requests/mobile/comments/PutCommentsWithId',
  responses: {
    200: {description: 'Success'}
  },
  handler: ctrl.putCommentsWithId
})

const deleteCommentsWithId = new ApiRouter({
  name: ':id',
  paths: ['common/IdPath'],
  method: 'delete',
  summary: 'comments 삭제',
  tags: ['Comment'],
  responses: {
    200: {description: 'Success'}
  },
  handler: ctrl.deleteCommentsWithId
})

export {postComments, getComments, putCommentsWithId, deleteCommentsWithId}
