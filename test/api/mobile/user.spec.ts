import request from 'supertest'
import {expect} from 'chai'
import faker from 'faker'
import RandExp from 'randexp'
import {express as server} from '../../../src/loaders'
import {AuthRequest, login as userLogin} from './auth.spec'

describe('유저 관리 API', function () {
  it('이메일 중복 체크 성공', async function () {
    await request(server)
      .get('/api/mobile/verifications/email')
      .send({
        email: faker.internet.email()
      })
      .expect(200)
  })

  it('이메일 중복 체크 실패', async function () {
    await request(server)
      .get('/api/mobile/verifications/email')
      .send({
        email: 'user@example.com'
      })
      .expect(409)
  })

  it('닉네임 중복 체크 성공', async function () {
    await request(server)
      .get('/api/mobile/verifications/nickname')
      .send({
        nickname: faker.name.firstName()
      })
      .expect(200)
  })

  it('닉네임 중복 체크 실패', async function () {
    await request(server)
      .get('/api/mobile/verifications/nickname')
      .send({
        nickname: 'example'
      })
      .expect(409)
  })

  it('회원 가입 ', async function () {
    const email = faker.internet.email()
    const password = new RandExp('^[0-9a-zA-Z]{8,14}$').gen()
    const response = await request(server)
      .post('/api/mobile/users')
      .send({
        email,
        nickname: faker.name.firstName(),
        password,
        impUid: '',
        categoryIds: [1, 2],
        isMarketing: true
      })
      .expect(201)

    expect(response.body).to.have.property('accessToken')
    expect(response.body).to.have.property('refreshToken')
    expect(response.body).to.have.property('user')
    this.authRequest = new AuthRequest(email, password)
  })
  describe('유저 정보 API', function () {
    let agent
    before(async function () {
      const user = require('../../ingredients/TempUser.json')
      this.authRequest = new AuthRequest(user.email, user.password)
      await userLogin.call(this, agent)
    })
    it('유저 정보 조회', async function () {
      await request(server)
        .get('/api/mobile/users')
        .set('Authorization', `Bearer ${this.authResponse.accessToken}`)
        .expect(200)
    })
    it('유저 정보 수정', async function () {
      await request(server)
        .put('/api/mobile/users')
        .set('Authorization', `Bearer ${this.authResponse.accessToken}`)
        .send({nickname: faker.name.firstName(), gender: 'female'})
        .expect(200)
    })
    it('유저 비밀번호 재설정', async function () {
      await request(server)
        .put('/api/mobile/users/password')
        .set('Authorization', `Bearer ${this.authResponse.accessToken}`)
        .send({password: 12341234, newPassword: 12341234})
        .expect(200)
    })
  })
  // it('비밀변호 변경', async function () {
  //   const newPassword = new RandExp('^[0-9a-zA-Z!@#$%^&*()?+-_~=/]{6,40}$').gen()
  //   const response = await request(server)
  //     .put('/api/students/auth')
  //     .set('Authorization', `Bearer ${this.authResponse.accessToken}`)
  //     .send({
  //       password: this.authRequest.password,
  //       newPassword
  //     })
  //     .expect(200)
  //   expect(response.body).to.have.property('refreshToken')
  // })
  //
  // it('비밀변호 재설정', async function () {
  //   await request(server)
  //     .post('/api/students/auth/reset')
  //     .send({
  //       email: this.authRequest.email
  //     })
  //     .expect(204)
  // })
  //
  // it('회원탈퇴', async function () {
  //   await request(server)
  //     .delete('/api/students/users')
  //     .set('Authorization', `Bearer ${this.authResponse.accessToken}`)
  //     .send()
  //     .expect(204)
  // })
})
