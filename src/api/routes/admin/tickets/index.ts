import {ApiRouter} from '../../default'
import * as ctrl from './tickets-ctrl'

const postTicketHoldings = new ApiRouter({
  name: ':id/ticketHoldings',
  method: 'post',
  summary: '수강권 holding 기간 생성',
  paths: ['common/IdPath'],
  tags: ['Tickets'],
  schema: 'requests/admin/tickets/PostTicketHoldings',
  responses: {
    200: {description: 'success'},
    402: {description: 'past_date_error'},
    403: {description: 'date_overlap'},
    405: {description: 'future_ticket'}
  },
  handler: ctrl.postTicketHoldings
})

const getTickets = new ApiRouter({
  name: '',
  method: 'get',
  summary: '수강권 목록',
  tags: ['Tickets'],
  schema: 'requests/admin/tickets/GetTickets',
  responses: {
    200: {schema: 'responses/admin/tickets/GetTickets'}
  },
  handler: ctrl.getTickets
})

const getTicketsWithId = new ApiRouter({
  name: ':id',
  method: 'get',
  paths: ['common/IdPath'],
  summary: '수강권 상세',
  tags: ['Tickets'],
  responses: {
    200: {schema: 'responses/admin/tickets/GetTicketsWithId'},
    404: {description: 'not_found'}
  },
  handler: ctrl.getTicketsWithId
})

const putTicketsWithId = new ApiRouter({
  name: ':id',
  method: 'put',
  paths: ['common/IdPath'],
  summary: '수강권 수정',
  tags: ['Tickets'],
  schema: 'requests/admin/tickets/PutTicketsWithId',
  responses: {
    200: {description: 'success'},
    403: {description: 'not_allowed/세션수 확인'}
  },
  handler: ctrl.putTicketsWithId
})

const putTicketsRefund = new ApiRouter({
  name: 'refund/:id',
  method: 'put',
  paths: ['common/IdPath'],
  summary: '수강권 부분환불 => expiredAt 자동지정',
  tags: ['Tickets'],
  responses: {
    200: {description: 'success'},
    403: {description: 'not_allowed/FCticket이 아닙니다'}
  },
  handler: ctrl.putTicketsRefund
})

const putTicketHoldingWithId = new ApiRouter({
  name: 'ticketHoldings/:id',
  method: 'put',
  paths: ['common/IdPath'],
  summary: '수강권 holding 수정',
  tags: ['Tickets'],
  schema: 'requests/admin/tickets/PutTicketHoldingsWithId',
  responses: {
    200: {description: 'success'},
    403: {description: 'date_overlap'}
  },
  handler: ctrl.putTicketHoldingsWithId
})

const deleteTicketsWithId = new ApiRouter({
  name: ':id',
  method: 'delete',
  paths: ['common/IdPath'],
  summary: '수강권 삭제',
  tags: ['Tickets'],
  responses: {
    200: {description: 'success'},
    403: {description: 'last_ticket'}
  },
  handler: ctrl.deleteTicketsWithId
})

const deleteTicketHoldingsWithId = new ApiRouter({
  name: 'ticketHoldings/:id',
  method: 'delete',
  paths: ['common/IdPath'],
  summary: '수강권 holding 기간 삭제',
  tags: ['Tickets'],
  responses: {
    200: {description: 'success'}
  },
  handler: ctrl.deleteTicketHoldingsWithId
})

export {
  postTicketHoldings,
  getTickets,
  getTicketsWithId,
  putTicketsWithId,
  putTicketsRefund,
  putTicketHoldingWithId,
  deleteTicketsWithId,
  deleteTicketHoldingsWithId
}
