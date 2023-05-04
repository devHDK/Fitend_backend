import request from 'supertest'
import {express as server} from '../../../src/loaders'

describe('카테고리 관리 API', function () {
  it('카테고리 리스트 조회', async function () {
    await request(server).get('/api/mobile/categories').send({type: 'ad'}).expect(200)
  })
})
