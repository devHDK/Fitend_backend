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

const postTicketHoldings = new ApiRouter({
  name: ':id/ticketHoldings',
  method: 'post',
  summary: '수강권 holding 기간 생성',
  paths: ['common/IdPath'],
  tags: ['Ticket'],
  schema: 'requests/web/tickets/PostTicketHoldings',
  responses: {
    200: {description: 'success'},
    402: {description: 'past_date_error'},
    403: {description: 'date_overlap'}
  },
  handler: ctrl.postTicketHoldings
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
    200: {description: 'success'},
    403: {description: 'not_allowed/세션수 확인'}
  },
  handler: ctrl.putTicketsWithId
})

const putTicketHoldingWithId = new ApiRouter({
  name: 'ticketHoldings/:id',
  method: 'put',
  paths: ['common/IdPath'],
  summary: '수강권 holding 수정',
  tags: ['Ticket'],
  schema: 'requests/web/tickets/PutTicketsWithId',
  responses: {
    200: {description: 'success'},
    403: {description: 'not_allowed/세션수 확인'}
  },
  handler: ctrl.putTicketHoldingsWithId
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

const deleteTicketHoldingsWithId = new ApiRouter({
  name: 'ticketHoldings/:id',
  method: 'delete',
  paths: ['common/IdPath'],
  summary: '수강권 holding 기간 삭제',
  tags: ['Ticket'],
  responses: {
    200: {description: 'success'}
  },
  handler: ctrl.deleteTicketHoldingsWithId
})

export {
  postTickets,
  postTicketHoldings,
  getTickets,
  getTicketsWithId,
  putTicketsWithId,
  putTicketHoldingWithId,
  deleteTicketsWithId,
  deleteTicketHoldingsWithId
}
