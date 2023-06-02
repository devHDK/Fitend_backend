import {ApiRouter} from '../../default'
import * as ctrl from './tickets-ctrl'

const postTickets = new ApiRouter({
  name: '',
  method: 'post',
  summary: '수강권 생성',
  tags: ['Ticket'],
  schema: 'requests/web/tickets/PostTickets',
  responses: {
    200: {description: 'success'}
  },
  handler: ctrl.postTickets
})

const getTickets = new ApiRouter({
  name: '',
  method: 'get',
  summary: '수강권 목록',
  tags: ['Ticket'],
  schema: 'requests/web/tickets/GetTickets',
  responses: {
    200: {schema: 'responses/web/tickets/GetTickets'}
  },
  handler: ctrl.getTickets
})

const getTicketsWithId = new ApiRouter({
  name: ':id',
  method: 'get',
  paths: ['common/IdPath'],
  summary: '수강권 상세',
  tags: ['Ticket'],
  responses: {
    200: {schema: 'responses/web/tickets/GetTicketsWithId'},
    404: {description: 'not_found'}
  },
  handler: ctrl.getTicketsWithId
})

const putTicketsWithId = new ApiRouter({
  name: ':id',
  method: 'put',
  paths: ['common/IdPath'],
  summary: '수강권 수정',
  tags: ['Ticket'],
  schema: 'requests/web/tickets/PutTicketsWithId',
  responses: {
    200: {description: 'success'}
  },
  handler: ctrl.putTicketsWithId
})

const deleteTicketsWithId = new ApiRouter({
  name: ':id',
  method: 'delete',
  paths: ['common/IdPath'],
  summary: '수강권 삭제',
  tags: ['Ticket'],
  responses: {
    200: {description: 'success'}
  },
  handler: ctrl.deleteTicketsWithId
})

export {postTickets, getTickets, getTicketsWithId, putTicketsWithId, deleteTicketsWithId}
