'use strict'

import test from 'ava'
import micro from 'micro'
import listen from 'test-listen'
import request from 'request-promise'
import fixtures from './fixtures'
import users from '../users'
import utils from '../lib/utils'
import config from '../config'

test.beforeEach(async t => {
  let srv = micro(users)
  t.context.url = await listen(srv)
})

test('POST /', async t => {
  let user = fixtures.getUser()
  let url = t.context.url

  let options = {
    method: 'POST',
    uri: url,
    json: true,
    body: {
      userName: user.userName,
      fullName: user.fullName,
      password: user.password,
      avatar: user.avatar
    },
    resolveWithFullResponse: true
  }

  let response = await request(options)

  t.is(response.statusCode, 201)
  t.deepEqual(response.body, undefined)
})

test('GET /:id', async t => {
  let user = fixtures.getUser()
  let url = t.context.url
  let token = await utils.signToken({ userName: user.userName }, config.secret)

  let options = {
    method: 'GET',
    uri: `${url}/${user.id}`,
    json: true,
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }

  let body = await request(options)

  t.is(body.userName, user.userName)
  t.is('password' in body, false)
})
