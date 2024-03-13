import {ApiRouter} from '../../default'
import * as ctrl from './payroll-ctrl'

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

export {getPayrollWithMonth, getPayrollWithTrainerId}
