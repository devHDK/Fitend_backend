import {ApiRouter} from '../../default'
import * as ctrl from './payroll-ctrl'

const postPayroll = new ApiRouter({
  name: '',
  method: 'post',
  summary: '페이롤 저장',
  tags: ['Payroll'],
  schema: 'requests/admin/payroll/PostPayroll',
  responses: {
    200: {description: 'success'},
    409: {description: 'payroll_duplicate'}
  },
  handler: ctrl.postPayroll
})

const getPayrollWithMonth = new ApiRouter({
  name: '',
  method: 'get',
  summary: '이달의 매출',
  tags: ['Payroll'],
  schema: 'requests/admin/payroll/GetPayroll',
  responses: {
    200: {schema: 'responses/admin/payroll/GetPayroll'}
  },
  handler: ctrl.getPayrollWithMonth
})

const getPayrollWithTrainerId = new ApiRouter({
  name: 'trainer',
  method: 'get',
  summary: '이달의 트레이너 페이롤',
  tags: ['Payroll'],
  schema: 'requests/admin/payroll/GetPayrollWithTrainerId',
  responses: {
    200: {schema: 'responses/admin/payroll/GetPayrollWithTrainerId'}
  },
  handler: ctrl.getPayrollWithTrainerId
})

const putPayrollWithTrainerId = new ApiRouter({
  name: 'trainer/:id',
  method: 'put',
  paths: ['common/IdPath'],
  summary: '저장된 트레이너 페이롤 수정',
  tags: ['Payroll'],
  schema: 'requests/admin/payroll/PutPayrollWithTrainerId',
  responses: {
    200: {description: 'success'},
    404: {description: '저장되지 않은 페이롤입니다.'}
  },
  handler: ctrl.putPayrollWithTrainerId
})

export {postPayroll, getPayrollWithMonth, getPayrollWithTrainerId, putPayrollWithTrainerId}
