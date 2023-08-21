import {ApiRouter} from '../../default'
import * as ctrl from './payroll-ctrl'

const getPayrollWithMonth = new ApiRouter({
  name: '',
  method: 'get',
  summary: '이달의 페이롤',
  tags: ['Payroll'],
  schema: 'requests/web/payroll/GetPayroll',
  responses: {
    200: {schema: 'responses/web/payroll/GetPayroll'}
  },
  handler: ctrl.getPayrollWithMonth
})

export {getPayrollWithMonth}
