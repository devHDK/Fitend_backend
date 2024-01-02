import {ApiRouter} from '../../default'
import * as ctrl from './products-ctrl'

const getProducts = new ApiRouter({
  name: '',
  method: 'get',
  summary: '상품 목록 조회',
  isPublic: true,
  tags: ['Products'],
  responses: {
    200: {schema: 'responses/mobile/products/GetProducts'}
  },
  handler: ctrl.getProducts
})

export {getProducts}
