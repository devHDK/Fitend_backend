import {ApiRouter} from '../../default'
import * as ctrl from './payroll-ctrl'

const getPayrollWithMonth = new ApiRouter({
  name: '',
  method: 'get',
  summary: '이달의 페이롤',
  tags: ['Payroll'],
  responses: {
    200: {message: 'responses/web/trainers/GetTrainers'}
  },
  handler: ctrl.getPayrollWithMonth
})

export {getPayrollWithMonth}
